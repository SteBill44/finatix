import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppRole, useIsMasterAdmin } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Users, Shield, Eye, Crown, UserPlus } from "lucide-react";
import UserDetailSheet from "@/components/admin/UserDetailSheet";

interface UserWithRole {
  user_id: string;
  email: string;
  role: AppRole | null;
  created_at: string;
}

const UserManagement = () => {
  const { isMasterAdmin } = useIsMasterAdmin();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // User role state
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<AppRole>("user");

  // User detail sheet state
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<{ userId: string; role: AppRole | null } | null>(null);

  // Add role by search state
  const [addRoleDialogOpen, setAddRoleDialogOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ user_id: string; full_name: string | null }[]>([]);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState<string | null>(null);
  const [roleToAdd, setRoleToAdd] = useState<AppRole>("admin");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, full_name, created_at");

    if (profilesError) {
      toast({ title: "Error fetching users", description: profilesError.message, variant: "destructive" });
      setLoadingUsers(false);
      return;
    }

    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id, role");

    if (rolesError) {
      toast({ title: "Error fetching roles", description: rolesError.message, variant: "destructive" });
    }

    const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
      const userRole = roles?.find((r) => r.user_id === profile.user_id);
      return {
        user_id: profile.user_id,
        email: profile.full_name || "Unknown",
        role: userRole?.role || null,
        created_at: profile.created_at,
      };
    });

    setUsers(usersWithRoles);
    setLoadingUsers(false);
  };

  const handleAssignRole = async () => {
    if (!selectedUserId) return;

    const existingRole = users.find((u) => u.user_id === selectedUserId)?.role;

    if (existingRole) {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", selectedUserId);

      if (error) {
        toast({ title: "Error updating role", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Role updated successfully" });
        fetchUsers();
      }
    } else {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: selectedUserId, role: newRole });

      if (error) {
        toast({ title: "Error assigning role", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Role assigned successfully" });
        fetchUsers();
      }
    }

    setRoleDialogOpen(false);
    setSelectedUserId(null);
  };

  const handleRemoveRole = async (userId: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId);

    if (error) {
      toast({ title: "Error removing role", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Role removed successfully" });
      fetchUsers();
    }
  };

  // Search for users by name
  const handleUserSearch = async (query: string) => {
    setUserSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .ilike("full_name", `%${query}%`)
      .limit(10);

    if (!error && data) {
      setSearchResults(data);
    }
  };

  const handleAddRoleBySearch = async () => {
    if (!selectedUserToAdd) return;

    const { error } = await supabase
      .from("user_roles")
      .upsert({ user_id: selectedUserToAdd, role: roleToAdd }, { onConflict: "user_id,role" });

    if (error) {
      toast({ title: "Error assigning role", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Role assigned successfully" });
      fetchUsers();
    }

    setAddRoleDialogOpen(false);
    setUserSearchQuery("");
    setSearchResults([]);
    setSelectedUserToAdd(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users & Roles
            </CardTitle>
            <CardDescription>Manage user roles and permissions</CardDescription>
          </div>
          {isMasterAdmin && (
            <Dialog open={addRoleDialogOpen} onOpenChange={(open) => {
              setAddRoleDialogOpen(open);
              if (!open) {
                setUserSearchQuery("");
                setSearchResults([]);
                setSelectedUserToAdd(null);
              }
            }}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Assign Role
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-background">
                <DialogHeader>
                  <DialogTitle>Assign Role by Name</DialogTitle>
                  <DialogDescription>
                    Search for a user by name and assign them a role.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="user-search">Search User</Label>
                    <Input
                      id="user-search"
                      value={userSearchQuery}
                      onChange={(e) => handleUserSearch(e.target.value)}
                      placeholder="Type a name to search..."
                    />
                    {searchResults.length > 0 && (
                      <div className="border rounded-md max-h-40 overflow-y-auto">
                        {searchResults.map((result) => (
                          <div
                            key={result.user_id}
                            className={`p-2 cursor-pointer hover:bg-muted ${selectedUserToAdd === result.user_id ? "bg-muted" : ""}`}
                            onClick={() => setSelectedUserToAdd(result.user_id)}
                          >
                            {result.full_name || "Unknown"}
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedUserToAdd && (
                      <div className="text-sm text-muted-foreground">
                        Selected: {searchResults.find(r => r.user_id === selectedUserToAdd)?.full_name}
                      </div>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role-to-add">Role</Label>
                    <Select
                      value={roleToAdd}
                      onValueChange={(value: AppRole) => setRoleToAdd(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="master_admin">Master Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddRoleDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddRoleBySearch} disabled={!selectedUserToAdd}>
                    Assign Role
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <div className="text-center py-8 text-muted-foreground">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No users found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((userItem) => (
                  <TableRow 
                    key={userItem.user_id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      setSelectedUserForDetail({ userId: userItem.user_id, role: userItem.role });
                      setUserDetailOpen(true);
                    }}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        {userItem.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {userItem.role ? (
                        <Badge 
                          variant={userItem.role === "master_admin" || userItem.role === "admin" ? "default" : "secondary"} 
                          className={`flex items-center gap-1 w-fit ${userItem.role === "master_admin" ? "bg-amber-500 hover:bg-amber-600" : ""}`}
                        >
                          {userItem.role === "master_admin" && <Crown className="h-3 w-3" />}
                          {userItem.role === "admin" && <Shield className="h-3 w-3" />}
                          {userItem.role}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">No role</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(userItem.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      {isMasterAdmin && (
                        <>
                          <Dialog open={roleDialogOpen && selectedUserId === userItem.user_id} onOpenChange={(open) => {
                            setRoleDialogOpen(open);
                            if (!open) setSelectedUserId(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedUserId(userItem.user_id);
                                  setNewRole(userItem.role || "user");
                                }}
                              >
                                {userItem.role ? "Change Role" : "Assign Role"}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-background">
                              <DialogHeader>
                                <DialogTitle>Manage Role</DialogTitle>
                                <DialogDescription>
                                  Assign or update the role for this user.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                  value={newRole}
                                  onValueChange={(value: AppRole) => setNewRole(value)}
                                >
                                  <SelectTrigger className="mt-2">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-popover">
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="master_admin">Master Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleAssignRole}>Save</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          {userItem.role && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveRole(userItem.user_id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User Detail Sheet */}
      <UserDetailSheet
        userId={selectedUserForDetail?.userId || null}
        userRole={selectedUserForDetail?.role || null}
        open={userDetailOpen}
        onOpenChange={setUserDetailOpen}
      />
    </>
  );
};

export default UserManagement;
