import { supabase } from "@/integrations/supabase/client";
import { toPteScale } from "./pteScale";

export interface UploadRecordingArgs {
  blob: Blob;
  questionId: string;
  questionType: string;
  questionTitle?: string;
  durationSeconds?: number;
  transcript?: string;
  score?: any;
}

export async function uploadRecording(args: UploadRecordingArgs) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const ext = args.blob.type.includes("mp4") ? "mp4" : "webm";
  const path = `${user.id}/${args.questionId}/${Date.now()}.${ext}`;

  const { error: upErr } = await supabase
    .storage
    .from("practice-recordings")
    .upload(path, args.blob, { contentType: args.blob.type, upsert: false });
  if (upErr) throw upErr;

  const scaled = args.score?.overallScore != null ? toPteScale(args.score.overallScore) : null;

  const { data, error } = await (supabase as any)
    .from("speaking_recordings")
    .insert({
      user_id: user.id,
      question_id: args.questionId,
      question_type: args.questionType,
      question_title: args.questionTitle,
      audio_path: path,
      duration_seconds: args.durationSeconds ?? 0,
      transcript: args.transcript ?? null,
      score: args.score ?? null,
      scaled_score: scaled,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSignedAudioUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase
    .storage
    .from("practice-recordings")
    .createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data.signedUrl;
}
