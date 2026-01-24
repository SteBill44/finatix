import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ParsedQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  syllabus_area_index: number;
  difficulty_level: string;
  question_type: string;
  isValid: boolean;
  errors: string[];
}

interface ImportStats {
  total: number;
  valid: number;
  invalid: number;
  imported: number;
}

const QuestionBulkImport = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedQuiz, setSelectedQuiz] = useState<string>("");
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [stats, setStats] = useState<ImportStats>({ total: 0, valid: 0, invalid: 0, imported: 0 });

  // Fetch courses
  const { data: courses = [] } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("id, title");
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch quizzes for selected course
  const { data: quizzes = [] } = useQuery({
    queryKey: ["admin-quizzes", selectedCourse],
    queryFn: async () => {
      if (!selectedCourse) return [];
      const { data, error } = await supabase
        .from("quizzes")
        .select("id, title")
        .eq("course_id", selectedCourse);
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCourse,
  });

  // Fetch syllabus for selected course
  const { data: syllabus } = useQuery({
    queryKey: ["admin-syllabus", selectedCourse],
    queryFn: async () => {
      if (!selectedCourse) return null;
      const { data, error } = await supabase
        .from("course_syllabuses")
        .select("syllabus_areas")
        .eq("course_id", selectedCourse)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCourse,
  });

  const syllabusAreas = (syllabus?.syllabus_areas as Array<{ title: string; weight: number }>) || [];

  const parseCSV = (text: string): ParsedQuestion[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const questions: ParsedQuestion[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const errors: string[] = [];

      const question = getValue(headers, values, "question");
      const optionsRaw = getValue(headers, values, "options");
      const correctAnswerRaw = getValue(headers, values, "correct_answer");
      const explanation = getValue(headers, values, "explanation") || "";
      const syllabusAreaRaw = getValue(headers, values, "syllabus_area_index");
      const difficulty = getValue(headers, values, "difficulty_level") || "medium";
      const questionType = getValue(headers, values, "question_type") || "multiple_choice";

      // Parse options (expect JSON array or pipe-separated)
      let options: string[] = [];
      try {
        if (optionsRaw.startsWith("[")) {
          options = JSON.parse(optionsRaw);
        } else {
          options = optionsRaw.split("|").map((o) => o.trim());
        }
      } catch {
        errors.push("Invalid options format");
      }

      // Validate
      if (!question) errors.push("Missing question");
      if (options.length < 2) errors.push("Need at least 2 options");
      
      const correctAnswer = parseInt(correctAnswerRaw);
      if (isNaN(correctAnswer) || correctAnswer < 0 || correctAnswer >= options.length) {
        errors.push("Invalid correct answer index");
      }

      const syllabusAreaIndex = parseInt(syllabusAreaRaw);
      if (isNaN(syllabusAreaIndex) || syllabusAreaIndex < 0 || syllabusAreaIndex >= syllabusAreas.length) {
        errors.push("Invalid syllabus area index");
      }

      if (!["easy", "medium", "hard"].includes(difficulty)) {
        errors.push("Difficulty must be easy, medium, or hard");
      }

      questions.push({
        question,
        options,
        correct_answer: correctAnswer,
        explanation,
        syllabus_area_index: syllabusAreaIndex,
        difficulty_level: difficulty,
        question_type: questionType,
        isValid: errors.length === 0,
        errors,
      });
    }

    return questions;
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const getValue = (headers: string[], values: string[], key: string): string => {
    const index = headers.indexOf(key);
    return index >= 0 ? values[index] || "" : "";
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const questions = parseCSV(text);
      setParsedQuestions(questions);
      setStats({
        total: questions.length,
        valid: questions.filter((q) => q.isValid).length,
        invalid: questions.filter((q) => !q.isValid).length,
        imported: 0,
      });
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!selectedQuiz) {
      toast({ title: "Error", description: "Please select a quiz first", variant: "destructive" });
      return;
    }

    const validQuestions = parsedQuestions.filter((q) => q.isValid);
    if (validQuestions.length === 0) {
      toast({ title: "Error", description: "No valid questions to import", variant: "destructive" });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    try {
      // Get current max order_index
      const { data: existingQuestions } = await supabase
        .from("quiz_questions")
        .select("order_index")
        .eq("quiz_id", selectedQuiz)
        .order("order_index", { ascending: false })
        .limit(1);

      let orderIndex = (existingQuestions?.[0]?.order_index || 0) + 1;

      // Import in batches
      const batchSize = 10;
      let imported = 0;

      for (let i = 0; i < validQuestions.length; i += batchSize) {
        const batch = validQuestions.slice(i, i + batchSize);
        const questionsToInsert = batch.map((q, idx) => ({
          quiz_id: selectedQuiz,
          question: q.question,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation || null,
          syllabus_area_index: q.syllabus_area_index,
          difficulty_level: q.difficulty_level,
          question_type: q.question_type,
          is_practice_pool: true,
          order_index: orderIndex + i + idx,
        }));

        const { error } = await supabase.from("quiz_questions").insert(questionsToInsert);
        
        if (error) {
          console.error("Import error:", error);
          throw error;
        }

        imported += batch.length;
        setImportProgress(Math.round((imported / validQuestions.length) * 100));
        setStats((prev) => ({ ...prev, imported }));
      }

      toast({
        title: "Import Complete",
        description: `Successfully imported ${imported} questions`,
      });

      // Reset state
      setParsedQuestions([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Import failed:", error);
      toast({
        title: "Import Failed",
        description: "An error occurred while importing questions",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const headers = "question,options,correct_answer,explanation,syllabus_area_index,difficulty_level,question_type";
    const example = '"What is 2+2?","2|3|4|5",2,"The answer is 4 because 2+2=4",0,easy,multiple_choice';
    const csv = `${headers}\n${example}`;
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "question_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Bulk Question Import
        </CardTitle>
        <CardDescription>
          Import multiple questions from a CSV file with syllabus area and difficulty assignments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Course and Quiz Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Course</Label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Quiz</Label>
            <Select value={selectedQuiz} onValueChange={setSelectedQuiz} disabled={!selectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="Select quiz" />
              </SelectTrigger>
              <SelectContent>
                {quizzes.map((quiz) => (
                  <SelectItem key={quiz.id} value={quiz.id}>
                    {quiz.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Syllabus Areas Reference */}
        {syllabusAreas.length > 0 && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">Syllabus Area Indices</h4>
            <div className="flex flex-wrap gap-2">
              {syllabusAreas.map((area, index) => (
                <Badge key={index} variant="outline">
                  {index}: {area.title} ({area.weight}%)
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* File Upload */}
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <Label>Upload CSV</Label>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
          <Input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="cursor-pointer"
          />
          <p className="text-xs text-muted-foreground">
            CSV format: question, options (pipe-separated or JSON), correct_answer (0-indexed), 
            explanation, syllabus_area_index, difficulty_level (easy/medium/hard), question_type
          </p>
        </div>

        {/* Import Stats */}
        {parsedQuestions.length > 0 && (
          <div className="grid grid-cols-4 gap-4">
            <div className="p-3 bg-muted rounded-lg text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="p-3 bg-accent/10 rounded-lg text-center">
              <div className="text-2xl font-bold text-accent">{stats.valid}</div>
              <div className="text-xs text-muted-foreground">Valid</div>
            </div>
            <div className="p-3 bg-destructive/10 rounded-lg text-center">
              <div className="text-2xl font-bold text-destructive">{stats.invalid}</div>
              <div className="text-xs text-muted-foreground">Invalid</div>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">{stats.imported}</div>
              <div className="text-xs text-muted-foreground">Imported</div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {isImporting && (
          <div className="space-y-2">
            <Progress value={importProgress} />
            <p className="text-sm text-muted-foreground text-center">
              Importing... {importProgress}%
            </p>
          </div>
        )}

        {/* Preview Table */}
        {parsedQuestions.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-64 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Options</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedQuestions.slice(0, 20).map((q, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="max-w-xs truncate">{q.question}</TableCell>
                      <TableCell>{q.options.length} options</TableCell>
                      <TableCell>
                        {syllabusAreas[q.syllabus_area_index]?.title || q.syllabus_area_index}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{q.difficulty_level}</Badge>
                      </TableCell>
                      <TableCell>
                        {q.isValid ? (
                          <CheckCircle2 className="h-4 w-4 text-accent" />
                        ) : (
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            <span className="text-xs text-destructive">
                              {q.errors.join(", ")}
                            </span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {parsedQuestions.length > 20 && (
              <div className="p-2 text-center text-sm text-muted-foreground bg-muted">
                Showing first 20 of {parsedQuestions.length} questions
              </div>
            )}
          </div>
        )}

        {/* Import Button */}
        {parsedQuestions.length > 0 && (
          <Button 
            onClick={handleImport} 
            disabled={isImporting || stats.valid === 0}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import {stats.valid} Valid Questions
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionBulkImport;
