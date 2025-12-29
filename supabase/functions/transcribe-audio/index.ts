import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TranscriptionRequest {
  audio: string; // Base64 encoded audio
  mimeType?: string;
}

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, mimeType = "audio/webm" } = await req.json() as TranscriptionRequest;

    if (!audio) {
      throw new Error("No audio data provided");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing audio for transcription...");

    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audio);
    console.log(`Audio size: ${binaryAudio.length} bytes`);

    // Use Gemini for audio transcription via the AI gateway
    // Send as inline audio data
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
