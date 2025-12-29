import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  Clock, 
  Users, 
  Star, 
  BookOpen,
  BarChart3,
  Target,
  ArrowRight,
  Award,
  Loader2
} from "lucide-react";

interface Course {
  id: string;
  slug: string;
  title: string;
  level: string;
  description: string | null;
  price: number;
  duration_hours: number | null;
  image_url: string | null;
}

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("level", { ascending: true })
        .order("title", { ascending: true });
      
      if (error) throw error;
      return data as Course[];
    },
  });

  const levelConfig = {
    certificate: { label: "Certificate (CBA)", icon: Award, color: "bg-orange" },
    operational: { label: "Operational", icon: BookOpen, color: "bg-primary" },
    management: { label: "Management", icon: BarChart3, color: "bg-accent" },
    strategic: { label: "Strategic", icon: Target, color: "bg-purple" },
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === "all" || course.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  // Group courses by level
  const groupedCourses = {
    certificate: filteredCourses.filter(c => c.level === "certificate"),
    operational: filteredCourses.filter(c => c.level === "operational"),
    management: filteredCourses.filter(c => c.level === "management"),
    strategic: filteredCourses.filter(c => c.level === "strategic"),
  };

  const levelOrder = ["certificate", "operational", "management", "strategic"] as const;

  const getLevelBadgeStyle = (level: string) => {
    switch (level) {
      case "certificate": return "bg-orange/10 text-orange";
      case "operational": return "bg-primary/10 text-primary";
      case "management": return "bg-accent/10 text-accent";
      case "strategic": return "bg-purple/10 text-purple";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getLevelBorderColor = (level: string) => {
    switch (level) {
      case "certificate": return "border-l-orange";
      case "operational": return "border-l-primary";
      case "management": return "border-l-accent";
      case "strategic": return "border-l-purple";
      default: return "border-l-border";
    }
  };

  const getCourseCode = (slug: string) => {
    return slug.split("-")[0].toUpperCase();
  };

  const isCaseStudy = (slug: string) => {
    return slug.includes("case-study");
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-24 pb-16 lg:pb-20 hex-pattern">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              EXPLORE <span className="text-primary">CIMA COURSES</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              From the Certificate in Business Accounting to the Strategic Case Study, we've got comprehensive courses to help you ace every CIMA exam.
            </p>
          </div>
        </div>
      </section>

      {/* CIMA Pathway Overview */}
      <section className="py-12 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-orange/10 flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-orange" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Certificate (CBA)</h3>
              <p className="text-sm text-muted-foreground">BA1, BA2, BA3, BA4</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Operational Level</h3>
              <p className="text-sm text-muted-foreground">E1, P1, F1 + Case Study</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Management Level</h3>
              <p className="text-sm text-muted-foreground">E2, P2, F2 + Case Study</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-purple/10 flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-purple" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Strategic Level</h3>
              <p className="text-sm text-muted-foreground">E3, P3, F3 + Case Study</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Courses */}
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-12">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search courses (e.g., BA1, E2, Case Study)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 rounded-full"
              />
            </div>

            {/* Level Filter */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedLevel === "all" ? "default" : "outline"}
                onClick={() => setSelectedLevel("all")}
                size="sm"
              >
                All Levels
              </Button>
              {Object.entries(levelConfig).map(([key, config]) => (
                <Button
                  key={key}
                  variant={selectedLevel === key ? "default" : "outline"}
                  onClick={() => setSelectedLevel(key)}
                  size="sm"
                  className="gap-2"
                >
                  <config.icon className="w-4 h-4" />
                  {config.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Courses Grouped by Level */}
          {!isLoading && levelOrder.map((level) => {
            const levelCourses = groupedCourses[level];
            if (levelCourses.length === 0) return null;
            
            const config = levelConfig[level];
            const LevelIcon = config.icon;
            
            return (
              <div key={level} className="mb-16 last:mb-0">
                {/* Level Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-full ${config.color}/10 flex items-center justify-center`}>
                    <LevelIcon className={`w-5 h-5 ${config.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{config.label}</h2>
                    <p className="text-sm text-muted-foreground">
                      {level === "certificate" ? "4 Objective Tests" : "3 Objective Tests + Case Study"}
                    </p>
                  </div>
                </div>

                {/* Course Grid - 4 per row */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {levelCourses.map((course) => (
                    <div
                      key={course.id}
                      className={`group bg-card rounded-xl border-l-4 ${getLevelBorderColor(course.level)} border border-border overflow-hidden hover-lift`}
                    >
                      <div className="p-4">
                        {/* Code & Type Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getLevelBadgeStyle(course.level)}`}>
                              {getCourseCode(course.slug)}
                            </span>
                            {isCaseStudy(course.slug) && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                Case Study
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span className="text-xs font-medium text-foreground">4.8</span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-semibold text-foreground mb-2 line-clamp-2 min-h-[2.5rem]">
                          {course.title}
                        </h3>

                        {/* Meta Info */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {course.duration_hours || 30} hours
                          </span>
                        </div>

                        {/* Price & CTA */}
                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <div className="flex items-baseline gap-1.5">
                            {course.price === 0 ? (
                              <span className="text-lg font-bold text-primary">Free</span>
                            ) : (
                              <span className="text-lg font-bold text-foreground">£{course.price}</span>
                            )}
                          </div>
                          <Link
                            to={`/courses/${course.slug}`}
                            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                          >
                            View
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {filteredCourses.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No courses found matching your criteria.</p>
              <Button variant="outline" onClick={() => { setSearchTerm(""); setSelectedLevel("all"); }} className="mt-4">
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Courses;