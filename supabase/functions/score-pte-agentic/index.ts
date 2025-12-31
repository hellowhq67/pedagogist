import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// PTE Question Types for 2025
type QuestionType =
  // Speaking (7 types)
  | "read_aloud"
  | "repeat_sentence"
  | "retell_lecture"
  | "answer_short_question"
  | "summarise_group_discussion"
  | "respond_to_situation"
  // Writing (2 types)
  | "summarize_written_text"
  | "write_essay"
  // Reading (5 types)
  | "mc_single_reading"
  | "mc_multiple_reading"
  | "reorder_paragraphs"
  | "fill_blanks_dropdown"
  | "fill_blanks_drag"
  // Listening (8 types)
  | "summarize_spoken_text"
  | "mc_multiple_listening"
  | "mc_single_listening"
  | "fill_blanks_listening"
  | "highlight_correct_summary"
  | "select_missing_word"
  | "highlight_incorrect_words"
  | "write_from_dictation";

interface ScoringRequest {
  questionType: QuestionType;
  userId: string;
  submissionId?: string;
  // Speaking inputs
  spokenText?: string;
  originalText?: string;
  audioUrl?: string;
  // Writing inputs
  writtenText?: string;
  sourceText?: string;
  essayPrompt?: string;
  // Listening/Reading inputs
  selectedOptions?: string[];
  correctAnswer?: string | string[];
  orderedItems?: string[];
  discussionTranscript?: any;
  situationContext?: string;
  lectureContent?: string;
}

interface ScoreResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  traitScores: Record<string, number>;
  feedback: {
    strengths: string[];
    improvements: string[];
    tips: string[];
  };
  skillContributions: Record<string, number>;
  confidence: number;
  needsHumanReview: boolean;
}

// PTE 2025 Max Scores
const MAX_SCORES: Record<QuestionType, number> = {
  read_aloud: 15,
  repeat_sentence: 13,
  retell_lecture: 16,
  answer_short_question: 1,
  summarise_group_discussion: 16,
  respond_to_situation: 13,
  summarize_written_text: 12,
  write_essay: 26,
  mc_single_reading: 1,
  mc_multiple_reading: 2,
  reorder_paragraphs: 4,
  fill_blanks_dropdown: 1,
  fill_blanks_drag: 1,
  summarize_spoken_text: 12,
  mc_multiple_listening: 2,
  mc_single_listening: 1,
  fill_blanks_listening: 1,
  highlight_correct_summary: 1,
  select_missing_word: 1,
  highlight_incorrect_words: 2,
  write_from_dictation: 1,
};

// Skill contributions by question type
const SKILL_CONTRIBUTIONS: Record<QuestionType, Record<string, number>> = {
  read_aloud: { speaking: 0.5, reading: 0.5 },
  repeat_sentence: { speaking: 0.5, listening: 0.5 },
  retell_lecture: { speaking: 0.5, listening: 0.5 },
  answer_short_question: { speaking: 0.5, listening: 0.5 },
  summarise_group_discussion: { speaking: 0.55, listening: 0.45 },
  respond_to_situation: { speaking: 1.0 },
  summarize_written_text: { writing: 0.8, reading: 0.2 },
  write_essay: { writing: 1.0 },
  mc_single_reading: { reading: 1.0 },
  mc_multiple_reading: { reading: 1.0 },
  reorder_paragraphs: { reading: 1.0 },
  fill_blanks_dropdown: { reading: 1.0 },
  fill_blanks_drag: { reading: 1.0 },
  summarize_spoken_text: { writing: 0.5, listening: 0.5 },
  mc_multiple_listening: { listening: 1.0 },
  mc_single_listening: { listening: 1.0 },
  fill_blanks_listening: { writing: 0.5, listening: 0.5 },
  highlight_correct_summary: { listening: 1.0 },
  select_missing_word: { listening: 1.0 },
  highlight_incorrect_words: { listening: 1.0 },
  write_from_dictation: { writing: 0.5, listening: 0.5 },
};

// Questions requiring human review
const HUMAN_REVIEW_TYPES: QuestionType[] = [
  "write_essay",
  "summarize_written_text",
  "summarize_spoken_text",
  "retell_lecture",
  "summarise_group_discussion",
  "respond_to_situation",
  "read_aloud",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: ScoringRequest = await req.json();
    const { questionType, userId, submissionId } = request;

    console.log(`[AGENTIC SCORER] Processing ${questionType} for user ${userId}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check user credits
    const { data: canUseCredit } = await supabase.rpc("use_scoring_credit", {
      p_user_id: userId,
    });

    if (!canUseCredit) {
      return new Response(
        JSON.stringify({ error: "Daily scoring limit reached. Please upgrade your plan or wait until tomorrow." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Route to appropriate scoring agent
    let result: ScoreResult;
    const maxScore = MAX_SCORES[questionType];

    if (isSpeakingQuestion(questionType)) {
      result = await scoreSpeaking(request, LOVABLE_API_KEY);
    } else if (isWritingQuestion(questionType)) {
      result = await scoreWriting(request, LOVABLE_API_KEY);
    } else if (isReadingQuestion(questionType)) {
      result = scoreReading(request);
    } else if (isListeningQuestion(questionType)) {
      result = await scoreListening(request, LOVABLE_API_KEY);
    } else {
      throw new Error(`Unknown question type: ${questionType}`);
    }

    // Add metadata
    result.maxScore = maxScore;
    result.percentage = Math.round((result.totalScore / maxScore) * 100);
    result.skillContributions = SKILL_CONTRIBUTIONS[questionType];
    result.needsHumanReview = HUMAN_REVIEW_TYPES.includes(questionType) && result.confidence < 0.8;

    // Save score to database if submissionId provided
    if (submissionId) {
      await supabase.from("scores").insert({
        submission_id: submissionId,
        user_id: userId,
        total_score: result.totalScore,
        max_score: result.maxScore,
        percentage: result.percentage,
        trait_scores: result.traitScores,
        skill_contributions: result.skillContributions,
        feedback: result.feedback,
        status: result.needsHumanReview ? "needs_review" : "completed",
        confidence_score: result.confidence,
        scoring_method: "ai",
        model_version: "gemini-2.5-flash",
        scored_at: new Date().toISOString(),
      });
    }

    console.log(`[AGENTIC SCORER] Score: ${result.totalScore}/${result.maxScore} (${result.percentage}%)`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[AGENTIC SCORER] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Scoring failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Type guards
function isSpeakingQuestion(type: QuestionType): boolean {
  return ["read_aloud", "repeat_sentence", "retell_lecture", "answer_short_question", "summarise_group_discussion", "respond_to_situation"].includes(type);
}

function isWritingQuestion(type: QuestionType): boolean {
  return ["summarize_written_text", "write_essay"].includes(type);
}

function isReadingQuestion(type: QuestionType): boolean {
  return ["mc_single_reading", "mc_multiple_reading", "reorder_paragraphs", "fill_blanks_dropdown", "fill_blanks_drag"].includes(type);
}

function isListeningQuestion(type: QuestionType): boolean {
  return ["summarize_spoken_text", "mc_multiple_listening", "mc_single_listening", "fill_blanks_listening", "highlight_correct_summary", "select_missing_word", "highlight_incorrect_words", "write_from_dictation"].includes(type);
}

// Speaking Scoring Agent
async function scoreSpeaking(request: ScoringRequest, apiKey: string): Promise<ScoreResult> {
  const { questionType, spokenText, originalText, discussionTranscript, situationContext, lectureContent } = request;

  const systemPrompt = `You are an expert PTE Academic Speaking evaluator using Pearson's official 2025 scoring methodology.

SCORING CRITERIA (0-90 scale for traits):
- CONTENT: Word accuracy, key points coverage, relevance
- ORAL FLUENCY: Speech rhythm, pauses, hesitations, speaking rate
- PRONUNCIATION: Phoneme accuracy, stress, intonation

Return JSON only:
{
  "totalScore": <calculated from traits>,
  "traitScores": { "content": <0-90>, "fluency": <0-90>, "pronunciation": <0-90> },
  "confidence": <0.0-1.0>,
  "feedback": {
    "strengths": ["point1", "point2"],
    "improvements": ["point1", "point2"],
    "tips": ["tip1", "tip2"]
  }
}`;

  let userPrompt = "";
  
  switch (questionType) {
    case "read_aloud":
      userPrompt = `READ ALOUD:\nOriginal: "${originalText}"\nSpoken: "${spokenText}"\n\nScore content (40%), fluency (30%), pronunciation (30%). Max 15 points.`;
      break;
    case "repeat_sentence":
      userPrompt = `REPEAT SENTENCE:\nOriginal: "${originalText}"\nRepeated: "${spokenText}"\n\nScore content (50%), fluency (25%), pronunciation (25%). Max 13 points.`;
      break;
    case "retell_lecture":
      userPrompt = `RETELL LECTURE:\nLecture: "${lectureContent}"\nRetelling: "${spokenText}"\n\nScore content (50%), fluency (25%), pronunciation (25%). Max 16 points.`;
      break;
    case "summarise_group_discussion":
      userPrompt = `SUMMARISE GROUP DISCUSSION:\nDiscussion: ${JSON.stringify(discussionTranscript)}\nSummary: "${spokenText}"\n\nScore content covering all speakers (50%), fluency (25%), pronunciation (25%). Max 16 points.`;
      break;
    case "respond_to_situation":
      userPrompt = `RESPOND TO SITUATION:\nContext: "${situationContext}"\nResponse: "${spokenText}"\n\nScore appropriateness of tone (40%), relevance (30%), fluency (15%), pronunciation (15%). Max 13 points.`;
      break;
    case "answer_short_question":
      userPrompt = `ANSWER SHORT QUESTION:\nExpected: "${originalText}"\nAnswer: "${spokenText}"\n\nBinary scoring: correct = 1, incorrect = 0. Accept synonyms.`;
      break;
  }

  const response = await callAI(systemPrompt, userPrompt, apiKey);
  return parseAIResponse(response, questionType);
}

// Writing Scoring Agent
async function scoreWriting(request: ScoringRequest, apiKey: string): Promise<ScoreResult> {
  const { questionType, writtenText, sourceText, essayPrompt } = request;

  const systemPrompt = `You are an expert PTE Academic Writing evaluator using Pearson's official 2025 scoring methodology.

SCORING CRITERIA (0-90 scale for traits):
- CONTENT: Topic relevance, completeness, accuracy
- FORM: Word count, format requirements, structure
- GRAMMAR: Sentence structure, tense, agreement
- VOCABULARY: Range, precision, appropriateness
- SPELLING: Accuracy

Return JSON only:
{
  "totalScore": <calculated from traits>,
  "traitScores": { "content": <0-90>, "form": <0-90>, "grammar": <0-90>, "vocabulary": <0-90>, "spelling": <0-90> },
  "confidence": <0.0-1.0>,
  "feedback": {
    "strengths": ["point1", "point2"],
    "improvements": ["point1", "point2"],
    "tips": ["tip1", "tip2"]
  }
}`;

  let userPrompt = "";
  const wordCount = writtenText?.split(/\s+/).length || 0;

  switch (questionType) {
    case "summarize_written_text":
      userPrompt = `SUMMARIZE WRITTEN TEXT:\nSource: "${sourceText}"\nSummary (${wordCount} words, should be 5-75 in one sentence): "${writtenText}"\n\nScore: content (2), form (2), grammar (2), vocabulary (1). Max 7 points normalized to 12.`;
      break;
    case "write_essay":
      userPrompt = `WRITE ESSAY:\nPrompt: "${essayPrompt}"\nEssay (${wordCount} words, should be 200-300): "${writtenText}"\n\nScore: content (3), form (2), grammar (2), vocabulary (2), spelling (2). Max 26 points.`;
      break;
  }

  const response = await callAI(systemPrompt, userPrompt, apiKey);
  return parseAIResponse(response, questionType);
}

// Reading Scoring - Deterministic
function scoreReading(request: ScoringRequest): ScoreResult {
  const { questionType, selectedOptions, correctAnswer, orderedItems } = request;
  
  let totalScore = 0;
  const maxScore = MAX_SCORES[questionType];
  
  switch (questionType) {
    case "mc_single_reading":
    case "mc_single_listening":
      totalScore = selectedOptions?.[0] === correctAnswer ? 1 : 0;
      break;
      
    case "mc_multiple_reading":
    case "mc_multiple_listening":
      const correct = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
      const selected = selectedOptions || [];
      let correctCount = selected.filter(s => correct.includes(s)).length;
      let incorrectCount = selected.filter(s => !correct.includes(s)).length;
      totalScore = Math.max(0, correctCount - incorrectCount);
      break;
      
    case "reorder_paragraphs":
      if (orderedItems && Array.isArray(correctAnswer)) {
        let pairs = 0;
        for (let i = 0; i < orderedItems.length - 1; i++) {
          const currentIdx = correctAnswer.indexOf(orderedItems[i]);
          const nextIdx = correctAnswer.indexOf(orderedItems[i + 1]);
          if (nextIdx === currentIdx + 1) pairs++;
        }
        totalScore = pairs;
      }
      break;
      
    case "fill_blanks_dropdown":
    case "fill_blanks_drag":
      if (selectedOptions && Array.isArray(correctAnswer)) {
        totalScore = selectedOptions.filter((s, i) => s === correctAnswer[i]).length;
      }
      break;
  }

  return {
    totalScore,
    maxScore,
    percentage: Math.round((totalScore / maxScore) * 100),
    traitScores: { accuracy: totalScore },
    feedback: {
      strengths: totalScore === maxScore ? ["Perfect answer!"] : ["Good attempt"],
      improvements: totalScore < maxScore ? ["Review the correct answers"] : [],
      tips: ["Practice more questions of this type"],
    },
    skillContributions: SKILL_CONTRIBUTIONS[questionType],
    confidence: 1.0,
    needsHumanReview: false,
  };
}

// Listening Scoring Agent
async function scoreListening(request: ScoringRequest, apiKey: string): Promise<ScoreResult> {
  const { questionType, writtenText, spokenText, selectedOptions, correctAnswer, lectureContent } = request;

  // MCQ-type questions use deterministic scoring
  if (["mc_multiple_listening", "mc_single_listening", "highlight_correct_summary", "select_missing_word"].includes(questionType)) {
    return scoreReading(request);
  }

  // Content-based questions use AI
  const systemPrompt = `You are an expert PTE Academic Listening evaluator.

SCORING CRITERIA:
For summarize_spoken_text: content (2), form (2), grammar (2), vocabulary (1), spelling (1). Max 10 -> normalized to 12.
For fill_blanks_listening: exact word match per blank
For highlight_incorrect_words: identify wrong words in transcript
For write_from_dictation: words correctly transcribed

Return JSON:
{
  "totalScore": <number>,
  "traitScores": { ... },
  "confidence": <0.0-1.0>,
  "feedback": { "strengths": [], "improvements": [], "tips": [] }
}`;

  let userPrompt = "";
  
  switch (questionType) {
    case "summarize_spoken_text":
      const wc = writtenText?.split(/\s+/).length || 0;
      userPrompt = `SUMMARIZE SPOKEN TEXT:\nAudio content: "${lectureContent}"\nWritten summary (${wc} words, should be 50-70): "${writtenText}"`;
      break;
    case "fill_blanks_listening":
      userPrompt = `FILL BLANKS LISTENING:\nCorrect: ${JSON.stringify(correctAnswer)}\nAnswers: ${JSON.stringify(selectedOptions)}`;
      break;
    case "highlight_incorrect_words":
      userPrompt = `HIGHLIGHT INCORRECT WORDS:\nOriginal transcript: "${lectureContent}"\nHighlighted: ${JSON.stringify(selectedOptions)}`;
      break;
    case "write_from_dictation":
      userPrompt = `WRITE FROM DICTATION:\nOriginal: "${lectureContent}"\nWritten: "${writtenText}"`;
      break;
  }

  const response = await callAI(systemPrompt, userPrompt, apiKey);
  return parseAIResponse(response, questionType);
}

// Helper: Call Lovable AI
async function callAI(systemPrompt: string, userPrompt: string, apiKey: string): Promise<string> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI gateway error:", response.status, errorText);
    
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please try again in a moment.");
    }
    if (response.status === 402) {
      throw new Error("AI usage limit reached. Please add credits.");
    }
    throw new Error(`AI scoring failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// Helper: Parse AI Response
function parseAIResponse(content: string, questionType: QuestionType): ScoreResult {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    
    const parsed = JSON.parse(jsonMatch[0]);
    const maxScore = MAX_SCORES[questionType];
    
    // Calculate total from traits if not provided
    let totalScore = parsed.totalScore;
    if (!totalScore && parsed.traitScores) {
      const traits = Object.values(parsed.traitScores) as number[];
      const avgTrait = traits.reduce((a, b) => a + b, 0) / traits.length;
      totalScore = Math.round((avgTrait / 90) * maxScore);
    }
    
    return {
      totalScore: Math.min(totalScore || 0, maxScore),
      maxScore,
      percentage: Math.round(((totalScore || 0) / maxScore) * 100),
      traitScores: parsed.traitScores || {},
      feedback: parsed.feedback || { strengths: [], improvements: [], tips: [] },
      skillContributions: SKILL_CONTRIBUTIONS[questionType],
      confidence: parsed.confidence || 0.85,
      needsHumanReview: false,
    };
  } catch (e) {
    console.error("Parse error:", e, content);
    throw new Error("Failed to parse AI response");
  }
}
