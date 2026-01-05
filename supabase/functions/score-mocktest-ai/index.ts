import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// PTE 2025 Question Types
type QuestionType =
  | "read-aloud"
  | "repeat-sentence"
  | "describe-image"
  | "retell-lecture"
  | "answer-short-question"
  | "summarize-written-text"
  | "write-essay"
  | "mc-single"
  | "mc-multiple"
  | "reorder-paragraphs"
  | "fill-blanks-drag"
  | "fill-blanks-dropdown"
  | "highlight-correct-summary"
  | "mc-single-listening"
  | "mc-multiple-listening"
  | "fill-blanks-listening"
  | "highlight-incorrect-words"
  | "write-from-dictation"
  | "select-missing-word"
  | "summarize-spoken-text";

interface ScoringRequest {
  questionType: QuestionType;
  section: string;
  // Speaking inputs
  spokenText?: string;
  originalText?: string;
  // Writing inputs
  writtenText?: string;
  sourceText?: string;
  essayPrompt?: string;
  // Reading/Listening inputs
  selectedOptions?: string[];
  correctAnswers?: string[];
  orderedItems?: string[];
  correctOrder?: string[];
  blankAnswers?: Record<string, string>;
  blanks?: { id: string; correctAnswer: string }[];
}

interface DetailedFeedback {
  totalScore: number;
  maxScore: number;
  percentage: number;
  // For speaking
  pronunciation?: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  fluency?: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  content?: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  // For writing
  grammar?: {
    score: number;
    errors: { text: string; correction: string; explanation: string }[];
  };
  vocabulary?: {
    score: number;
    suggestions: string[];
  };
  structure?: {
    score: number;
    feedback: string;
  };
  // General feedback
  strengths: string[];
  improvements: string[];
  tips: string[];
  overallFeedback: string;
}

// Max scores for each question type
const MAX_SCORES: Record<QuestionType, number> = {
  "read-aloud": 15,
  "repeat-sentence": 13,
  "describe-image": 15,
  "retell-lecture": 16,
  "answer-short-question": 1,
  "summarize-written-text": 12,
  "write-essay": 26,
  "mc-single": 1,
  "mc-multiple": 2,
  "reorder-paragraphs": 5,
  "fill-blanks-drag": 5,
  "fill-blanks-dropdown": 5,
  "highlight-correct-summary": 1,
  "mc-single-listening": 1,
  "mc-multiple-listening": 2,
  "fill-blanks-listening": 5,
  "highlight-incorrect-words": 4,
  "write-from-dictation": 12,
  "select-missing-word": 1,
  "summarize-spoken-text": 10,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: ScoringRequest = await req.json();
    const { questionType } = request;

    console.log(`[MOCKTEST AI SCORER] Processing ${questionType}`);

    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    if (!GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY is not configured");
    }

    const maxScore = MAX_SCORES[questionType] || 1;
    let feedback: DetailedFeedback;

    // Route to appropriate scoring logic
    if (isSpeakingQuestion(questionType)) {
      feedback = await scoreSpeaking(request, GOOGLE_API_KEY, maxScore);
    } else if (isWritingQuestion(questionType)) {
      feedback = await scoreWriting(request, GOOGLE_API_KEY, maxScore);
    } else {
      feedback = scoreObjective(request, maxScore);
    }

    console.log(`[MOCKTEST AI SCORER] Score: ${feedback.totalScore}/${feedback.maxScore}`);

    return new Response(JSON.stringify(feedback), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[MOCKTEST AI SCORER] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Scoring failed",
        totalScore: 0,
        maxScore: 1,
        percentage: 0,
        strengths: [],
        improvements: ["Unable to analyze response"],
        tips: ["Please try again"],
        overallFeedback: "An error occurred during scoring."
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function isSpeakingQuestion(type: QuestionType): boolean {
  return ["read-aloud", "repeat-sentence", "describe-image", "retell-lecture", "answer-short-question"].includes(type);
}

function isWritingQuestion(type: QuestionType): boolean {
  return ["summarize-written-text", "write-essay", "summarize-spoken-text", "write-from-dictation"].includes(type);
}

// Call Google Gemini API directly
async function callGeminiAPI(systemPrompt: string, userPrompt: string, apiKey: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API error:", response.status, errorText);
    throw new Error(`Gemini API failed: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// Speaking Scoring with Pronunciation Analysis
async function scoreSpeaking(
  request: ScoringRequest, 
  apiKey: string,
  maxScore: number
): Promise<DetailedFeedback> {
  const { questionType, spokenText, originalText } = request;

  if (!spokenText) {
    return createEmptyFeedback(maxScore, "No spoken text provided");
  }

  const systemPrompt = `You are an expert PTE Academic Speaking evaluator specializing in pronunciation analysis and fluency assessment.
Analyze the spoken response and provide detailed, actionable feedback.

SCORING CRITERIA (each scored 0-90):
- PRONUNCIATION: Phoneme accuracy, word stress, intonation patterns, connected speech
- FLUENCY: Speech rate, pauses, hesitations, rhythm, smoothness
- CONTENT: Accuracy, completeness, relevance to the prompt

For pronunciation, identify specific words or sounds that were mispronounced and provide IPA transcription where helpful.
For fluency, note any unnatural pauses, hesitations, or pace issues.

Return a valid JSON object with this EXACT structure:
{
  "pronunciationScore": <0-90>,
  "pronunciationIssues": ["issue1", "issue2"],
  "pronunciationSuggestions": ["suggestion1", "suggestion2"],
  "fluencyScore": <0-90>,
  "fluencyIssues": ["issue1", "issue2"],
  "fluencySuggestions": ["suggestion1", "suggestion2"],
  "contentScore": <0-90>,
  "contentIssues": ["issue1", "issue2"],
  "contentSuggestions": ["suggestion1", "suggestion2"],
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "tips": ["tip1", "tip2"],
  "overallFeedback": "Detailed paragraph of feedback"
}`;

  let userPrompt = "";
  switch (questionType) {
    case "read-aloud":
      userPrompt = `READ ALOUD ASSESSMENT:
Original Text: "${originalText}"
Student's Speech (transcribed): "${spokenText}"

Analyze pronunciation accuracy (comparing to original), fluency, and overall delivery.
Pay special attention to:
- Words that differ from the original
- Pronunciation of difficult words
- Intonation and stress patterns
- Pace and natural pauses`;
      break;
    case "repeat-sentence":
      userPrompt = `REPEAT SENTENCE ASSESSMENT:
Original Sentence: "${originalText}"
Student's Repetition: "${spokenText}"

Evaluate how accurately the student repeated the sentence.
Focus on:
- Word accuracy and completeness
- Pronunciation of each word
- Natural intonation pattern
- Fluency and confidence`;
      break;
    case "describe-image":
    case "retell-lecture":
      userPrompt = `${questionType === "describe-image" ? "DESCRIBE IMAGE" : "RETELL LECTURE"} ASSESSMENT:
Student's Response: "${spokenText}"

Evaluate the spoken response for:
- Pronunciation clarity
- Fluency and natural speech flow
- Content organization and completeness
- Vocabulary usage`;
      break;
    default:
      userPrompt = `SPEAKING ASSESSMENT:
Expected Answer: "${originalText || "Open response"}"
Student's Response: "${spokenText}"

Evaluate pronunciation, fluency, and content accuracy.`;
  }

  try {
    const aiResponse = await callGeminiAPI(systemPrompt, userPrompt, apiKey);
    const parsed = parseJsonResponse(aiResponse);
    
    // Calculate total score from components
    const pronunciationScore = normalizeScore(parsed.pronunciationScore || 50, 90);
    const fluencyScore = normalizeScore(parsed.fluencyScore || 50, 90);
    const contentScore = normalizeScore(parsed.contentScore || 50, 90);
    
    const totalScore = Math.round(
      (pronunciationScore * 0.35 + fluencyScore * 0.3 + contentScore * 0.35) * maxScore / 90
    );

    return {
      totalScore: Math.min(totalScore, maxScore),
      maxScore,
      percentage: Math.round((totalScore / maxScore) * 100),
      pronunciation: {
        score: Math.round(pronunciationScore),
        issues: parsed.pronunciationIssues || [],
        suggestions: parsed.pronunciationSuggestions || [],
      },
      fluency: {
        score: Math.round(fluencyScore),
        issues: parsed.fluencyIssues || [],
        suggestions: parsed.fluencySuggestions || [],
      },
      content: {
        score: Math.round(contentScore),
        issues: parsed.contentIssues || [],
        suggestions: parsed.contentSuggestions || [],
      },
      strengths: parsed.strengths || ["Good attempt"],
      improvements: parsed.improvements || ["Continue practicing"],
      tips: parsed.tips || ["Practice regularly"],
      overallFeedback: parsed.overallFeedback || "Keep practicing to improve your speaking skills.",
    };
  } catch (error) {
    console.error("Speaking scoring error:", error);
    return createEmptyFeedback(maxScore, "Unable to analyze speech");
  }
}

// Writing Scoring with Grammar Correction
async function scoreWriting(
  request: ScoringRequest,
  apiKey: string,
  maxScore: number
): Promise<DetailedFeedback> {
  const { questionType, writtenText, sourceText, essayPrompt } = request;

  if (!writtenText) {
    return createEmptyFeedback(maxScore, "No written text provided");
  }

  const wordCount = writtenText.trim().split(/\s+/).length;

  const systemPrompt = `You are an expert PTE Academic Writing evaluator specializing in grammar correction and vocabulary enhancement.
Analyze the written response and provide detailed, actionable feedback.

SCORING CRITERIA (each scored 0-90):
- CONTENT: Topic relevance, completeness, accuracy
- GRAMMAR: Sentence structure, tense usage, agreement, punctuation
- VOCABULARY: Word choice, range, precision
- STRUCTURE: Organization, coherence, paragraph structure

For grammar errors, provide SPECIFIC corrections with explanations.
For vocabulary, suggest more precise or sophisticated alternatives.

Return a valid JSON object with this EXACT structure:
{
  "contentScore": <0-90>,
  "grammarScore": <0-90>,
  "grammarErrors": [
    {"text": "original text", "correction": "corrected text", "explanation": "why this is wrong"}
  ],
  "vocabularyScore": <0-90>,
  "vocabularySuggestions": ["suggestion1", "suggestion2"],
  "structureScore": <0-90>,
  "structureFeedback": "feedback on organization",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "tips": ["tip1", "tip2"],
  "overallFeedback": "Detailed paragraph of feedback"
}`;

  let userPrompt = "";
  switch (questionType) {
    case "summarize-written-text":
      userPrompt = `SUMMARIZE WRITTEN TEXT ASSESSMENT:
Source Text: "${sourceText}"
Student's Summary (${wordCount} words, should be 5-75 words in ONE sentence): "${writtenText}"

Evaluate:
- Captures main ideas in a single grammatically correct sentence
- Grammar and vocabulary quality
- Word count compliance (5-75 words)`;
      break;
    case "write-essay":
      userPrompt = `ESSAY ASSESSMENT:
Prompt: "${essayPrompt}"
Essay (${wordCount} words, should be 200-300): "${writtenText}"

Evaluate:
- Argument development and coherence
- Grammar accuracy (find ALL errors)
- Vocabulary range and precision
- Essay structure (intro, body, conclusion)`;
      break;
    case "write-from-dictation":
      userPrompt = `WRITE FROM DICTATION ASSESSMENT:
Original: "${sourceText}"
Student's Writing: "${writtenText}"

Evaluate word-for-word accuracy, spelling, and punctuation.`;
      break;
    default:
      userPrompt = `WRITING ASSESSMENT:
Task: ${essayPrompt || sourceText || "Written response"}
Student's Response (${wordCount} words): "${writtenText}"

Evaluate content, grammar, vocabulary, and structure.`;
  }

  try {
    const aiResponse = await callGeminiAPI(systemPrompt, userPrompt, apiKey);
    const parsed = parseJsonResponse(aiResponse);
    
    const contentScore = normalizeScore(parsed.contentScore || 50, 90);
    const grammarScore = normalizeScore(parsed.grammarScore || 50, 90);
    const vocabularyScore = normalizeScore(parsed.vocabularyScore || 50, 90);
    const structureScore = normalizeScore(parsed.structureScore || 50, 90);
    
    // Weight scores based on question type
    let totalScore: number;
    if (questionType === "write-essay") {
      totalScore = Math.round(
        (contentScore * 0.3 + grammarScore * 0.3 + vocabularyScore * 0.2 + structureScore * 0.2) * maxScore / 90
      );
    } else {
      totalScore = Math.round(
        (contentScore * 0.4 + grammarScore * 0.3 + vocabularyScore * 0.15 + structureScore * 0.15) * maxScore / 90
      );
    }

    return {
      totalScore: Math.min(totalScore, maxScore),
      maxScore,
      percentage: Math.round((totalScore / maxScore) * 100),
      content: {
        score: Math.round(contentScore),
        issues: [],
        suggestions: [],
      },
      grammar: {
        score: Math.round(grammarScore),
        errors: parsed.grammarErrors || [],
      },
      vocabulary: {
        score: Math.round(vocabularyScore),
        suggestions: parsed.vocabularySuggestions || [],
      },
      structure: {
        score: Math.round(structureScore),
        feedback: parsed.structureFeedback || "",
      },
      strengths: parsed.strengths || ["Good attempt"],
      improvements: parsed.improvements || ["Continue practicing"],
      tips: parsed.tips || ["Practice regularly"],
      overallFeedback: parsed.overallFeedback || "Keep practicing to improve your writing skills.",
    };
  } catch (error) {
    console.error("Writing scoring error:", error);
    return createEmptyFeedback(maxScore, "Unable to analyze writing");
  }
}

// Objective Scoring (Reading/Listening MC, Fill blanks, etc.)
function scoreObjective(request: ScoringRequest, maxScore: number): DetailedFeedback {
  const { questionType, selectedOptions, correctAnswers, orderedItems, correctOrder, blankAnswers, blanks } = request;

  let score = 0;
  let totalPossible = maxScore;

  if (questionType === "mc-single" || questionType === "mc-single-listening" || 
      questionType === "highlight-correct-summary" || questionType === "select-missing-word") {
    score = selectedOptions?.[0] === correctAnswers?.[0] ? 1 : 0;
    totalPossible = 1;
  } else if (questionType === "mc-multiple" || questionType === "mc-multiple-listening") {
    const correct = correctAnswers || [];
    const selected = selectedOptions || [];
    const correctCount = selected.filter(s => correct.includes(s)).length;
    const incorrectCount = selected.filter(s => !correct.includes(s)).length;
    score = Math.max(0, correctCount - incorrectCount);
    totalPossible = correct.length;
  } else if (questionType === "reorder-paragraphs") {
    if (orderedItems && correctOrder) {
      for (let i = 0; i < orderedItems.length - 1; i++) {
        const currentIdx = correctOrder.indexOf(orderedItems[i]);
        const nextIdx = correctOrder.indexOf(orderedItems[i + 1]);
        if (nextIdx === currentIdx + 1) score++;
      }
      totalPossible = correctOrder.length - 1;
    }
  } else if (questionType.includes("fill-blanks")) {
    if (blankAnswers && blanks) {
      blanks.forEach((blank) => {
        if (blankAnswers[blank.id]?.toLowerCase() === blank.correctAnswer.toLowerCase()) {
          score++;
        }
      });
      totalPossible = blanks.length;
    } else if (selectedOptions && correctAnswers) {
      selectedOptions.forEach((opt, idx) => {
        if (opt === correctAnswers[idx]) score++;
      });
      totalPossible = correctAnswers.length;
    }
  }

  const percentage = totalPossible > 0 ? Math.round((score / totalPossible) * 100) : 0;

  return {
    totalScore: score,
    maxScore: totalPossible,
    percentage,
    strengths: score === totalPossible ? ["Perfect answer!"] : score > 0 ? ["Some correct answers"] : [],
    improvements: score < totalPossible ? ["Review incorrect answers"] : [],
    tips: ["Practice more questions of this type"],
    overallFeedback: score === totalPossible 
      ? "Excellent work! You answered correctly."
      : `You scored ${score} out of ${totalPossible}. Review the correct answers and try again.`,
  };
}

// Helper functions
function parseJsonResponse(content: string): Record<string, any> {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("JSON parse error:", e);
  }
  return {};
}

function normalizeScore(score: number, max: number): number {
  return Math.max(0, Math.min(score, max));
}

function createEmptyFeedback(maxScore: number, message: string): DetailedFeedback {
  return {
    totalScore: 0,
    maxScore,
    percentage: 0,
    strengths: [],
    improvements: [message],
    tips: ["Ensure your response is recorded properly"],
    overallFeedback: message,
  };
}
