import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, RotateCcw, CheckCircle, AlertCircle, Lightbulb } from "lucide-react";
import { WritingQuestion } from "@/data/writingQuestions";
import { CountdownTimer } from "@/components/speaking/CountdownTimer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WritingTestProps {
  question: WritingQuestion;
  onComplete: (score: WritingScoreResult, writtenText: string) => void;
  onNext: () => void;
}

interface WritingScoreResult {
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

type Phase = "writing" | "processing" | "results";

export function WritingTest({ question, onComplete, onNext }: WritingTestProps) {
  const [phase, setPhase] = useState<Phase>("writing");
  const [writtenText, setWrittenText] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(question.timeLimit);
  const [score, setScore] = useState<WritingScoreResult | null>(null);

  const wordCount = writtenText.trim().split(/\s+/).filter(Boolean).length;
  const isWithinWordLimit = wordCount >= question.minWords && wordCount <= question.maxWords;

  // Reset state when question changes
  useEffect(() => {
    setPhase("writing");
    setWrittenText("");
    setTimeRemaining(question.timeLimit);
    setScore(null);
  }, [question.id]);

  // Timer countdown
  useEffect(() => {
    if (phase !== "writing" || timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1) {
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, timeRemaining]);

  const handleSubmit = useCallback(async () => {
    if (wordCount < question.minWords) {
      toast.error(`Please write at least ${question.minWords} words`);
      return;
    }

    setPhase("processing");

    try {
      const { data, error } = await supabase.functions.invoke("score-writing", {
        body: {
          testType: question.type,
          writtenText,
          sourceText: question.content.sourceText,
          essayPrompt: question.content.essayPrompt,
          emailContext: question.content.emailContext,
        },
      });

      if (error) throw error;

      setScore(data as WritingScoreResult);
      setPhase("results");
      onComplete(data as WritingScoreResult, writtenText);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to score response");
      setPhase("writing");
    }
  }, [writtenText, wordCount, question, onComplete]);

  const handleRetry = () => {
    setWrittenText("");
    setTimeRemaining(question.timeLimit);
    setScore(null);
    setPhase("writing");
  };

  const getScoreColor = (s: number) => {
    if (s >= 65) return "text-success";
    if (s >= 50) return "text-warning";
    return "text-destructive";
  };

  const getWordCountColor = () => {
    if (wordCount < question.minWords) return "text-destructive";
    if (wordCount > question.maxWords) return "text-warning";
    return "text-success";
  };

  return (
    <div className="space-y-6 animate-fade-slide-up">
      {/* Question Content */}
      <Card className="p-6 bg-card">
        <p className="text-sm text-muted-foreground mb-3">{question.instruction}</p>

        {question.content.sourceText && (
          <div className="p-4 bg-muted/50 rounded-lg mb-4">
            <p className="text-sm font-medium mb-2">Source Text:</p>
            <p className="text-sm leading-relaxed">{question.content.sourceText}</p>
          </div>
        )}

        {question.content.essayPrompt && (
          <p className="text-lg font-medium">{question.content.essayPrompt}</p>
        )}

        {question.content.emailContext && (
          <div className="space-y-3">
            <p className="text-lg">{question.content.emailContext}</p>
            {question.content.emailTasks && (
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {question.content.emailTasks.map((task, i) => (
                  <li key={i}>{task}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Card>

      {/* Writing Area / Results */}
      <Card className="p-6">
        {phase === "writing" && (
          <div className="space-y-4">
            {/* Timer */}
            <div className="flex items-center justify-between">
              <CountdownTimer
                totalSeconds={question.timeLimit}
                currentSeconds={question.timeLimit - timeRemaining}
                isActive={true}
                label="Time Remaining"
                variant="prep"
              />
              <div className="text-right">
                <Badge
                  variant="outline"
                  className={getWordCountColor()}
                >
                  {wordCount} / {question.minWords}-{question.maxWords} words
                </Badge>
              </div>
            </div>

            {/* Text Editor */}
            <Textarea
              value={writtenText}
              onChange={(e) => setWrittenText(e.target.value)}
              placeholder="Start writing your response here..."
              className="min-h-[300px] resize-none text-base leading-relaxed"
            />

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={wordCount < question.minWords}
                className="gradient-primary text-primary-foreground"
              >
                Submit Response
              </Button>
            </div>
          </div>
        )}

        {phase === "processing" && (
          <div className="text-center space-y-4 py-8">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <div>
              <p className="font-medium">Analyzing your response...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Evaluating content, grammar, vocabulary, and form
              </p>
            </div>
          </div>
        )}

        {phase === "results" && score && (
          <div className="space-y-6 animate-score-reveal">
            {/* Overall Score */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
              <p className={`text-6xl font-bold ${getScoreColor(score.overallScore)}`}>
                {score.overallScore}
                <span className="text-2xl text-muted-foreground">/90</span>
              </p>
            </div>

            {/* Component Scores */}
            <div className="grid grid-cols-4 gap-3 text-center">
              {[
                { label: "Content", value: score.content },
                { label: "Grammar", value: score.grammar },
                { label: "Vocabulary", value: score.vocabulary },
                { label: "Form", value: score.form },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={`text-xl font-bold ${getScoreColor(value)}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Feedback */}
            <div className="space-y-4 text-sm">
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center gap-2 mb-2 text-success font-medium">
                  <CheckCircle className="h-4 w-4" /> Strengths
                </div>
                <ul className="space-y-1 text-foreground">
                  {score.detailedAnalysis.strengths.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <div className="flex items-center gap-2 mb-2 text-warning font-medium">
                  <AlertCircle className="h-4 w-4" /> Areas to Improve
                </div>
                <ul className="space-y-1 text-foreground">
                  {score.detailedAnalysis.improvements.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 mb-2 text-primary font-medium">
                  <Lightbulb className="h-4 w-4" /> Tips
                </div>
                <ul className="space-y-1 text-foreground">
                  {score.detailedAnalysis.tips.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Your Response */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Your Response:</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {writtenText}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <Button onClick={handleRetry} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" /> Try Again
              </Button>
              <Button onClick={onNext} className="gradient-primary text-primary-foreground">
                Next Question
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
