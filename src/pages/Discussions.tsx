import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDiscussions, useCreateDiscussion, useVotePost, useDiscussionReplies } from "@/hooks/useDiscussions";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Pin,
  CheckCircle,
  Plus,
  Clock,
  User,
  BookOpen,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  slug: string;
}

const Discussions = () => {
  const { user } = useAuth();
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  // Fetch all courses
  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, slug")
        .order("title");
      if (error) throw error;
      return data as Course[];
    },
  });

  // Fetch discussions for selected course
  const { data: discussions = [], isLoading: discussionsLoading } = useDiscussions(
    selectedCourseId || undefined
  );

  const createDiscussion = useCreateDiscussion();
  const votePost = useVotePost();

  const handleCreatePost = async () => {
    if (!selectedCourseId || !newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a course and fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createDiscussion.mutateAsync({
        courseId: selectedCourseId,
        title: newPostTitle,
        content: newPostContent,
      });
      setNewPostTitle("");
      setNewPostContent("");
      setIsCreateDialogOpen(false);
      toast({
        title: "Post created",
        description: "Your discussion post has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVote = async (postId: string, voteType: "up" | "down") => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to vote on posts.",
        variant: "destructive",
      });
      return;
    }

    try {
      await votePost.mutateAsync({ postId, voteType });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Discussion Forums
              </h1>
              <p className="text-muted-foreground">
                Ask questions, share insights, and learn together
              </p>
            </div>

            {user && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Discussion
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Start a New Discussion</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Select Course
                      </label>
                      <Select
                        value={selectedCourseId}
                        onValueChange={setSelectedCourseId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a course" />
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
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Title
                      </label>
                      <Input
                        placeholder="What's your question or topic?"
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Content
                      </label>
                      <Textarea
                        placeholder="Describe your question or topic in detail..."
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        rows={5}
                      />
                    </div>
                    <Button
                      onClick={handleCreatePost}
                      disabled={createDiscussion.isPending}
                      className="w-full"
                    >
                      {createDiscussion.isPending ? "Creating..." : "Create Discussion"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Course Filter */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <Select
                  value={selectedCourseId}
                  onValueChange={setSelectedCourseId}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Filter by course" />
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
            </CardContent>
          </Card>

          {/* Discussion List */}
          {!selectedCourseId ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Select a Course</h3>
                <p className="text-muted-foreground">
                  Choose a course above to view and participate in discussions
                </p>
              </CardContent>
            </Card>
          ) : discussionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="py-6">
                    <div className="h-5 bg-muted rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : discussions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Discussions Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to start a discussion in this course!
                </p>
                {user && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Start a Discussion
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {discussions.map((post) => (
                <DiscussionCard
                  key={post.id}
                  post={post}
                  isExpanded={expandedPostId === post.id}
                  onToggleExpand={() =>
                    setExpandedPostId(expandedPostId === post.id ? null : post.id)
                  }
                  onVote={handleVote}
                  user={user}
                  courseId={selectedCourseId}
                />
              ))}
            </div>
          )}

          {/* Sign in prompt for guests */}
          {!user && (
            <Card className="mt-6 bg-primary/5 border-primary/20">
              <CardContent className="py-6 text-center">
                <User className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Join the Discussion</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Sign in to create posts, reply, and vote on discussions
                </p>
                <Button variant="default" asChild>
                  <a href="/auth">Sign In</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

// Discussion Card Component
interface DiscussionCardProps {
  post: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onVote: (postId: string, voteType: "up" | "down") => void;
  user: any;
  courseId: string;
}

const DiscussionCard = ({
  post,
  isExpanded,
  onToggleExpand,
  onVote,
  user,
  courseId,
}: DiscussionCardProps) => {
  const [replyContent, setReplyContent] = useState("");
  const { data: replies = [], isLoading: repliesLoading } = useDiscussionReplies(
    isExpanded ? post.id : ""
  );
  const createDiscussion = useCreateDiscussion();

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    try {
      await createDiscussion.mutateAsync({
        courseId: courseId,
        parentId: post.id,
        content: replyContent,
      });
      setReplyContent("");
      toast({
        title: "Reply posted",
        description: "Your reply has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={post.is_pinned ? "border-primary/50 bg-primary/5" : ""}>
      <CardContent className="pt-6">
        <div className="flex gap-4">
          {/* Vote buttons */}
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onVote(post.id, "up")}
              disabled={!user}
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{post.upvotes || 0}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onVote(post.id, "down")}
              disabled={!user}
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Post content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-2 flex-wrap">
              {post.is_pinned && (
                <Badge variant="secondary" className="gap-1">
                  <Pin className="h-3 w-3" />
                  Pinned
                </Badge>
              )}
              {post.is_resolved && (
                <Badge variant="default" className="gap-1 bg-green-500">
                  <CheckCircle className="h-3 w-3" />
                  Resolved
                </Badge>
              )}
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-2 break-words">
              {post.title || "Untitled Discussion"}
            </h3>

            <p className="text-muted-foreground mb-4 whitespace-pre-wrap break-words">
              {post.content}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    <User className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <span>Student</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  {formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1"
                onClick={onToggleExpand}
              >
                <MessageSquare className="h-4 w-4" />
                Replies
              </Button>
            </div>

            {/* Replies section */}
            {isExpanded && (
              <div className="mt-4 pt-4 border-t">
                {repliesLoading ? (
                  <div className="text-sm text-muted-foreground">
                    Loading replies...
                  </div>
                ) : replies.length === 0 ? (
                  <div className="text-sm text-muted-foreground mb-4">
                    No replies yet. Be the first to respond!
                  </div>
                ) : (
                  <div className="space-y-4 mb-4">
                    {replies.map((reply: any) => (
                      <div
                        key={reply.id}
                        className="pl-4 border-l-2 border-muted"
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {reply.content}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Avatar className="h-4 w-4">
                            <AvatarFallback className="text-[8px]">
                              <User className="h-2 w-2" />
                            </AvatarFallback>
                          </Avatar>
                          <span>Student</span>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(new Date(reply.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {user && (
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Write a reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={2}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleReply}
                      disabled={createDiscussion.isPending || !replyContent.trim()}
                    >
                      Reply
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Discussions;
