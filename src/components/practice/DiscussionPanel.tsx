import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getSignedAudioUrl } from "@/lib/uploadRecording";
import { MessageCircle, Trophy, User, Share2, Send } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Recording {
  id: string;
  user_id: string;
  audio_path: string;
  duration_seconds: number;
  scaled_score: number | null;
  created_at: string;
}
interface Discussion {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
}

interface Props {
  questionId: string;
  refreshKey?: number;
}

function AudioPlayer({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => { getSignedAudioUrl(path).then(setUrl); }, [path]);
  if (!url) return <div className="h-8 w-full bg-muted/40 rounded animate-pulse" />;
  return <audio controls src={url} className="h-8 w-full" />;
}

function RecordingCard({ rec, name }: { rec: Recording; name: string }) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div className="border border-border/50 rounded-lg p-3 bg-card/30">
      <div className="flex items-center gap-2 mb-2">
        <Avatar className="h-7 w-7">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
        </Avatar>
        <span className="font-medium text-sm">{name}</span>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(rec.created_at), { addSuffix: true })}
        </span>
        <Share2 className="ml-auto h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" />
      </div>
      <AudioPlayer path={rec.audio_path} />
      {rec.scaled_score != null && (
        <Badge variant="outline" className="mt-2 text-primary border-primary/40">
          Score Info {rec.scaled_score}/90
        </Badge>
      )}
    </div>
  );
}

export function DiscussionPanel({ questionId, refreshKey = 0 }: Props) {
  const { user } = useAuth();
  const [tab, setTab] = useState("discussion");
  const [comments, setComments] = useState<Discussion[]>([]);
  const [allRecordings, setAllRecordings] = useState<Recording[]>([]);
  const [myRecordings, setMyRecordings] = useState<Recording[]>([]);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  const load = async () => {
    const sb = supabase as any;
    const [comRes, recRes, mineRes] = await Promise.all([
      sb.from("question_discussions")
        .select("id, user_id, body, created_at")
        .eq("question_id", questionId)
        .order("created_at", { ascending: false }),
      sb.from("speaking_recordings")
        .select("id, user_id, audio_path, duration_seconds, scaled_score, created_at")
        .eq("question_id", questionId)
        .order("scaled_score", { ascending: false, nullsFirst: false })
        .limit(20),
      user
        ? sb.from("speaking_recordings")
            .select("id, user_id, audio_path, duration_seconds, scaled_score, created_at")
            .eq("question_id", questionId)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [] as any[] }),
    ]);
    setComments((comRes.data as Discussion[]) || []);
    setAllRecordings((recRes.data as Recording[]) || []);
    setMyRecordings((mineRes.data as Recording[]) || []);
  };

  useEffect(() => { load(); }, [questionId, refreshKey, user?.id]);

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
                  <Avatar className="h-6 w-6"><AvatarFallback className="text-xs">U</AvatarFallback></Avatar>
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
          {allRecordings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No recordings yet. Be the first to set a score!</p>
          ) : (
            allRecordings.map((r) => (
              <RecordingCard key={r.id} rec={r} name={r.user_id === user?.id ? "You" : "Student"} />
            ))
          )}
        </TabsContent>

        <TabsContent value="me" className="space-y-3 mt-4">
          {myRecordings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Your attempts on this question will appear here.</p>
          ) : (
            myRecordings.map((r) => <RecordingCard key={r.id} rec={r} name="You" />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
