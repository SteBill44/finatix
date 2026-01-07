import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Download, Search, Trash2, Mail, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface InterestRegistration {
  id: string;
  email: string;
  full_name: string | null;
  course_id: string | null;
  created_at: string;
  course?: {
    title: string;
    slug: string;
  } | null;
}

interface Course {
  id: string;
  title: string;
  slug: string;
}

const InterestManagement = () => {
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<InterestRegistration[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  useEffect(() => {
    fetchRegistrations();
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("id, title, slug")
      .order("title");

    if (!error && data) {
      setCourses(data);
    }
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("interest_registrations")
      .select(`
        id,
        email,
        full_name,
        course_id,
        created_at,
        courses:course_id (
          title,
          slug
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching registrations", description: error.message, variant: "destructive" });
    } else {
      // Transform the data to flatten the courses relationship
      const transformed = (data || []).map((reg: any) => ({
        ...reg,
        course: reg.courses,
      }));
      setRegistrations(transformed);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("interest_registrations")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error deleting registration", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Registration deleted" });
      fetchRegistrations();
    }
  };

  const handleExportCSV = () => {
    const filteredData = filteredRegistrations;
    const csvContent = [
      ["Email", "Name", "Course", "Registered At"].join(","),
      ...filteredData.map((reg) => [
        reg.email,
        reg.full_name || "",
        reg.course?.title || "General Interest",
        format(new Date(reg.created_at), "yyyy-MM-dd HH:mm"),
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interest-registrations-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch = 
      reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reg.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === "all" || reg.course_id === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  // Group by course for summary
  const courseSummary = registrations.reduce((acc, reg) => {
    const courseTitle = reg.course?.title || "General Interest";
    acc[courseTitle] = (acc[courseTitle] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Interest Registrations
            </CardTitle>
            <CardDescription>
              {registrations.length} total registrations
            </CardDescription>
          </div>
          <Button onClick={handleExportCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(courseSummary).slice(0, 4).map(([course, count]) => (
            <div key={course} className="bg-secondary/50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{count}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{course}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
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
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No registrations found
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell className="font-medium">{reg.email}</TableCell>
                    <TableCell>{reg.full_name || "-"}</TableCell>
                    <TableCell>
                      {reg.course ? (
                        <Badge variant="secondary">{reg.course.title}</Badge>
                      ) : (
                        <span className="text-muted-foreground">General</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(reg.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(reg.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
