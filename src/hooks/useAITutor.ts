import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
  course_id?: string | null;
}

export const useChatHistory = (courseId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["ai_chat_history", user?.id, courseId],
    queryFn: async () => {
      let query = supabase
        .from("ai_chat_messages")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: true })
        .limit(100);

      if (courseId) {
        query = query.eq("course_id", courseId);
      } else {
        query = query.is("course_id", null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ChatMessage[];
    },
    enabled: !!user,
  });
};

export const useSaveAssistantMessage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      content,
      courseId,
    }: {
      content: string;
      courseId?: string | null;
    }) => {
      const { error } = await supabase.from("ai_chat_messages").insert({
        user_id: user!.id,
        role: "assistant",
        content,
        course_id: courseId || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai_chat_history"] });
    },
  });
};

export const useClearChatHistory = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId?: string | null) => {
      let query = supabase
        .from("ai_chat_messages")
        .delete()
        .eq("user_id", user!.id);

      if (courseId) {
        query = query.eq("course_id", courseId);
      } else {
        query = query.is("course_id", null);
      }

      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai_chat_history"] });
    },
  });
};
