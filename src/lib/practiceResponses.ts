import { supabase } from "@/integrations/supabase/client";

export interface PracticeResponseInput {
  questionId: string;
  section: "speaking" | "writing";
  testType: string;
  responseText: string;
  audioPath?: string | null;
  durationSeconds?: number | null;
}

export async function getPracticeScoreError(error: unknown, fallback: string): Promise<string> {
  const context = typeof error === "object" && error !== null && "context" in error
    ? (error as { context?: unknown }).context
    : null;
  if (context && typeof context === "object" && "json" in context && typeof (context as { json?: unknown }).json === "function") {
    try {
      const body = await (context as { json: () => Promise<{ error?: string }> }).json();
      if (body?.error) return body.error;
    } catch {
      return error instanceof Error ? error.message : fallback;
    }
  }
  return error instanceof Error ? error.message : fallback;
}

export async function savePracticeResponse(input: PracticeResponseInput): Promise<string> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Please sign in before submitting your response.");

  const { data, error } = await supabase
    .from("practice_responses")
    .insert({
      user_id: user.id,
      question_id: input.questionId,
      section: input.section,
      test_type: input.testType,
      response_text: input.responseText,
      audio_path: input.audioPath ?? null,
      duration_seconds: input.durationSeconds ?? null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message || "Could not save your response.");
  return data.id;
}
