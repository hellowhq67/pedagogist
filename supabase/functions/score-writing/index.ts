import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScoringRequest {
  testType: string;
  writtenText: string;
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

// Daily limits by tier
const DAILY_LIMITS: Record<string, number> = {
  free: 5,
  basic: 50,
  premium: 200,
  enterprise: 1000,
};

const PTE_WEIGHTS: Record<string, { content: number; grammar: number; vocabulary: number; form: number }> = {
  "summarize-written-text": { content: 2, grammar: 2, vocabulary: 1, form: 2 },
  "write-essay": { content: 3, grammar: 2, vocabulary: 2, form: 2 },
  "summarize-written-text-core": { content: 2, grammar: 2, vocabulary: 1, form: 2 },
  "write-email": { content: 2, grammar: 2, vocabulary: 1, form: 2 },
};

async function checkRateLimit(supabase: any, userId: string): Promise<{ allowed: boolean; remaining: number; tier: string }> {
  // Get user's subscription tier
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, daily_credits_used')
    .eq('user_id', userId)
    .single();
  
  const tier = subscription?.tier || 'free';
  const dailyLimit = DAILY_LIMITS[tier] || 5;
  const used = subscription?.daily_credits_used || 0;
  
  if (used >= dailyLimit) {
    return { allowed: false, remaining: 0, tier };
  }
  
  // Increment usage
  await supabase
    .from('subscriptions')
    .update({ 
      daily_credits_used: used + 1,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
  
  return { allowed: true, remaining: dailyLimit - used - 1, tier };
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

    // Check rate limit
    const rateLimit = await checkRateLimit(supabase, user.id);
    if (!rateLimit.allowed) {
      console.log(`Rate limit exceeded for user ${user.id} (tier: ${rateLimit.tier})`);
      return new Response(
        JSON.stringify({ 
          error: "Daily scoring limit exceeded",
          remaining: 0,
          tier: rateLimit.tier
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Rate limit check passed: ${rateLimit.remaining} remaining (tier: ${rateLimit.tier})`);

    const request: ScoringRequest = await req.json();
    const { testType, writtenText, sourceText, essayPrompt, emailContext } = request;

    console.log(`Scoring writing for ${testType}: "${writtenText.substring(0, 50)}..."`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Scoring failed: ${response.status}`);
    }

    const aiResponse = await response.json();
    const messageContent = aiResponse.choices?.[0]?.message?.content || "";

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

    return new Response(JSON.stringify({
      ...result,
      remaining: rateLimit.remaining,
      tier: rateLimit.tier
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Scoring error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Scoring failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
