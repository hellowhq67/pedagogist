import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { transcribeWithGemini } from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TranscriptionRequest {
  audio: string; // Base64 encoded audio
  mimeType?: string;
}

// Daily limits by tier
const DAILY_LIMITS: Record<string, number> = {
  free: 10,
  basic: 100,
  premium: 500,
  enterprise: 2000,
};

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768): Uint8Array {
  const chunks: Uint8Array[] = [];
  let position = 0;

  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);

    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }

    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

async function checkRateLimit(supabase: any, userId: string): Promise<{ allowed: boolean; remaining: number; tier: string }> {
  // Get user's subscription tier
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, daily_credits_used')
    .eq('user_id', userId)
    .single();
  
  const tier = subscription?.tier || 'free';
  const dailyLimit = DAILY_LIMITS[tier] || 10;
  const used = subscription?.daily_credits_used || 0;
  
  // Transcription has higher limits than scoring
  if (used >= dailyLimit) {
    return { allowed: false, remaining: 0, tier };
  }
  
  return { allowed: true, remaining: dailyLimit - used, tier };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with user's auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check rate limit (but don't increment - transcription is lighter)
    const rateLimit = await checkRateLimit(supabase, user.id);
    if (!rateLimit.allowed) {
      console.log(`Rate limit exceeded for user ${user.id} (tier: ${rateLimit.tier})`);
      return new Response(
        JSON.stringify({ 
          error: "Daily limit exceeded",
          remaining: 0,
          tier: rateLimit.tier
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { audio, mimeType = "audio/webm" } = await req.json() as TranscriptionRequest;

    if (!audio) {
      throw new Error("No audio data provided");
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    console.log(`Processing audio for transcription for user ${user.id}...`);

    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audio);
    console.log(`Audio size: ${binaryAudio.length} bytes`);

    const transcriptionInstruction = `You are a precise speech-to-text transcription system.
Transcribe English audio exactly as spoken, including filler words and repetitions. Preserve the speaker's phrasing. If completely inaudible, respond with [AUDIO_UNCLEAR]. Return only the transcription.`;
    const transcription = await transcribeWithGemini(GEMINI_API_KEY, transcriptionInstruction, audio, mimeType);

    console.log(`Transcription complete: "${transcription.substring(0, 50)}..."`);

    return new Response(
      JSON.stringify({ 
        text: transcription,
        success: transcription !== "[AUDIO_UNCLEAR]"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Transcription error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Transcription failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
