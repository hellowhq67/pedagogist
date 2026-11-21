import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { beginScoreRequest, createScoreAdmin, finishScoreRequest, refundScoreRequest, type ScoreReservation } from "../_shared/ai-score-credit.ts";
import { generateGeminiText } from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScoringRequest {
  responseId: string;
  testType: string;
  writtenText?: string;
  sourceText?: string;
  essayPrompt?: string;
  emailContext?: string;
}

interface ScoreResult {
  overallScore: number;
  content: number;
  grammar: number;
  vocabulary: number;
  form: number;
  feedback: string[];
  detailedAnalysis: {
    strengths: string[];
    improvements: string[];
    tips: string[];
  };
}

const PTE_WEIGHTS: Record<string, { content: number; grammar: number; vocabulary: number; form: number }> = {
  "summarize-written-text": { content: 2, grammar: 2, vocabulary: 1, form: 2 },
  "write-essay": { content: 3, grammar: 2, vocabulary: 2, form: 2 },
  "summarize-written-text-core": { content: 2, grammar: 2, vocabulary: 1, form: 2 },
  "write-email": { content: 2, grammar: 2, vocabulary: 1, form: 2 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let reserved: ScoreReservation | null = null;
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

    const request: ScoringRequest = await req.json();
    const { responseId, testType, sourceText, essayPrompt, emailContext } = request;
    if (!responseId || !PTE_WEIGHTS[testType] || !/^[0-9a-f-]{36}$/i.test(responseId)) {
      return new Response(JSON.stringify({ error: "Invalid scoring request" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const admin = createScoreAdmin();
    const { data: savedResponse, error: responseError } = await admin
      .from("practice_responses")
      .select("id, user_id, section, test_type, response_text")
      .eq("id", responseId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (responseError || !savedResponse) {
      return new Response(JSON.stringify({ error: "Submitted response not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (savedResponse.section !== "writing" || savedResponse.test_type !== testType) {
      return new Response(JSON.stringify({ error: "Submitted response does not match this scoring request" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const writtenText = savedResponse.response_text?.trim();
    const wordCount = writtenText ? writtenText.split(/\s+/).length : 0;
    const wordLimits: Record<string, [number, number]> = {
      "summarize-written-text": [5, 75],
      "summarize-written-text-core": [5, 75],
      "write-essay": [200, 300],
      "write-email": [50, 120],
    };
    const [minWords, maxWords] = wordLimits[testType] ?? [1, 300];
    if (!writtenText || writtenText.length > 20000 || wordCount < minWords || wordCount > maxWords) {
      return new Response(JSON.stringify({ error: `Response must contain ${minWords}-${maxWords} words before scoring` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const claim = await beginScoreRequest(admin, user.id, responseId);
    if (!claim?.ok) {
      const noCredits = (claim?.remaining ?? 0) <= 0;
      return new Response(JSON.stringify({
        error: noCredits ? "No scoring credits remaining" : "This response is already being scored",
        remaining: claim?.remaining ?? 0,
        tier: claim?.tier ?? "free",
      }), {
        status: noCredits ? 402 : 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (claim.already_scored && claim.saved_score) {
      return new Response(JSON.stringify({ ...claim.saved_score, remaining: claim.remaining, tier: claim.tier }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    reserved = { admin, userId: user.id, responseId };
    console.log(`Scoring saved writing response for ${testType}`);

    const systemPrompt = `You are an expert PTE Academic examiner specializing in writing assessment. 
You must provide accurate, consistent scoring based on PTE Academic criteria.

SCORING CRITERIA (each scored 0-90):
1. CONTENT (Topic relevance, completeness, accuracy)
2. GRAMMAR (Sentence structure, tense, agreement, articles)
3. VOCABULARY (Range, precision, appropriateness)
4. FORM (Word count, format requirements, organization)

RESPONSE FORMAT - JSON ONLY:
{
  "content": <0-90>,
  "grammar": <0-90>,
  "vocabulary": <0-90>,
  "form": <0-90>,
  "detailedAnalysis": {
    "strengths": ["strength1", "strength2"],
    "improvements": ["area1", "area2"],
    "tips": ["tip1", "tip2"]
  }
}`;

    let userPrompt = "";

    switch (testType) {
      case "summarize-written-text":
      case "summarize-written-text-core":
        userPrompt = `TASK: Summarize Written Text
SOURCE TEXT: "${sourceText}"
RESPONSE (should be one sentence, 5-75 words): "${writtenText}"

Evaluate: 
- Is it one grammatically correct sentence?
- Does it capture key points?
- Word count compliance (5-75 words)`;
        break;

      case "write-essay":
        userPrompt = `TASK: Write Essay (200-300 words)
PROMPT: "${essayPrompt}"
RESPONSE: "${writtenText}"

Evaluate:
- Argument development and structure
- Introduction, body paragraphs, conclusion
- Word count compliance (200-300 words)
- Grammar and vocabulary range`;
        break;

      case "write-email":
        userPrompt = `TASK: Write Email (50-120 words)
CONTEXT: "${emailContext}"
RESPONSE: "${writtenText}"

Evaluate:
- Appropriate tone and register
- All required points addressed
- Email format (greeting, body, closing)
- Word count compliance (50-120 words)`;
        break;

      default:
        userPrompt = `TASK: ${testType}
RESPONSE: "${writtenText}"
Provide general writing assessment.`;
    }

    const messageContent = await generateGeminiText(GEMINI_API_KEY, systemPrompt, userPrompt, 0.2);

    // Parse JSON response
    let parsed: any;
    try {
      const jsonMatch = messageContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error("JSON parse error:", e, messageContent);
      throw new Error("Failed to parse scoring response");
    }

    // Validate and clamp scores
    const clamp = (val: number, min = 0, max = 90) => Math.min(max, Math.max(min, Math.round(val)));
    
    const content = clamp(parsed.content || 50);
    const grammar = clamp(parsed.grammar || 50);
    const vocabulary = clamp(parsed.vocabulary || 50);
    const form = clamp(parsed.form || 50);

    // Calculate weighted overall score
    const weights = PTE_WEIGHTS[testType] || { content: 1, grammar: 1, vocabulary: 1, form: 1 };
    const totalWeight = weights.content + weights.grammar + weights.vocabulary + weights.form;
    const overallScore = clamp(
      Math.round(
        (content * weights.content + grammar * weights.grammar + 
         vocabulary * weights.vocabulary + form * weights.form) / totalWeight
      )
    );

    const result: ScoreResult = {
      overallScore,
      content,
      grammar,
      vocabulary,
      form,
      feedback: [
        `Content: ${content}/90`,
        `Grammar: ${grammar}/90`,
        `Vocabulary: ${vocabulary}/90`,
        `Form: ${form}/90`,
      ],
      detailedAnalysis: {
        strengths: parsed.detailedAnalysis?.strengths || ["Good attempt"],
        improvements: parsed.detailedAnalysis?.improvements || ["Continue practicing"],
        tips: parsed.detailedAnalysis?.tips || ["Practice regularly"],
      },
    };

    console.log("Writing score result:", JSON.stringify(result));
    await finishScoreRequest(admin, user.id, responseId, result);
    reserved = null;

    const { data: subscription } = await admin
      .from("subscriptions")
      .select("credits_remaining, tier")
      .eq("user_id", user.id)
      .maybeSingle();

    return new Response(JSON.stringify({
      ...result,
      remaining: subscription?.credits_remaining ?? 0,
      tier: subscription?.tier ?? "free",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    if (reserved) {
      try {
        await refundScoreRequest(reserved.admin, reserved.userId, reserved.responseId);
      } catch (refundError) {
        console.error("Failed to restore scoring credit:", refundError);
      }
    }
    console.error("Scoring error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Scoring failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
