import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Processing audio for transcription for user ${user.id}...`);

    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audio);
    console.log(`Audio size: ${binaryAudio.length} bytes`);

    // Use Gemini for audio transcription via the AI gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a precise speech-to-text transcription system. 
Your task is to accurately transcribe spoken English audio.
- Transcribe exactly what is spoken, word for word
- Include all words, even filler words like "um", "uh", "like"
- Preserve the speaker's exact phrasing
- Do not add punctuation that changes meaning
- If audio is unclear, transcribe what you can hear
- If completely inaudible, respond with: [AUDIO_UNCLEAR]
Respond ONLY with the transcription, nothing else.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Transcribe this audio recording exactly as spoken:"
              },
              {
                type: "input_audio",
                input_audio: {
                  data: audio,
                  format: mimeType.includes("wav") ? "wav" : "mp3"
                }
              }
            ]
          }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Transcription error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Transcription failed: ${response.status}`);
    }

    const aiResponse = await response.json();
    const transcription = aiResponse.choices?.[0]?.message?.content?.trim() || "";

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
