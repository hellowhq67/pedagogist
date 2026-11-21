const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
}

async function requestGemini(apiKey: string, body: Record<string, unknown>): Promise<string> {
  const response = await fetch(GEMINI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    console.error("Gemini API request failed:", response.status);
    throw new Error(`Gemini API request failed: ${response.status}`);
  }

  const result = await response.json() as GeminiResponse;
  const text = result.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
  if (!text) throw new Error("Gemini returned an empty response");
  return text;
}

export function generateGeminiText(apiKey: string, systemPrompt: string, userPrompt: string, temperature = 0.2): Promise<string> {
  return requestGemini(apiKey, {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: { temperature },
  });
}

export function transcribeWithGemini(apiKey: string, instruction: string, audioBase64: string, mimeType: string): Promise<string> {
  return requestGemini(apiKey, {
    systemInstruction: { parts: [{ text: instruction }] },
    contents: [{
      role: "user",
      parts: [
        { text: "Transcribe this audio recording exactly as spoken:" },
        { inlineData: { mimeType, data: audioBase64 } },
      ],
    }],
    generationConfig: { temperature: 0.1 },
  });
}
