import { useState, useRef, useEffect, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Bot, Send, Trash2, User, Loader2, GraduationCap, Sparkles } from "lucide-react";
import { useChatHistory, useSaveAssistantMessage, useClearChatHistory, type ChatMessage } from "@/hooks/useAITutor";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const SUGGESTED_PROMPTS = [
  "Explain the difference between marginal costing and absorption costing",
  "What is the CIMA exam format for the Management level?",
  "Help me understand variance analysis",
  "What are the key ratios for financial performance measurement?",
  "Explain working capital management strategies",
];

export default function AITutor() {
  const { user } = useAuth();
  const { data: history = [], isLoading: historyLoading } = useChatHistory();
  const saveAssistant = useSaveAssistantMessage();
  const clearHistory = useClearChatHistory();

  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const allMessages: ChatMessage[] = historyLoading
    ? localMessages
    : [...history, ...localMessages.filter((m) => !history.find((h) => h.content === m.content && h.role === m.role))];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allMessages, streamingContent]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || streaming) return;

      const userMsg: ChatMessage = { role: "user", content: text.trim() };
      setLocalMessages((prev) => [...prev, userMsg]);
      setInput("");
      setStreaming(true);
      setStreamingContent("");

      const messages = [...allMessages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const response = await supabase.functions.invoke("ai-study-assistant", {
          body: { messages },
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (response.error) {
          throw new Error(response.error.message || "AI service unavailable");
        }

        // Handle streaming SSE
        const reader = (response.data as ReadableStream)?.getReader();
        if (!reader) {
          throw new Error("No stream available");
        }

        let fullContent = "";
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  fullContent += delta;
                  setStreamingContent(fullContent);
                }
              } catch {
                // skip unparseable lines
              }
            }
          }
        }

        if (fullContent) {
          const assistantMsg: ChatMessage = { role: "assistant", content: fullContent };
          setLocalMessages((prev) => [...prev, assistantMsg]);
          setStreamingContent("");
          await saveAssistant.mutateAsync({ content: fullContent, courseId: null });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Something went wrong";
        toast.error(msg);
        setLocalMessages((prev) => prev.slice(0, -1));
      } finally {
        setStreaming(false);
        setStreamingContent("");
        textareaRef.current?.focus();
      }
    },
    [allMessages, streaming, saveAssistant]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleClear = async () => {
    await clearHistory.mutateAsync(null);
    setLocalMessages([]);
    toast.success("Chat history cleared");
  };

  const displayMessages = [...allMessages];

  return (
    <Layout>
      <SEOHead title="AI Study Tutor" description="Get instant help from your CIMA AI study assistant" noIndex />
      <div className="pt-24 lg:pt-28 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-bold text-xl">AI Study Tutor</h1>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Powered by Gemini 2.5 Flash
                </p>
              </div>
            </div>
            {displayMessages.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Clear
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear chat history?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your conversation history with the AI tutor.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClear}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Clear History
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {/* Chat area */}
          <Card className="flex flex-col h-[60vh] min-h-[400px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
              {historyLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-3/4 rounded-2xl" />
                  ))}
                </div>
              ) : displayMessages.length === 0 && !streaming ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 py-8">
                  <Bot className="w-12 h-12 text-muted-foreground/30" />
                  <p className="font-medium text-muted-foreground">How can I help you study today?</p>
                  <div className="grid grid-cols-1 gap-2 w-full max-w-md mt-2">
                    {SUGGESTED_PROMPTS.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(p)}
                        className="text-left text-xs px-4 py-2.5 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {displayMessages.map((msg, i) => (
                    <MessageBubble key={i} message={msg} />
                  ))}
                  {streaming && (
                    <MessageBubble
                      message={{ role: "assistant", content: streamingContent || "" }}
                      streaming={!streamingContent}
                    />
                  )}
                </>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border p-3 flex gap-2 items-end">
              <Textarea
                ref={textareaRef}
                placeholder="Ask me anything about CIMA..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="resize-none min-h-[44px] max-h-32"
                rows={1}
                disabled={streaming}
              />
              <Button
                size="icon"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || streaming}
                className="flex-shrink-0 h-11 w-11"
              >
                {streaming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </Card>

          <p className="text-xs text-muted-foreground/60 text-center mt-3">
            AI responses may not always be accurate. Always verify with official CIMA materials.
          </p>
        </div>
      </div>
    </Layout>
  );
}

function MessageBubble({
  message,
  streaming = false,
}: {
  message: ChatMessage;
  streaming?: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary"
        }`}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-secondary text-secondary-foreground rounded-tl-sm"
        }`}
      >
        {streaming && !message.content ? (
          <span className="flex gap-1 items-center h-4">
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
        ) : (
          <span className="whitespace-pre-wrap">{message.content}</span>
        )}
      </div>
    </div>
  );
}
