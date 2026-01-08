import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Building2, Plus, Pencil, Trash2, Users, Loader2, Search } from "lucide-react";
import { format } from "date-fns";

interface CorporateAccount {
  id: string;
  company_name: string;
  contact_email: string;
  contact_name: string | null;
  phone: string | null;
  employee_count: number | null;
  status: string | null;
  notes: string | null;
  created_at: string | null;
}

interface CorporateEnrollment {
  id: string;
  user_id: string;
  corporate_account_id: string | null;
  enrolled_at: string | null;
  profile?: {
    full_name: string | null;
  } | null;
}

const CorporateManagement = () => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<CorporateAccount[]>([]);
  const [enrollments, setEnrollments] = useState<CorporateEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<CorporateAccount | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    company_name: "",
    contact_email: "",
    contact_name: "",
    phone: "",
    employee_count: 0,
    status: "pending",
    notes: "",
  });

  useEffect(() => {
    fetchAccounts();
    fetchEnrollments();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("corporate_accounts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching accounts", description: error.message, variant: "destructive" });
    } else {
      setAccounts(data || []);
    }
    setLoading(false);
  };

  const fetchEnrollments = async () => {
    const { data, error } = await supabase
      .from("corporate_enrollments")
      .select(`
        id,
        user_id,
        corporate_account_id,
        enrolled_at,
        profiles:user_id (
          full_name
        )
      `);

    if (!error && data) {
      const transformed = (data || []).map((e: any) => ({
        ...e,
        profile: e.profiles,
      }));
      setEnrollments(transformed);
    }
  };

  const handleSave = async () => {
    if (!form.company_name || !form.contact_email) {
      toast({ title: "Validation Error", description: "Company name and contact email are required.", variant: "destructive" });
      return;
    }

    const accountData = {
      company_name: form.company_name,
      contact_email: form.contact_email,
      contact_name: form.contact_name || null,
      phone: form.phone || null,
      employee_count: form.employee_count || null,
      status: form.status,
      notes: form.notes || null,
    };

    if (editingAccount) {
      const { error } = await supabase
        .from("corporate_accounts")
        .update(accountData)
        .eq("id", editingAccount.id);

      if (error) {
        toast({ title: "Error updating account", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account updated successfully" });
        fetchAccounts();
      }
    } else {
      const { error } = await supabase.from("corporate_accounts").insert(accountData);

      if (error) {
        toast({ title: "Error creating account", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account created successfully" });
        fetchAccounts();
      }
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("corporate_accounts").delete().eq("id", id);

    if (error) {
      toast({ title: "Error deleting account", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Account deleted successfully" });
      fetchAccounts();
    }
  };

  const handleEdit = (account: CorporateAccount) => {
    setEditingAccount(account);
    setForm({
      company_name: account.company_name,
      contact_email: account.contact_email,
      contact_name: account.contact_name || "",
      phone: account.phone || "",
      employee_count: account.employee_count || 0,
      status: account.status || "pending",
      notes: account.notes || "",
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingAccount(null);
    setForm({
      company_name: "",
      contact_email: "",
      contact_name: "",
      phone: "",
      employee_count: 0,
      status: "pending",
      notes: "",
    });
  };

  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case "active":
        return "default";
      case "pending":
        return "secondary";
      case "inactive":
        return "outline";
      default:
        return "secondary";
    }
  };

  const filteredAccounts = accounts.filter((account) =>
    account.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.contact_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEnrollmentCount = (accountId: string) => {
    return enrollments.filter(e => e.corporate_account_id === accountId).length;
  };

  // Summary stats
  const activeAccounts = accounts.filter(a => a.status === "active").length;
  const totalEmployees = accounts.reduce((sum, a) => sum + (a.employee_count || 0), 0);
  const totalEnrollments = enrollments.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Corporate Accounts
            </CardTitle>
            <CardDescription>
              Manage corporate training partnerships and enrollments
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg bg-background">
              <DialogHeader>
                <DialogTitle>{editingAccount ? "Edit Account" : "Add Corporate Account"}</DialogTitle>
                <DialogDescription>
                  {editingAccount ? "Update account details." : "Enter the corporate account information."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={form.company_name}
                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                    placeholder="Acme Corporation"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="contact_name">Contact Name</Label>
                    <Input
                      id="contact_name"
                      value={form.contact_name}
                      onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                      placeholder="John Smith"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contact_email">Contact Email *</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={form.contact_email}
                      onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                      placeholder="john@acme.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+1 234 567 890"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="employee_count">Employee Count</Label>
                    <Input
                      id="employee_count"
                      type="number"
                      value={form.employee_count}
                      onChange={(e) => setForm({ ...form, employee_count: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Additional notes about this account..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave}>{editingAccount ? "Update" : "Create"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-secondary/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{accounts.length}</p>
            <p className="text-xs text-muted-foreground">Total Accounts</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{activeAccounts}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{totalEmployees}</p>
            <p className="text-xs text-muted-foreground">Total Employees</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{totalEnrollments}</p>
            <p className="text-xs text-muted-foreground">Enrolled Users</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by company name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No corporate accounts found
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Enrolled</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{account.company_name}</p>
                        {account.phone && (
                          <p className="text-xs text-muted-foreground">{account.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{account.contact_name || "-"}</p>
                        <p className="text-xs text-muted-foreground">{account.contact_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {account.employee_count || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getEnrollmentCount(account.id)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(account.status)}>
                        {account.status || "pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {account.created_at ? format(new Date(account.created_at), "MMM d, yyyy") : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(account)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(account.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CorporateManagement;
