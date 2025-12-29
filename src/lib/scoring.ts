import { supabase } from "@/integrations/supabase/client";

export interface ScoreResult {
  overallScore: number;
  content: number;
  fluency: number;
  pronunciation: number;
  feedback: string[];
  detailedAnalysis: {
    strengths: string[];
    improvements: string[];
    tips: string[];
  };
}

export type TestType =
  | "read-aloud"
  | "repeat-sentence"
  | "describe-image"
  | "retell-lecture"
  | "answer-short-question"
  | "summarize-spoken-text"
  | "read-and-retell"
  | "summarize-group-discussion"
  | "respond-to-situation";

interface ScoringParams {
  testType: TestType;
  spokenText: string;
  originalText?: string;
  imageDescription?: string;
  lectureContent?: string;
  question?: string;
  expectedAnswer?: string;
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const base64 = await blobToBase64(audioBlob);
  
  const { data, error } = await supabase.functions.invoke("transcribe-audio", {
    body: { 
      audio: base64,
      mimeType: audioBlob.type
    },
  });

  if (error) {
    console.error("Transcription error:", error);
    throw new Error(error.message || "Transcription failed");
  }

  if (!data?.text || !data.success) {
    throw new Error("Could not understand the audio. Please try again.");
  }

  return data.text;
}

export async function scoreSpeaking(params: ScoringParams): Promise<ScoreResult> {
  const { data, error } = await supabase.functions.invoke("score-speaking", {
    body: params,
  });

  if (error) {
    console.error("Scoring error:", error);
    throw new Error(error.message || "Scoring failed");
  }

  return data as ScoreResult;
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
