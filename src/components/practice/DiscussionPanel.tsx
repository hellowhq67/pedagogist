import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MessageCircle, Trophy, User, Send } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Attempt {
  id: string;
  user_id: string;
  audio_url: string | null;
  spoken_text: string | null;
  duration_seconds: number | null;
  overall_score: number;
  test_type: string;
  created_at: string;
  display_name?: string;
}

interface Discussion {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
  display_name?: string;
}

interface Props {
  questionId: string;
  /** speaking | writing | reading | listening — controls whether audio is shown */
  testType?: string;
  refreshKey?: number;
}

function initialsFrom(name?: string) {
  if (!name) return "U";
  return name.trim().slice(0, 2).toUpperCase();
}

function AttemptCard({ a, isMe, showAudio }: { a: Attempt; isMe: boolean; showAudio: boolean }) {
  const name = isMe ? "You" : a.display_name || "Student";
  return (
    <div className="border border-border/50 rounded-lg p-3 bg-card/30">
      <div className="flex items-center gap-2 mb-2">
        <Avatar className="h-7 w-7">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {initialsFrom(name)}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium text-sm">{name}</span>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
        </span>
        <Badge variant="outline" className="ml-auto text-primary border-primary/40">
          {a.overall_score}/90
        </Badge>
      </div>
      {showAudio && a.audio_url ? (
        <audio controls src={a.audio_url} className="h-8 w-full" />
      ) : a.spoken_text ? (
        <p className="text-sm text-muted-foreground line-clamp-3">{a.spoken_text}</p>
      ) : (
        <p className="text-xs text-muted-foreground italic">Submission recorded</p>
      )}
      {a.duration_seconds ? (
        <p className="text-[11px] text-muted-foreground mt-1">
          {a.test_type} · {a.duration_seconds}s
        </p>
      ) : (
        <p className="text-[11px] text-muted-foreground mt-1">{a.test_type}</p>
      )}
    </div>
  );
}

export function DiscussionPanel({ questionId, testType = "speaking", refreshKey = 0 }: Props) {
  const { user } = useAuth();
  const [tab, setTab] = useState("discussion");
  const [comments, setComments] = useState<Discussion[]>([]);
  const [board, setBoard] = useState<Attempt[]>([]);
  const [mine, setMine] = useState<Attempt[]>([]);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const showAudio = testType === "speaking";

  const load = async () => {
    const [comRes, boardRes, mineRes] = await Promise.all([
      (supabase as any).rpc("get_question_discussions", { p_question_id: questionId }),
      (supabase as any).rpc("get_question_leaderboard", { p_question_id: questionId, p_limit: 20 }),
      user
        ? supabase
            .from("speaking_attempts")
            .select("id, user_id, audio_url, spoken_text, duration_seconds, overall_score, test_type, created_at")
            .eq("question_id", questionId)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [] as any[] }),
    ]);
    setComments(
      ((comRes.data as any[]) || []).map((c) => ({
        id: c.id,
        user_id: c.user_id,
        body: c.body,
        created_at: c.created_at,
        display_name: c.display_name,
      }))
    );
    setBoard(
      ((boardRes.data as any[]) || []).map((b) => ({
        id: b.attempt_id,
        user_id: b.user_id,
        audio_url: b.audio_url,
        spoken_text: null,
        duration_seconds: b.duration_seconds,
        overall_score: b.overall_score,
        test_type: b.test_type,
        created_at: b.created_at,
        display_name: b.display_name,
      }))
    );
    setMine(((mineRes.data as Attempt[]) || []).map((r) => ({ ...r, display_name: "You" })));
  };


  useEffect(() => { load(); /* eslint-disable-next-line */ }, [questionId, refreshKey, user?.id]);

  const submit = async () => {
    if (!user || !body.trim()) return;
    setPosting(true);
    const { error } = await (supabase as any)
      .from("question_discussions")
      .insert({ user_id: user.id, question_id: questionId, body: body.trim() });
    setPosting(false);
    if (error) { toast.error(error.message); return; }
    setBody("");
    load();
  };

  return (
    <div className="mt-6 border-t border-border/50 pt-4">
      <h3 className="text-sm font-semibold text-primary mb-2">Discussion</h3>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-transparent border-b border-border/50 rounded-none h-auto p-0 w-full justify-start gap-4">
          <TabsTrigger value="discussion" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-2">
            <MessageCircle className="h-4 w-4 mr-1" /> Discussion
          </TabsTrigger>
          <TabsTrigger value="board" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-2">
            <Trophy className="h-4 w-4 mr-1" /> Board
          </TabsTrigger>
          <TabsTrigger value="me" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-2">
            <User className="h-4 w-4 mr-1" /> Me
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discussion" className="space-y-3 mt-4">
          {user && (
            <div className="flex gap-2">
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share your thoughts on this question..."
                className="min-h-[60px] text-sm"
              />
              <Button onClick={submit} disabled={posting || !body.trim()} size="icon" className="shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No comments yet — be the first!</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="border border-border/50 rounded-lg p-3 bg-card/30">
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {initialsFrom(c.user_id === user?.id ? "You" : c.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">
                    {c.user_id === user?.id ? "You" : c.display_name || "Student"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm">{c.body}</p>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="board" className="space-y-3 mt-4">
          {board.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No submissions yet. Be the first to set a score!</p>
          ) : (
            board.map((a) => (
              <AttemptCard key={a.id} a={a} isMe={a.user_id === user?.id} showAudio={showAudio} />
            ))
          )}
        </TabsContent>

        <TabsContent value="me" className="space-y-3 mt-4">
          {mine.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Your attempts on this question will appear here.</p>
          ) : (
            mine.map((a) => <AttemptCard key={a.id} a={a} isMe showAudio={showAudio} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
