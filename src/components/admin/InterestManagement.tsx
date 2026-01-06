import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Download, Search, Mail, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface InterestRegistration {
  id: string;
  email: string;
  full_name: string | null;
  course_id: string | null;
  created_at: string;
}

interface Course {
  id: string;
  title: string;
}

const InterestManagement = () => {
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<InterestRegistration[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    const [registrationsResult, coursesResult] = await Promise.all([
      supabase
        .from("interest_registrations")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("courses")
        .select("id, title")
        .order("title")
    ]);

    if (registrationsResult.error) {
      toast({ title: "Error fetching registrations", description: registrationsResult.error.message, variant: "destructive" });
    } else {
      setRegistrations(registrationsResult.data || []);
    }

    if (coursesResult.data) {
      setCourses(coursesResult.data);
    }

    setLoading(false);
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch = 
      reg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (reg.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    const matchesCourse = 
      courseFilter === "all" || 
      (courseFilter === "none" && !reg.course_id) ||
      reg.course_id === courseFilter;

    return matchesSearch && matchesCourse;
  });

  const getCourseTitle = (courseId: string | null) => {
    if (!courseId) return null;
    return courses.find((c) => c.id === courseId)?.title || "Unknown Course";
  };

  const exportToCSV = () => {
    const headers = ["Email", "Full Name", "Course", "Registered At"];
    const rows = filteredRegistrations.map((reg) => [
      reg.email,
      reg.full_name || "",
      getCourseTitle(reg.course_id) || "General Interest",
      format(new Date(reg.created_at), "yyyy-MM-dd HH:mm:ss")
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `interest-registrations-${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Export complete", description: `Exported ${filteredRegistrations.length} registrations to CSV` });
  };

  const copyEmails = () => {
    const emails = filteredRegistrations.map((reg) => reg.email).join(", ");
    navigator.clipboard.writeText(emails);
    toast({ title: "Emails copied", description: `${filteredRegistrations.length} emails copied to clipboard` });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Interest Registrations
            </CardTitle>
            <CardDescription>
              {registrations.length} total registrations • {filteredRegistrations.length} shown
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={copyEmails} disabled={filteredRegistrations.length === 0}>
              <Mail className="h-4 w-4 mr-1" />
              Copy Emails
            </Button>
            <Button size="sm" onClick={exportToCSV} disabled={filteredRegistrations.length === 0}>
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="none">General Interest</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading registrations...</div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {registrations.length === 0 
              ? "No interest registrations yet." 
              : "No registrations match your filters."}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Registered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell className="font-medium">{reg.email}</TableCell>
                    <TableCell>{reg.full_name || <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>
                      {reg.course_id ? (
                        <Badge variant="secondary" className="font-normal">
                          {getCourseTitle(reg.course_id)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">General</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(reg.created_at), "MMM d, yyyy")}
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

export default InterestManagement;
