import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScoringRequest {
  testType: 
    | "read-aloud"
    | "repeat-sentence"
    | "describe-image"
    | "retell-lecture"
    | "answer-short-question"
    | "summarize-spoken-text"
    | "read-and-retell";
  originalText?: string;
  spokenText: string;
  imageDescription?: string;
  lectureContent?: string;
  question?: string;
  expectedAnswer?: string;
}

interface ScoreResult {
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

// PTE Scoring weights based on Pearson official methodology
const PTE_WEIGHTS = {
  "read-aloud": { content: 0.4, fluency: 0.3, pronunciation: 0.3 },
  "repeat-sentence": { content: 0.5, fluency: 0.25, pronunciation: 0.25 },
  "describe-image": { content: 0.5, fluency: 0.25, pronunciation: 0.25 },
  "retell-lecture": { content: 0.5, fluency: 0.25, pronunciation: 0.25 },
  "answer-short-question": { content: 0.8, fluency: 0.1, pronunciation: 0.1 },
  "summarize-spoken-text": { content: 0.5, fluency: 0.25, pronunciation: 0.25 },
  "read-and-retell": { content: 0.5, fluency: 0.25, pronunciation: 0.25 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { testType, originalText, spokenText, imageDescription, lectureContent, question, expectedAnswer } = await req.json() as ScoringRequest;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Enhanced PTE-aligned scoring prompt based on Pearson's official methodology
    const systemPrompt = `You are an expert PTE Academic Speaking evaluator trained on Pearson's official scoring methodology.

## PTE OFFICIAL SCORING CRITERIA

### CONTENT (0-90)
For Read Aloud / Repeat Sentence:
- Score based on word-level accuracy
- Replacements, omissions, and insertions reduce score
- Partial credit for correct words in correct positions

For Describe Image / Re-tell Lecture / Summarize:
- Main ideas coverage (40%)
- Supporting details (30%)
- Logical organization (30%)

For Answer Short Question:
- Binary scoring: correct answer = full marks, incorrect = 0
- Accept synonyms and acceptable alternatives

### ORAL FLUENCY (0-90) - Following Pearson's Automated Scoring
Evaluates the flow and rhythm of speech:
- Smooth delivery with natural rhythm (79-90)
- Occasional hesitations, self-corrections (65-78)
- Noticeable pauses or repetitions (50-64)
- Frequent pauses, hesitant delivery (35-49)
- Major disruptions to speech flow (0-34)

Key indicators:
- Hesitation phenomena (filled pauses like "um", "uh")
- Sentence-internal pauses (unexpected breaks)
- Repetitions and false starts
- Speaking rate (words per minute)

### PRONUNCIATION (0-90) - Based on Pearson's Phoneme Analysis
Evaluates speech clarity and accuracy:

Native-like (79-90):
- All phonemes produced correctly
- Appropriate stress patterns
- Natural intonation contours

Good (65-78):
- Most phonemes correct
- Minor stress/intonation errors
- Easily understood

Fair (50-64):
- Some phoneme errors
- Noticeable accent patterns
- Generally understandable

Poor (35-49):
- Frequent pronunciation errors
- Stress/intonation issues affect comprehension

Very Poor (0-34):
- Many phonemes incorrect
- Difficult to understand

### SPEECH DETECTION ANALYSIS
Analyze for:
1. Pause patterns - location and duration of pauses
2. Speech rate - words per second
3. Filled pauses - "um", "uh", "er", etc.
4. Repetitions - repeated words or phrases
5. Self-corrections - false starts and restarts

### SCORING FORMULA
Calculate weighted overall score based on test type:
- Read Aloud: Content 40%, Fluency 30%, Pronunciation 30%
- Repeat Sentence: Content 50%, Fluency 25%, Pronunciation 25%  
- Describe Image: Content 50%, Fluency 25%, Pronunciation 25%
- Re-tell Lecture: Content 50%, Fluency 25%, Pronunciation 25%
- Answer Short Question: Content 80%, Fluency 10%, Pronunciation 10%

Be strict but fair. Use the full 0-90 scale appropriately.`;

    let userPrompt = "";

    switch (testType) {
      case "read-aloud":
        userPrompt = `## READ ALOUD EVALUATION

### ORIGINAL TEXT:
"${originalText}"

### TRANSCRIBED SPEECH:
"${spokenText}"

### ANALYSIS REQUIREMENTS:

1. **CONTENT SCORING** (Word-level accuracy)
   - Count total words in original
   - Count correctly read words (same word, correct position)
   - Calculate: (correct words / total words) × 90
   - Deduct for: substitutions (-3), omissions (-3), insertions (-2)

2. **FLUENCY SCORING**
   - Analyze pause patterns (marked by punctuation gaps in transcription)
   - Check for hesitation markers
   - Evaluate speech continuity
   - Score: smooth (79-90), minor issues (65-78), noticeable pauses (50-64), hesitant (35-49), fragmented (0-34)

3. **PRONUNCIATION SCORING**
   - Check phoneme accuracy based on word transcription
   - If words are transcribed correctly = good pronunciation
   - If words are mistranscribed = pronunciation issues
   - Evaluate stress patterns on multi-syllable words

Provide specific feedback on what was read well and what needs improvement.`;
        break;

      case "repeat-sentence":
        userPrompt = `## REPEAT SENTENCE EVALUATION

### ORIGINAL SENTENCE:
"${originalText}"

### REPEATED SENTENCE:
"${spokenText}"

### PTE SCORING METHODOLOGY:

1. **CONTENT SCORING** (Word sequence accuracy)
   - Compare word-by-word
   - Full credit for exact match
   - Partial credit: score = (matching words / total words) × 90
   - Order matters: wrong position = 50% credit for that word

2. **FLUENCY SCORING**
   - Natural rhythm matching original sentence
   - No hesitations or restarts
   - Appropriate pausing at natural breaks only

3. **PRONUNCIATION SCORING**
   - Each word pronounced clearly
   - Appropriate sentence-level intonation
   - Word stress on correct syllables

Calculate and provide scores.`;
        break;

      case "describe-image":
        userPrompt = `## DESCRIBE IMAGE EVALUATION

### IMAGE CONTENT:
"${imageDescription}"

### STUDENT'S DESCRIPTION:
"${spokenText}"

### PTE SCORING CRITERIA:

1. **CONTENT SCORING** (Image coverage)
   - Main elements identified (30 points max)
   - Key data/trends mentioned (30 points max)
   - Logical interpretation (20 points max)
   - Conclusion or summary (10 points max)

2. **FLUENCY SCORING**
   - 25-40 seconds of continuous speech expected
   - Natural flow without long pauses
   - Connected discourse with linking words
   - No excessive repetition

3. **PRONUNCIATION SCORING**
   - Clear articulation of technical/data terms
   - Appropriate intonation for descriptions
   - Number and statistic pronunciation

Evaluate coverage of key visual elements and descriptive quality.`;
        break;

      case "retell-lecture":
        userPrompt = `## RE-TELL LECTURE EVALUATION

### ORIGINAL LECTURE CONTENT:
"${lectureContent}"

### STUDENT'S RE-TELLING:
"${spokenText}"

### PTE SCORING METHODOLOGY:

1. **CONTENT SCORING**
   - Main ideas captured (40 points)
   - Supporting details included (30 points)
   - Logical sequence maintained (20 points)
   - Use of own words (not verbatim copying)

2. **FLUENCY SCORING**
   - Continuous speech for 40 seconds
   - Natural discourse markers
   - Minimal hesitations
   - Appropriate pacing

3. **PRONUNCIATION SCORING**
   - Clear pronunciation of key terms
   - Appropriate emphasis on important points
   - Natural intonation patterns

Focus on how well the student captured the essence of the lecture.`;
        break;

      case "answer-short-question":
        userPrompt = `## ANSWER SHORT QUESTION EVALUATION

### QUESTION:
"${question}"

### EXPECTED ANSWER(S):
"${expectedAnswer}"

### STUDENT'S ANSWER:
"${spokenText}"

### PTE SCORING:

1. **CONTENT SCORING** (Primary criterion - 80% weight)
   - CORRECT: Answer matches expected or acceptable synonym = 90
   - PARTIAL: Related but incomplete = 45
   - INCORRECT: Wrong answer = 0

2. **FLUENCY SCORING** (10% weight)
   - Quick, confident response = 90
   - Hesitation before answering = 60
   - Long pause or false start = 30

3. **PRONUNCIATION SCORING** (10% weight)
   - Clear pronunciation of answer word(s)
   - Understandable = 90, Some issues = 60, Unclear = 30

Accept synonyms and equivalent expressions.`;
        break;

      case "summarize-spoken-text":
        userPrompt = `## SUMMARIZE SPOKEN TEXT EVALUATION

### ORIGINAL CONTENT:
"${lectureContent}"

### STUDENT'S SPOKEN SUMMARY:
"${spokenText}"

### PTE SCORING CRITERIA:

1. **CONTENT SCORING**
   - Main points identified (45 points)
   - Accurate representation (25 points)
   - Appropriate length 50-70 words equivalent in speech (20 points)

2. **FLUENCY SCORING**
   - Cohesive summary structure
   - Natural transitions
   - Appropriate speaking pace
   - No excessive pausing

3. **PRONUNCIATION SCORING**
   - Clear articulation throughout
   - Technical terms pronounced correctly
   - Natural speech patterns

Evaluate summary quality and speaking competence.`;
        break;

      case "read-and-retell":
        userPrompt = `## READ AND RETELL EVALUATION

### ORIGINAL TEXT:
"${originalText}"

### STUDENT'S RETELLING:
"${spokenText}"

### PTE SCORING METHODOLOGY:

1. **CONTENT SCORING**
   - Key information covered (40 points)
   - Accurate representation of facts (30 points)
   - Paraphrasing quality (not verbatim) (20 points)

2. **FLUENCY SCORING**
   - 40 seconds of connected speech
   - Natural flow and rhythm
   - Appropriate discourse markers
   - Minimal hesitations

3. **PRONUNCIATION SCORING**
   - Clear pronunciation of content words
   - Appropriate emphasis
   - Natural intonation

Evaluate understanding and oral communication skills.`;
        break;
    }

    userPrompt += `

### REQUIRED OUTPUT FORMAT
Respond ONLY with valid JSON:
{
  "overallScore": <weighted score 0-90>,
  "content": <0-90>,
  "fluency": <0-90>,
  "pronunciation": <0-90>,
  "feedback": [
    "<most important feedback point>",
    "<second feedback point>",
    "<third feedback point>"
  ],
  "detailedAnalysis": {
    "strengths": [
      "<specific strength 1>",
      "<specific strength 2>",
      "<specific strength 3>"
    ],
    "improvements": [
      "<specific area to improve 1>",
      "<specific area to improve 2>",
      "<specific area to improve 3>"
    ],
    "tips": [
      "<actionable practice tip 1>",
      "<actionable practice tip 2>",
      "<actionable practice tip 3>"
    ]
  }
}

Calculate overall using weights: Content ${PTE_WEIGHTS[testType].content * 100}%, Fluency ${PTE_WEIGHTS[testType].fluency * 100}%, Pronunciation ${PTE_WEIGHTS[testType].pronunciation * 100}%`;

    console.log(`Scoring ${testType} with PTE methodology...`);

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
        temperature: 0.2, // Lower for more consistent scoring
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
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
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    let scoreResult: ScoreResult;
    try {
      const cleanedContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      scoreResult = JSON.parse(cleanedContent);
      
      // Validate and recalculate overall score using PTE weights
      const weights = PTE_WEIGHTS[testType];
      const calculatedOverall = Math.round(
        scoreResult.content * weights.content +
        scoreResult.fluency * weights.fluency +
        scoreResult.pronunciation * weights.pronunciation
      );
      
      // Use calculated score if there's a significant discrepancy
      if (Math.abs(calculatedOverall - scoreResult.overallScore) > 5) {
        scoreResult.overallScore = calculatedOverall;
      }
      
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse scoring response");
    }

    console.log(`Scored successfully: Overall ${scoreResult.overallScore}/90 (C:${scoreResult.content} F:${scoreResult.fluency} P:${scoreResult.pronunciation})`);

    return new Response(JSON.stringify(scoreResult), {
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
