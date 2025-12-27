import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Users, 
  Star, 
  Play, 
  CheckCircle, 
  BookOpen, 
  FileText,
  Award,
  BarChart2,
  ArrowLeft,
  ShoppingCart
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const courseData: Record<string, any> = {
  ba1: {
    code: "BA1",
    title: "Fundamentals of Business Economics",
    level: "Operational",
    description: "Understand the economic context of business and how organisations function in their environment. This comprehensive course covers microeconomics, macroeconomics, and their application to business decisions.",
    price: 149,
    originalPrice: 199,
    duration: "40 hours",
    students: 2340,
    rating: 4.8,
    reviews: 312,
    instructor: {
      name: "Dr. Sarah Williams",
      title: "Senior Economics Lecturer",
      experience: "15+ years teaching CIMA",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    syllabus: [
      { title: "Introduction to Business Economics", lessons: 8, duration: "4 hours" },
      { title: "Microeconomic Principles", lessons: 12, duration: "8 hours" },
      { title: "Macroeconomic Environment", lessons: 10, duration: "7 hours" },
      { title: "Market Structures", lessons: 8, duration: "6 hours" },
      { title: "Government Economic Policy", lessons: 6, duration: "5 hours" },
      { title: "International Trade", lessons: 8, duration: "5 hours" },
      { title: "Exam Preparation & Mock Tests", lessons: 10, duration: "5 hours" },
    ],
    features: [
      "40+ hours of video content",
      "500+ practice questions",
      "5 full mock exams",
      "Competency-based progress tracking",
      "Weak area identification",
      "Mobile app access",
      "24/7 community support",
      "Certificate of completion"
    ]
  }
};

// Fallback for other courses
const defaultCourse = {
  code: "CIMA",
  title: "CIMA Professional Course",
  level: "Professional",
  description: "Comprehensive course designed to help you master the exam content and pass with confidence.",
  price: 199,
  originalPrice: 249,
  duration: "50 hours",
  students: 1500,
  rating: 4.8,
  reviews: 250,
  instructor: {
    name: "Expert Instructor",
    title: "CIMA Qualified",
    experience: "10+ years teaching",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  syllabus: [
    { title: "Introduction", lessons: 5, duration: "3 hours" },
    { title: "Core Concepts", lessons: 10, duration: "8 hours" },
    { title: "Advanced Topics", lessons: 12, duration: "10 hours" },
    { title: "Practice & Review", lessons: 8, duration: "6 hours" },
  ],
  features: [
    "50+ hours of video content",
    "300+ practice questions",
    "3 full mock exams",
    "Progress tracking",
    "Mobile access",
    "Community support"
  ]
};

const CourseDetail = () => {
  const { courseId } = useParams();
  const course = courseData[courseId || ""] || { ...defaultCourse, code: courseId?.toUpperCase() };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-95" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <Link to="/courses" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/10 text-primary-foreground text-sm font-medium mb-4">
                {course.level} Level • {course.code}
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
                {course.title}
              </h1>
              <p className="text-lg text-primary-foreground/80 mb-6">
                {course.description}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2 text-primary-foreground/90">
                  <Clock className="w-5 h-5" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-primary-foreground/90">
                  <Users className="w-5 h-5" />
                  <span>{course.students.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-2 text-primary-foreground/90">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span>{course.rating} ({course.reviews} reviews)</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-4 p-4 bg-primary-foreground/10 rounded-xl backdrop-blur-sm">
                <img
                  src={course.instructor.image}
                  alt={course.instructor.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary-foreground/20"
                />
                <div>
                  <h4 className="font-semibold text-primary-foreground">{course.instructor.name}</h4>
                  <p className="text-sm text-primary-foreground/70">
                    {course.instructor.title} • {course.instructor.experience}
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="lg:justify-self-end w-full max-w-md">
              <div className="bg-card rounded-2xl border border-border shadow-xl p-8">
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-4xl font-bold text-foreground">£{course.price}</span>
                  {course.originalPrice && (
                    <span className="text-xl text-muted-foreground line-through">£{course.originalPrice}</span>
                  )}
                  {course.originalPrice && (
                    <span className="px-2 py-1 rounded bg-accent/10 text-accent text-sm font-medium">
                      {Math.round((1 - course.price / course.originalPrice) * 100)}% off
                    </span>
                  )}
                </div>

                <Button size="lg" className="w-full mb-3 gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Enroll Now
                </Button>
                <Button variant="outline" size="lg" className="w-full gap-2">
                  <Play className="w-5 h-5" />
                  Try Free Lesson
                </Button>

                <p className="text-center text-sm text-muted-foreground mt-4">
                  30-day money-back guarantee
                </p>

                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="font-semibold text-foreground mb-4">This course includes:</h4>
                  <ul className="space-y-3">
                    {course.features.slice(0, 5).map((feature: string, index: number) => (
                      <li key={index} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path d="M0 60L1440 60L1440 0C1200 40 720 60 0 20L0 60Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Syllabus */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-primary" />
                  Course Syllabus
                </h2>
                <Accordion type="single" collapsible className="space-y-3">
                  {course.syllabus.map((section: any, index: number) => (
                    <AccordionItem
                      key={index}
                      value={`section-${index}`}
                      className="bg-card rounded-xl border border-border px-6"
                    >
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span className="font-medium text-foreground">{section.title}</span>
                          <span className="text-sm text-muted-foreground">
                            {section.lessons} lessons • {section.duration}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <p className="text-muted-foreground">
                          Comprehensive coverage of {section.title.toLowerCase()} with video lectures, 
                          practice questions, and interactive exercises.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* Analytics Preview */}
              <div className="bg-card rounded-2xl border border-border p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <BarChart2 className="w-6 h-6 text-primary" />
                  Smart Analytics Preview
                </h2>
                <div className="bg-secondary/50 rounded-xl p-6">
                  <img 
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop" 
                    alt="Analytics Dashboard Preview"
                    className="w-full rounded-lg shadow-lg"
                  />
                  <p className="text-center text-muted-foreground mt-4">
                    Track your progress across competencies, identify weak areas, and get personalized study recommendations.
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* All Features */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  All Course Features
                </h3>
                <ul className="space-y-3">
                  {course.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Related Courses */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4">Related Courses</h3>
                <div className="space-y-4">
                  {["BA2", "BA3", "BA4"].map((code) => (
                    <Link
                      key={code}
                      to={`/courses/${code.toLowerCase()}`}
                      className="block p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <span className="font-medium text-foreground">{code}</span>
                      <p className="text-sm text-muted-foreground">Operational Level</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CourseDetail;
