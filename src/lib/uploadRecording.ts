import { supabase } from "@/integrations/supabase/client";

export interface UploadRecordingArgs {
  blob: Blob;
  questionId: string;
}

/** Uploads a recording to the practice-recordings bucket and returns its storage path. */
export async function uploadRecording({ blob, questionId }: UploadRecordingArgs): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const ext = blob.type.includes("mp4") ? "mp4" : "webm";
  const path = `${user.id}/${questionId}/${Date.now()}.${ext}`;

  const { error } = await supabase
    .storage
    .from("practice-recordings")
    .upload(path, blob, { contentType: blob.type, upsert: false });

  if (error) {
    console.error("Recording upload failed:", error);
    return null;
  }
  return path;
}

/** Resolve a storage path to a temporary signed URL for playback. */
export async function getSignedAudioUrl(path: string): Promise<string | null> {
  if (!path) return null;
  // If a full URL was stored, just return it.
  if (path.startsWith("http")) return path;
  const { data, error } = await supabase
    .storage
    .from("practice-recordings")
    .createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data.signedUrl;
}
