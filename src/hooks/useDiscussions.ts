import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DiscussionPost {
  id: string;
  course_id: string;
  lesson_id: string | null;
  user_id: string;
  parent_id: string | null;
  title: string | null;
  content: string;
  is_pinned: boolean;
  is_resolved: boolean;
  upvotes: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string | null;
    first_name: string | null;
    avatar_url: string | null;
  };
  replies?: DiscussionPost[];
}

export const useDiscussions = (courseId?: string, lessonId?: string) => {
  return useQuery({
    queryKey: ["discussions", courseId, lessonId],
    queryFn: async () => {
      let query = supabase
        .from("discussion_posts")
        .select("*")
        .is("parent_id", null)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (courseId) {
        query = query.eq("course_id", courseId);
      }
      if (lessonId) {
        query = query.eq("lesson_id", lessonId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DiscussionPost[];
    },
    enabled: !!courseId,
  });
};

export const useDiscussionReplies = (postId: string) => {
  return useQuery({
    queryKey: ["discussion_replies", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discussion_posts")
        .select("*")
        .eq("parent_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as DiscussionPost[];
    },
    enabled: !!postId,
  });
};

export const useCreateDiscussion = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      lessonId,
      parentId,
      title,
      content,
    }: {
      courseId: string;
      lessonId?: string;
      parentId?: string;
      title?: string;
      content: string;
    }) => {
      const { data, error } = await supabase
        .from("discussion_posts")
        .insert({
          course_id: courseId,
          lesson_id: lessonId || null,
          parent_id: parentId || null,
          user_id: user!.id,
          title: title || null,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
      queryClient.invalidateQueries({ queryKey: ["discussion_replies"] });
    },
  });
};

export const useVotePost = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, voteType }: { postId: string; voteType: "up" | "down" }) => {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from("discussion_votes")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", user!.id)
        .single();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote
          await supabase.from("discussion_votes").delete().eq("id", existingVote.id);
        } else {
          // Change vote
          await supabase
            .from("discussion_votes")
            .update({ vote_type: voteType })
            .eq("id", existingVote.id);
        }
      } else {
        // Add new vote
        await supabase.from("discussion_votes").insert({
          post_id: postId,
          user_id: user!.id,
          vote_type: voteType,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
      queryClient.invalidateQueries({ queryKey: ["discussion_replies"] });
    },
  });
};
