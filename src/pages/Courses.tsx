import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  Clock, 
  Users, 
  Star, 
  Play,
  BookOpen,
  BarChart3,
  Target,
  ArrowRight
} from "lucide-react";

interface Course {
  id: string;
  code: string;
  title: string;
  level: "operational" | "management" | "strategic";
  description: string;
  price: number;
  originalPrice?: number;
  duration: string;
  students: number;
  rating: number;
  format: string;
  hasFreeLesson: boolean;
}

const courses: Course[] = [
  // Operational Level
  { id: "ba1", code: "BA1", title: "Fundamentals of Business Economics", level: "operational", description: "Understand the economic context of business and how organisations function in their environment.", price: 149, originalPrice: 199, duration: "40 hours", students: 2340, rating: 4.8, format: "On-demand + Mock Exams", hasFreeLesson: true },
  { id: "ba2", code: "BA2", title: "Fundamentals of Management Accounting", level: "operational", description: "Master the core principles of management accounting and cost analysis.", price: 149, originalPrice: 199, duration: "45 hours", students: 2150, rating: 4.9, format: "On-demand + Mock Exams", hasFreeLesson: true },
  { id: "ba3", code: "BA3", title: "Fundamentals of Financial Accounting", level: "operational", description: "Build a solid foundation in financial accounting principles and practices.", price: 149, originalPrice: 199, duration: "42 hours", students: 1980, rating: 4.7, format: "On-demand + Mock Exams", hasFreeLesson: true },
  { id: "ba4", code: "BA4", title: "Fundamentals of Ethics, Corporate Governance and Business Law", level: "operational", description: "Explore ethical principles, governance frameworks, and business law essentials.", price: 149, originalPrice: 199, duration: "38 hours", students: 1750, rating: 4.8, format: "On-demand + Mock Exams", hasFreeLesson: true },
  // Management Level
  { id: "e1", code: "E1", title: "Organisational Management", level: "management", description: "Develop skills in organisational structure, HR management, and business processes.", price: 199, originalPrice: 249, duration: "50 hours", students: 1650, rating: 4.9, format: "On-demand + Mock Exams", hasFreeLesson: true },
  { id: "p1", code: "P1", title: "Management Accounting", level: "management", description: "Advanced management accounting techniques for decision-making and control.", price: 199, originalPrice: 249, duration: "55 hours", students: 1820, rating: 4.8, format: "On-demand + Mock Exams", hasFreeLesson: true },
  { id: "f1", code: "F1", title: "Financial Reporting", level: "management", description: "Master financial reporting standards and complex accounting treatments.", price: 199, originalPrice: 249, duration: "52 hours", students: 1590, rating: 4.7, format: "On-demand + Mock Exams", hasFreeLesson: true },
  // Strategic Level
  { id: "e2", code: "E2", title: "Project and Relationship Management", level: "strategic", description: "Lead complex projects and manage stakeholder relationships effectively.", price: 249, originalPrice: 299, duration: "48 hours", students: 1120, rating: 4.9, format: "On-demand + Mock Exams", hasFreeLesson: true },
  { id: "p2", code: "P2", title: "Advanced Management Accounting", level: "strategic", description: "Strategic management accounting for complex business decisions.", price: 249, originalPrice: 299, duration: "58 hours", students: 1340, rating: 4.8, format: "On-demand + Mock Exams", hasFreeLesson: true },
  { id: "f2", code: "F2", title: "Advanced Financial Reporting", level: "strategic", description: "Complex group accounting, current issues, and professional standards.", price: 249, originalPrice: 299, duration: "55 hours", students: 1280, rating: 4.7, format: "On-demand + Mock Exams", hasFreeLesson: true },
  { id: "e3", code: "E3", title: "Strategic Management", level: "strategic", description: "Develop strategic thinking and enterprise-level management skills.", price: 279, originalPrice: 349, duration: "60 hours", students: 980, rating: 4.9, format: "On-demand + Mock Exams", hasFreeLesson: true },
  { id: "p3", code: "P3", title: "Risk Management", level: "strategic", description: "Enterprise risk management and strategic risk assessment.", price: 279, originalPrice: 349, duration: "55 hours", students: 890, rating: 4.8, format: "On-demand + Mock Exams", hasFreeLesson: true },
  { id: "f3", code: "F3", title: "Financial Strategy", level: "strategic", description: "Financial strategy formulation and implementation for senior finance roles.", price: 279, originalPrice: 349, duration: "58 hours", students: 920, rating: 4.9, format: "On-demand + Mock Exams", hasFreeLesson: true },
];

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  const levelConfig = {
    operational: { label: "Operational", icon: BookOpen, color: "from-teal to-teal-light" },
    management: { label: "Management", icon: BarChart3, color: "from-primary to-royal-blue-dark" },
    strategic: { label: "Strategic", icon: Target, color: "from-accent to-teal" },
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === "all" || course.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const getLevelBadgeStyle = (level: string) => {
    switch (level) {
      case "operational": return "bg-teal/10 text-teal";
      case "management": return "bg-primary/10 text-primary";
      case "strategic": return "bg-accent/10 text-accent";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-95" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-accent/30 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/10 text-primary-foreground text-sm font-medium mb-4">
              CIMA Course Catalog
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Find Your Perfect Course
            </h1>
            <p className="text-xl text-primary-foreground/80">
              From foundation to strategic level, we've got comprehensive courses to help you ace every CIMA exam.
            </p>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path d="M0 60L1440 60L1440 0C1200 40 720 60 0 20L0 60Z" fill="hsl(var(--background))"/>
          </svg>
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
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
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

          {/* Course Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="group bg-card rounded-2xl border border-border overflow-hidden hover-lift"
              >
                {/* Course Header */}
                <div className={`h-2 bg-gradient-to-r ${levelConfig[course.level].color}`} />
                
                <div className="p-6">
                  {/* Level Badge & Code */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getLevelBadgeStyle(course.level)}`}>
                      {course.code}
                    </span>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium text-foreground">{course.rating}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {course.students.toLocaleString()}
                    </span>
                  </div>

                  {/* Format */}
                  <p className="text-xs text-muted-foreground mb-4">
                    {course.format}
                  </p>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-foreground">£{course.price}</span>
                      {course.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">£{course.originalPrice}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {course.hasFreeLesson && (
                        <Button variant="outline" size="sm" className="gap-1">
                          <Play className="w-3 h-3" />
                          Try Free
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* View Course Link */}
                  <Link
                    to={`/courses/${course.id}`}
                    className="mt-4 flex items-center justify-center gap-2 w-full py-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors group/link"
                  >
                    View Course Details
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

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
