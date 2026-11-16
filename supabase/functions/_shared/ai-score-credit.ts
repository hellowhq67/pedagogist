import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export function createScoreAdmin() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) throw new Error("Supabase service credentials are not configured");
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export interface ScoreReservation {
  admin: ReturnType<typeof createScoreAdmin>;
  userId: string;
  responseId: string;
}

export async function beginScoreRequest(
  admin: ReturnType<typeof createScoreAdmin>,
  userId: string,
  responseId: string,
) {
  const { data, error } = await admin.rpc("begin_ai_score_request", {
    p_user_id: userId,
    p_response_id: responseId,
  });
  if (error) throw new Error(error.message || "Could not reserve a scoring credit");
  const result = Array.isArray(data) ? data[0] : data;
  return result as {
    ok: boolean;
    remaining: number;
    tier: string;
    already_scored: boolean;
    saved_score: Record<string, unknown> | null;
  } | null;
}

export async function finishScoreRequest(
  admin: ReturnType<typeof createScoreAdmin>,
  userId: string,
  responseId: string,
  score: unknown,
): Promise<void> {
  const { data, error } = await admin.rpc("complete_ai_score_request", {
    p_user_id: userId,
    p_response_id: responseId,
    p_score: score,
  });
  if (error || data !== true) throw new Error(error?.message || "Could not save the score");
}

export async function refundScoreRequest(
  admin: ReturnType<typeof createScoreAdmin>,
  userId: string,
  responseId: string,
): Promise<number | null> {
  const { data, error } = await admin.rpc("refund_ai_score_request", {
    p_user_id: userId,
    p_response_id: responseId,
  });
  if (error) throw new Error(error.message || "Could not restore the scoring credit");
  return typeof data === "number" ? data : null;
}
