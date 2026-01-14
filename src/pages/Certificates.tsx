import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, Calendar, Eye, Search, ExternalLink, FileX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface Certificate {
  id: string;
  certificate_number: string;
  issued_at: string;
  course: {
    title: string;
    slug: string;
  };
}

const Certificates = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: certificates, isLoading } = useQuery({
    queryKey: ["user-certificates", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("certificates")
        .select(`
          id,
          certificate_number,
          issued_at,
          course:courses(title, slug)
        `)
        .eq("user_id", user.id)
        .order("issued_at", { ascending: false });

      if (error) throw error;
      return data as Certificate[];
    },
    enabled: !!user,
  });

  const cleanCourseName = (name: string) => {
    return name.replace(/^[A-Z]+\d+\s*[-–]\s*/i, "");
  };

  const filteredCertificates = certificates?.filter((cert) => {
    const query = searchQuery.toLowerCase();
    return (
      cert.certificate_number.toLowerCase().includes(query) ||
      cert.course.title.toLowerCase().includes(query)
    );
  });

  if (!user) {
    return (
      <Layout>
        <div className="container max-w-4xl pt-24 pb-12">
          <div className="text-center">
            <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Sign in to view your certificates
            </h1>
            <p className="text-muted-foreground mb-6">
              You need to be logged in to access your certificate gallery.
            </p>
            <Button onClick={() => navigate("/auth")}>Sign In</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl pt-24 pb-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            My Certificates
          </h1>
          <p className="text-muted-foreground">
            View and share your earned certificates
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by course name or certificate number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-9 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCertificates && filteredCertificates.length > 0 ? (
          <div className="grid gap-4">
            {filteredCertificates.map((cert) => (
              <Card
                key={cert.id}
                className="group hover:border-primary/50 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Award className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1 truncate">
                        {cleanCourseName(cert.course.title)}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(new Date(cert.issued_at), "MMM d, yyyy")}
                        </div>
                        <Badge variant="outline" className="text-xs font-mono">
                          {cert.certificate_number}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(`/verify?cert=${cert.certificate_number}`)
                        }
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <FileX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchQuery ? "No certificates found" : "No certificates yet"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Complete a course to earn your first certificate"}
              </p>
              {!searchQuery && (
                <Button onClick={() => navigate("/courses")}>
                  Browse Courses
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Verify another certificate link */}
        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/verify")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Verify another certificate
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Certificates;
