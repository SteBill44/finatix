import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, X } from "lucide-react";
import { Json } from "@/integrations/supabase/types";

interface SyllabusArea {
  title: string;
  weight: string;
  topics: string[];
}

interface CourseSyllabus {
  id: string;
  course_id: string;
  objective: string | null;
  syllabus_areas: Json;
}

interface Course {
  id: string;
  title: string;
  slug: string;
}

const SyllabusManagement = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [syllabus, setSyllabus] = useState<CourseSyllabus | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [objective, setObjective] = useState("");
  const [syllabusAreas, setSyllabusAreas] = useState<SyllabusArea[]>([]);
  const [editingAreaIndex, setEditingAreaIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchSyllabus(selectedCourseId);
    }
  }, [selectedCourseId]);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("id, title, slug")
      .order("title");
    
    if (error) {
      toast({ title: "Error fetching courses", description: error.message, variant: "destructive" });
    } else {
      setCourses(data || []);
    }
  };

  const fetchSyllabus = async (courseId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("course_syllabuses")
      .select("*")
      .eq("course_id", courseId)
      .maybeSingle();

    if (error) {
      toast({ title: "Error fetching syllabus", description: error.message, variant: "destructive" });
    } else if (data) {
      setSyllabus(data);
      setObjective(data.objective || "");
      const areas = Array.isArray(data.syllabus_areas) 
        ? (data.syllabus_areas as unknown as SyllabusArea[]) 
        : [];
      setSyllabusAreas(areas);
    } else {
      // No syllabus exists yet
      setSyllabus(null);
      setObjective("");
      setSyllabusAreas([]);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!selectedCourseId) return;
    
    setSaving(true);
    const syllabusData = {
      course_id: selectedCourseId,
      objective,
      syllabus_areas: syllabusAreas as unknown as Json,
    };

    if (syllabus) {
      // Update existing
      const { error } = await supabase
        .from("course_syllabuses")
        .update(syllabusData)
        .eq("id", syllabus.id);

      if (error) {
        toast({ title: "Error updating syllabus", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Syllabus updated successfully" });
        fetchSyllabus(selectedCourseId);
      }
    } else {
      // Insert new
      const { error } = await supabase
        .from("course_syllabuses")
        .insert(syllabusData);

      if (error) {
        toast({ title: "Error creating syllabus", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Syllabus created successfully" });
        fetchSyllabus(selectedCourseId);
      }
    }
    setSaving(false);
  };

  const addSyllabusArea = () => {
    setSyllabusAreas([...syllabusAreas, { title: "", weight: "", topics: [""] }]);
    setEditingAreaIndex(syllabusAreas.length);
  };

  const removeSyllabusArea = (index: number) => {
    setSyllabusAreas(syllabusAreas.filter((_, i) => i !== index));
    if (editingAreaIndex === index) {
      setEditingAreaIndex(null);
    }
  };

  const updateSyllabusArea = (index: number, field: keyof SyllabusArea, value: string | string[]) => {
    const updated = [...syllabusAreas];
    updated[index] = { ...updated[index], [field]: value };
    setSyllabusAreas(updated);
  };

  const addTopic = (areaIndex: number) => {
    const updated = [...syllabusAreas];
    updated[areaIndex].topics = [...updated[areaIndex].topics, ""];
    setSyllabusAreas(updated);
  };

  const updateTopic = (areaIndex: number, topicIndex: number, value: string) => {
    const updated = [...syllabusAreas];
    updated[areaIndex].topics[topicIndex] = value;
    setSyllabusAreas(updated);
  };

  const removeTopic = (areaIndex: number, topicIndex: number) => {
    const updated = [...syllabusAreas];
    updated[areaIndex].topics = updated[areaIndex].topics.filter((_, i) => i !== topicIndex);
    setSyllabusAreas(updated);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Syllabus Management</CardTitle>
          <CardDescription>
            Edit course objectives and syllabus areas that appear on course detail pages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Course Selector */}
          <div className="space-y-2">
            <Label>Select Course</Label>
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Choose a course to edit" />
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

          {loading && (
            <div className="text-muted-foreground">Loading syllabus...</div>
          )}

          {selectedCourseId && !loading && (
            <>
              {/* Objective */}
              <div className="space-y-2">
                <Label>Course Objective</Label>
                <Textarea
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Enter the course objective and learning outcomes..."
                  className="min-h-[100px]"
                />
              </div>

              {/* Syllabus Areas */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Syllabus Areas</Label>
                  <Button size="sm" onClick={addSyllabusArea}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Area
                  </Button>
                </div>

                {syllabusAreas.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No syllabus areas defined. Click "Add Area" to create one.
                  </p>
                )}

                {syllabusAreas.map((area, areaIndex) => (
                  <Card key={areaIndex} className="bg-muted/30">
                    <CardContent className="pt-4 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Area Title</Label>
                            <Input
                              value={area.title}
                              onChange={(e) => updateSyllabusArea(areaIndex, "title", e.target.value)}
                              placeholder="e.g., A: The Macroeconomic Environment"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Weight</Label>
                            <Input
                              value={area.weight}
                              onChange={(e) => updateSyllabusArea(areaIndex, "weight", e.target.value)}
                              placeholder="e.g., 25%"
                            />
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeSyllabusArea(areaIndex)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Topics */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Topics</Label>
                          <Button size="sm" variant="outline" onClick={() => addTopic(areaIndex)}>
                            <Plus className="w-3 h-3 mr-1" />
                            Add Topic
                          </Button>
                        </div>
                        
                        {area.topics.map((topic, topicIndex) => (
                          <div key={topicIndex} className="flex items-center gap-2">
                            <Input
                              value={topic}
                              onChange={(e) => updateTopic(areaIndex, topicIndex, e.target.value)}
                              placeholder="Enter topic..."
                              className="flex-1"
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => removeTopic(areaIndex, topicIndex)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Syllabus"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SyllabusManagement;
