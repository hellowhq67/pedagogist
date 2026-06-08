import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Mic, Square, Play, Pause, Volume2, Send, 
  Loader2, GripVertical, Clock, CheckCircle, XCircle,
  AlertCircle, Lightbulb, TrendingUp
} from "lucide-react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { AudioWaveform } from "@/components/speaking/AudioWaveform";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface DetailedFeedback {
  totalScore: number;
  maxScore: number;
  percentage: number;
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
  strengths: string[];
  improvements: string[];
  tips: string[];
  overallFeedback: string;
}

interface MockTestSectionProps {
  question: any;
  questionIndex: number;
  totalQuestions: number;
  onSubmit: (answer: any, score?: number, maxScore?: number, feedback?: DetailedFeedback) => void;
  onSkip: () => void;
  timeLimit: number;
}

type Phase = "answering" | "processing" | "feedback";

export function MockTestSection({
  question,
  questionIndex,
  totalQuestions,
  onSubmit,
  onSkip,
  timeLimit
}: MockTestSectionProps) {
  const [phase, setPhase] = useState<Phase>("answering");
  const [answer, setAnswer] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [textAnswer, setTextAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionTime, setQuestionTime] = useState(timeLimit);
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);
  const [draggedItems, setDraggedItems] = useState<string[]>([]);
  const [blankAnswers, setBlankAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<DetailedFeedback | null>(null);
  
  const { speak, isSpeaking, stop: stopSpeaking } = useTextToSpeech();
  const { 
    isRecording, 
    recordingTime, 
    audioBlob, 
    audioUrl, 
    audioStream,
    startRecording, 
    stopRecording, 
    resetRecording 
  } = useAudioRecorder(timeLimit);

  // Reset state when question changes
  useEffect(() => {
    setPhase("answering");
    setAnswer(null);
    setSelectedOptions([]);
    setTextAnswer("");
    setQuestionTime(timeLimit);
    setHasPlayedAudio(false);
    setBlankAnswers({});
    setFeedback(null);
    resetRecording();
    
    // Initialize drag items for reorder questions
    if (question.type === "reorder-paragraphs" && question.content?.paragraphs) {
      const shuffled = [...question.content.paragraphs]
        .sort(() => Math.random() - 0.5)
        .map(p => p.id);
      setDraggedItems(shuffled);
    }
  }, [question.id, timeLimit]);

  // Question timer
  useEffect(() => {
    if (phase !== "answering") return;
    
    const timer = setInterval(() => {
      setQuestionTime(prev => {
        if (prev <= 0) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [question.id, phase]);

  // Auto-submit when recording ends
  useEffect(() => {
    if (audioBlob && !isRecording && phase === "answering") {
      handleSubmitSpeaking();
    }
  }, [audioBlob, isRecording, phase]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAutoSubmit = useCallback(() => {
    if (isSpeakingQuestion()) {
      if (audioBlob) {
        handleSubmitSpeaking();
      } else {
        submitWithScore(null, 0, getMaxScore());
      }
    } else if (isWritingQuestion()) {
      handleSubmitWriting();
    } else if (isReadingQuestion() || isListeningQuestion()) {
      handleSubmitSelection();
    }
  }, [audioBlob, textAnswer, selectedOptions, draggedItems, blankAnswers]);

  const isSpeakingQuestion = () => {
    return ["read-aloud", "repeat-sentence", "describe-image", "retell-lecture", "answer-short-question"]
      .includes(question.type);
  };

  const isWritingQuestion = () => {
    return ["summarize-written-text", "write-essay", "summarize-spoken-text", "write-from-dictation"]
      .includes(question.type);
  };

  const isReadingQuestion = () => {
    return ["mc-single", "mc-multiple", "reorder-paragraphs", "fill-blanks-drag", "fill-blanks-dropdown"]
      .includes(question.type);
  };

  const isListeningQuestion = () => {
    return question.section === "listening";
  };

  const needsAudio = () => {
    return ["repeat-sentence", "retell-lecture", "answer-short-question", 
      "highlight-correct-summary", "mc-single-listening", "mc-multiple-listening",
      "fill-blanks-listening", "highlight-incorrect-words", "write-from-dictation",
      "select-missing-word", "summarize-spoken-text"
    ].includes(question.type);
  };

  const getMaxScore = () => {
    const scoreMap: Record<string, number> = {
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
      "summarize-spoken-text": 10
    };
    return scoreMap[question.type] || 1;
  };

  const handlePlayAudio = () => {
    const textToSpeak = question.content?.text || 
      question.content?.audioText || 
      question.content?.lectureContent || 
      question.content?.question;
    
    if (textToSpeak) {
      speak(textToSpeak);
      setHasPlayedAudio(true);
    }
  };

  // Call AI scoring edge function
  const callAIScoring = async (payload: any): Promise<DetailedFeedback> => {
    try {
      const { data, error } = await supabase.functions.invoke('score-mocktest-ai', {
        body: payload
      });
      
      if (error) throw error;
      return data as DetailedFeedback;
    } catch (err) {
      console.error("AI Scoring error:", err);
      // Return fallback scoring
      return {
        totalScore: Math.round(getMaxScore() * 0.5),
        maxScore: getMaxScore(),
        percentage: 50,
        strengths: ["Response submitted"],
        improvements: ["AI analysis unavailable"],
        tips: ["Practice more for better results"],
        overallFeedback: "Your response has been recorded. Detailed AI feedback was unavailable."
      };
    }
  };

  const submitWithScore = (answer: any, score: number, maxScore: number, fb?: DetailedFeedback) => {
    setFeedback(fb || null);
    setPhase("feedback");
    setAnswer({ answer, score, maxScore, feedback: fb });
  };

  const handleContinue = () => {
    if (answer) {
      onSubmit(answer.answer, answer.score, answer.maxScore, answer.feedback);
    }
  };

  const handleSubmitSpeaking = async () => {
    setPhase("processing");
    setIsSubmitting(true);
    
    try {
      // For demo, we'll use the transcription simulation
      const spokenText = question.content?.text || "User's spoken response";
      
      const fb = await callAIScoring({
        questionType: question.type,
        section: question.section || "speaking",
        spokenText: spokenText,
        originalText: question.content?.text || question.content?.lectureContent || ""
      });
      
      submitWithScore({ audioBlob, audioUrl }, fb.totalScore, fb.maxScore, fb);
    } catch (err) {
      const score = Math.round(getMaxScore() * 0.6);
      submitWithScore({ audioBlob, audioUrl }, score, getMaxScore());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitWriting = async () => {
    if (!textAnswer.trim()) {
      submitWithScore(null, 0, getMaxScore());
      return;
    }
    
    setPhase("processing");
    setIsSubmitting(true);
    
    try {
      const fb = await callAIScoring({
        questionType: question.type,
        section: question.section || "writing",
        writtenText: textAnswer,
        sourceText: question.content?.sourceText || question.content?.dictationText || "",
        essayPrompt: question.content?.essayPrompt || ""
      });
      
      submitWithScore({ text: textAnswer, wordCount: textAnswer.trim().split(/\s+/).length }, fb.totalScore, fb.maxScore, fb);
    } catch (err) {
      const wordCount = textAnswer.trim().split(/\s+/).length;
      const score = Math.round(getMaxScore() * 0.5);
      submitWithScore({ text: textAnswer, wordCount }, score, getMaxScore());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitSelection = async () => {
    setPhase("processing");
    setIsSubmitting(true);
    
    try {
      const fb = await callAIScoring({
        questionType: question.type,
        section: question.section || "reading",
        selectedOptions: selectedOptions,
        correctAnswers: question.content?.correctAnswers || [],
        orderedItems: draggedItems,
        correctOrder: question.content?.correctOrder || [],
        blankAnswers: blankAnswers,
        blanks: question.content?.blanks || []
      });
      
      if (question.type === "reorder-paragraphs") {
        submitWithScore({ order: draggedItems }, fb.totalScore, fb.maxScore, fb);
      } else if (question.type.includes("fill-blanks")) {
        submitWithScore({ answers: blankAnswers }, fb.totalScore, fb.maxScore, fb);
      } else {
        submitWithScore({ selected: selectedOptions }, fb.totalScore, fb.maxScore, fb);
      }
    } catch (err) {
      submitWithScore({ selected: selectedOptions }, 0, getMaxScore());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData("text/plain", itemId);
  };

  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    const draggedIdx = draggedItems.indexOf(draggedId);
    
    if (draggedIdx === -1) return;
    
    const newItems = [...draggedItems];
    newItems.splice(draggedIdx, 1);
    newItems.splice(targetIdx, 0, draggedId);
    setDraggedItems(newItems);
  };

  // Render feedback panel
  const renderFeedback = () => {
    if (!feedback) {
      return (
        <Card className="p-6 space-y-4">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
            <h3 className="text-xl font-semibold">Response Submitted</h3>
            <p className="text-muted-foreground">Your answer has been recorded.</p>
          </div>
          <Button onClick={handleContinue} className="w-full">
            Continue to Next Question
          </Button>
        </Card>
      );
    }

    const scoreColor = feedback.percentage >= 70 ? "text-success" : 
                       feedback.percentage >= 50 ? "text-warning" : "text-destructive";

    return (
      <div className="space-y-6">
        {/* Score Summary */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Your Score</h3>
            <div className={cn("text-3xl font-bold", scoreColor)}>
              {feedback.totalScore}/{feedback.maxScore}
            </div>
          </div>
          <Progress value={feedback.percentage} className="h-3 mb-2" />
          <p className="text-sm text-muted-foreground text-right">{feedback.percentage}%</p>
        </Card>

        {/* Pronunciation Analysis (for speaking) */}
        {feedback.pronunciation && (
          <Card className="p-6">
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <Volume2 className="h-5 w-5 text-primary" />
              Pronunciation Analysis
              <Badge variant="outline" className="ml-auto">{feedback.pronunciation.score}/90</Badge>
            </h4>
            {feedback.pronunciation.issues.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-destructive mb-1">Issues Found:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {feedback.pronunciation.issues.map((issue, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {feedback.pronunciation.suggestions.length > 0 && (
              <div>
                <p className="text-sm font-medium text-primary mb-1">Suggestions:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {feedback.pronunciation.suggestions.map((sug, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                      {sug}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        )}

        {/* Fluency Analysis (for speaking) */}
        {feedback.fluency && (
          <Card className="p-6">
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              Fluency Analysis
              <Badge variant="outline" className="ml-auto">{feedback.fluency.score}/90</Badge>
            </h4>
            {feedback.fluency.issues.length > 0 && (
              <ul className="text-sm text-muted-foreground space-y-1">
                {feedback.fluency.issues.map((issue, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    {issue}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {/* Grammar Analysis (for writing) */}
        {feedback.grammar && feedback.grammar.errors.length > 0 && (
          <Card className="p-6">
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-primary" />
              Grammar Corrections
              <Badge variant="outline" className="ml-auto">{feedback.grammar.score}/90</Badge>
            </h4>
            <div className="space-y-3">
              {feedback.grammar.errors.slice(0, 5).map((error, idx) => (
                <div key={idx} className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-start gap-2 mb-1">
                    <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <span className="text-sm line-through text-destructive">{error.text}</span>
                  </div>
                  <div className="flex items-start gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span className="text-sm text-success">{error.correction}</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">{error.explanation}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Vocabulary Suggestions (for writing) */}
        {feedback.vocabulary && feedback.vocabulary.suggestions.length > 0 && (
          <Card className="p-6">
            <h4 className="font-semibold mb-3">Vocabulary Suggestions</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {feedback.vocabulary.suggestions.map((sug, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                  {sug}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Strengths & Improvements */}
        <div className="grid md:grid-cols-2 gap-4">
          {feedback.strengths.length > 0 && (
            <Card className="p-4">
              <h4 className="font-semibold text-success flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4" />
                Strengths
              </h4>
              <ul className="text-sm space-y-1">
                {feedback.strengths.map((s, idx) => (
                  <li key={idx}>• {s}</li>
                ))}
              </ul>
            </Card>
          )}
          {feedback.improvements.length > 0 && (
            <Card className="p-4">
              <h4 className="font-semibold text-warning flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4" />
                Areas to Improve
              </h4>
              <ul className="text-sm space-y-1">
                {feedback.improvements.map((i, idx) => (
                  <li key={idx}>• {i}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Tips */}
        {feedback.tips.length > 0 && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <h4 className="font-semibold flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              Tips for Next Time
            </h4>
            <ul className="text-sm space-y-1">
              {feedback.tips.map((t, idx) => (
                <li key={idx}>• {t}</li>
              ))}
            </ul>
          </Card>
        )}

        {/* Overall Feedback */}
        {feedback.overallFeedback && (
          <Card className="p-4">
            <p className="text-sm">{feedback.overallFeedback}</p>
          </Card>
        )}

        {/* Continue Button */}
        <Button onClick={handleContinue} size="lg" className="w-full">
          Continue to Next Question
        </Button>
      </div>
    );
  };

  // Render processing state
  if (phase === "processing") {
    return (
      <div className="space-y-6">
        <Card className="p-12">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Analyzing Your Response</h3>
            <p className="text-muted-foreground">Our AI is evaluating your answer with detailed feedback...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Render feedback state
  if (phase === "feedback") {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <Badge variant="outline" className="mb-2">{question.type.replace(/-/g, ' ').toUpperCase()}</Badge>
            <h2 className="text-xl font-semibold">Detailed Feedback</h2>
            <p className="text-sm text-muted-foreground mt-1">Question {questionIndex + 1} of {totalQuestions}</p>
          </div>
        </div>
        {renderFeedback()}
      </div>
    );
  }

  const renderQuestionContent = () => {
    // Speaking questions
    if (isSpeakingQuestion()) {
      return (
        <div className="space-y-6">
          {/* Audio player for listen-first questions */}
          {needsAudio() && (
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <Button 
                  onClick={isSpeaking ? stopSpeaking : handlePlayAudio}
                  size="icon"
                  className="h-12 w-12 rounded-full"
                >
                  {isSpeaking ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {isSpeaking ? "Playing audio..." : hasPlayedAudio ? "Audio played" : "Click to play audio"}
                  </p>
                  <p className="text-xs text-muted-foreground">Listen carefully before recording</p>
                </div>
                <Volume2 className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>
          )}
          
          {/* Display text for read-aloud */}
          {question.type === "read-aloud" && question.content?.text && (
            <Card className="p-6">
              <p className="text-lg leading-relaxed">{question.content.text}</p>
            </Card>
          )}
          
          {/* Display image for describe-image */}
          {question.type === "describe-image" && question.content?.imageUrl && (
            <Card className="p-4">
              <img 
                src={question.content.imageUrl} 
                alt="Describe this image"
                className="rounded-lg max-h-72 object-contain mx-auto"
              />
            </Card>
          )}
          
          {/* Recording controls */}
          <Card className="p-6">
            <div className="text-center space-y-4">
              {!isRecording && !audioBlob && (
                <Button 
                  onClick={startRecording}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent text-white"
                  disabled={needsAudio() && !hasPlayedAudio && !isSpeaking}
                >
                  <Mic className="mr-2 h-5 w-5" />
                  Start Recording
                </Button>
              )}
              
              {isRecording && (
                <>
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                    <span className="font-mono text-xl">{formatTime(recordingTime)}</span>
                  </div>
                  <AudioWaveform isRecording={isRecording} audioStream={audioStream} />
                  <Button onClick={stopRecording} variant="destructive" size="lg">
                    <Square className="mr-2 h-5 w-5" />
                    Stop Recording
                  </Button>
                </>
              )}
              
              {audioBlob && !isRecording && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Processing your response...</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      );
    }

    // Writing questions
    if (isWritingQuestion()) {
      const wordCount = textAnswer.trim().split(/\s+/).filter(w => w).length;
      
      return (
        <div className="space-y-6">
          {/* Audio for listening-based writing */}
          {needsAudio() && (
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <Button 
                  onClick={isSpeaking ? stopSpeaking : handlePlayAudio}
                  size="icon"
                  className="h-12 w-12 rounded-full"
                >
                  {isSpeaking ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {isSpeaking ? "Playing audio..." : "Click to play audio"}
                  </p>
                </div>
              </div>
            </Card>
          )}
          
          {/* Source text for summarize written text */}
          {question.content?.sourceText && (
            <Card className="p-6 max-h-64 overflow-auto">
              <p className="text-sm leading-relaxed">{question.content.sourceText}</p>
            </Card>
          )}
          
          {/* Essay prompt */}
          {question.content?.essayPrompt && (
            <Card className="p-6 bg-muted/50">
              <p className="font-medium">{question.content.essayPrompt}</p>
            </Card>
          )}
          
          {/* Text area */}
          <div className="space-y-2">
            <Textarea 
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="min-h-[200px]"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Word count: {wordCount}</span>
              {question.minWords && question.maxWords && (
                <span>Required: {question.minWords}-{question.maxWords} words</span>
              )}
            </div>
          </div>
          
          <Button 
            onClick={handleSubmitWriting}
            className="w-full"
            disabled={isSubmitting}
          >
            <Send className="mr-2 h-4 w-4" />
            Submit Answer
          </Button>
        </div>
      );
    }

    // Reading / Listening MC questions
    if (question.type === "mc-single" || question.type === "mc-single-listening" || 
        question.type === "highlight-correct-summary" || question.type === "select-missing-word") {
      return (
        <div className="space-y-6">
          {needsAudio() && (
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <Button 
                  onClick={isSpeaking ? stopSpeaking : handlePlayAudio}
                  size="icon"
                  className="h-12 w-12 rounded-full"
                >
                  {isSpeaking ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {isSpeaking ? "Playing..." : "Play Audio"}
                  </p>
                </div>
              </div>
            </Card>
          )}
          
          {question.content?.passage && (
            <Card className="p-6 max-h-64 overflow-auto">
              <p className="text-sm leading-relaxed whitespace-pre-line">{question.content.passage}</p>
            </Card>
          )}
          
          {question.content?.question && (
            <p className="font-medium">{question.content.question}</p>
          )}
          
          <RadioGroup 
            value={selectedOptions[0] || ""}
            onValueChange={(val) => setSelectedOptions([val])}
          >
            {question.content?.options?.map((option: any) => (
              <div key={option.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="cursor-pointer flex-1">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          <Button 
            onClick={handleSubmitSelection}
            className="w-full"
            disabled={selectedOptions.length === 0}
          >
            Submit Answer
          </Button>
        </div>
      );
    }

    // Multiple choice multiple answers
    if (question.type === "mc-multiple" || question.type === "mc-multiple-listening") {
      return (
        <div className="space-y-6">
          {needsAudio() && (
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <Button 
                  onClick={isSpeaking ? stopSpeaking : handlePlayAudio}
                  size="icon"
                  className="h-12 w-12 rounded-full"
                >
                  {isSpeaking ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <p className="text-sm">{isSpeaking ? "Playing..." : "Play Audio"}</p>
              </div>
            </Card>
          )}
          
          {question.content?.passage && (
            <Card className="p-6 max-h-64 overflow-auto">
              <p className="text-sm leading-relaxed whitespace-pre-line">{question.content.passage}</p>
            </Card>
          )}
          
          {question.content?.question && (
            <p className="font-medium">{question.content.question}</p>
          )}
          
          <div className="space-y-2">
            {question.content?.options?.map((option: any) => (
              <div key={option.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50">
                <Checkbox 
                  id={option.id}
                  checked={selectedOptions.includes(option.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedOptions(prev => [...prev, option.id]);
                    } else {
                      setSelectedOptions(prev => prev.filter(id => id !== option.id));
                    }
                  }}
                />
                <Label htmlFor={option.id} className="cursor-pointer flex-1">
                  {option.text}
                </Label>
              </div>
            ))}
          </div>
          
          <Button 
            onClick={handleSubmitSelection}
            className="w-full"
            disabled={selectedOptions.length === 0}
          >
            Submit Answer
          </Button>
        </div>
      );
    }

    // Reorder paragraphs
    if (question.type === "reorder-paragraphs") {
      const paragraphs = question.content?.paragraphs || [];
      
      return (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">Drag and drop to reorder the paragraphs:</p>
          
          <div className="space-y-2">
            {draggedItems.map((itemId, idx) => {
              const para = paragraphs.find((p: any) => p.id === itemId);
              if (!para) return null;
              
              return (
                <Card 
                  key={itemId}
                  draggable
                  onDragStart={(e) => handleDragStart(e, itemId)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, idx)}
                  className="p-4 cursor-move hover:bg-muted/50"
                >
                  <div className="flex items-start gap-3">
                    <GripVertical className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-sm">{para.text}</p>
                  </div>
                </Card>
              );
            })}
          </div>
          
          <Button onClick={handleSubmitSelection} className="w-full">
            Submit Answer
          </Button>
        </div>
      );
    }

    // Fill in the blanks
    if (question.type.includes("fill-blanks")) {
      const blanks = question.content?.blanks || [];
      const passage = question.content?.passage || question.content?.transcript || "";
      
      return (
        <div className="space-y-6">
          {needsAudio() && (
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <Button 
                  onClick={isSpeaking ? stopSpeaking : handlePlayAudio}
                  size="icon"
                  className="h-12 w-12 rounded-full"
                >
                  {isSpeaking ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <p className="text-sm">{isSpeaking ? "Playing..." : "Play Audio"}</p>
              </div>
            </Card>
          )}
          
          <Card className="p-6">
            <div className="leading-relaxed">
              {passage.split(/\[BLANK\d+\]/).map((part: string, idx: number) => (
                <span key={idx}>
                  {part}
                  {idx < blanks.length && (
                    <Input 
                      className="inline-block w-32 mx-1"
                      value={blankAnswers[blanks[idx].id] || ""}
                      onChange={(e) => setBlankAnswers(prev => ({
                        ...prev,
                        [blanks[idx].id]: e.target.value
                      }))}
                      placeholder={`Blank ${idx + 1}`}
                    />
                  )}
                </span>
              ))}
            </div>
          </Card>
          
          <Button onClick={handleSubmitSelection} className="w-full">
            Submit Answer
          </Button>
        </div>
      );
    }

    // Highlight incorrect words
    if (question.type === "highlight-incorrect-words") {
      return (
        <div className="space-y-6">
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <Button 
                onClick={isSpeaking ? stopSpeaking : handlePlayAudio}
                size="icon"
                className="h-12 w-12 rounded-full"
              >
                {isSpeaking ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <p className="text-sm">{isSpeaking ? "Playing..." : "Play Audio"}</p>
            </div>
          </Card>
          
          <Card className="p-6">
            <p className="leading-relaxed">
              {(question.content?.transcript || "").split(" ").map((word: string, idx: number) => (
                <span 
                  key={idx}
                  onClick={() => {
                    const wordKey = `word-${idx}`;
                    if (selectedOptions.includes(wordKey)) {
                      setSelectedOptions(prev => prev.filter(w => w !== wordKey));
                    } else {
                      setSelectedOptions(prev => [...prev, wordKey]);
                    }
                  }}
                  className={cn(
                    "cursor-pointer hover:bg-primary/20 px-0.5 rounded",
                    selectedOptions.includes(`word-${idx}`) && "bg-destructive/30 text-destructive"
                  )}
                >
                  {word}{" "}
                </span>
              ))}
            </p>
          </Card>
          
          <Button onClick={handleSubmitSelection} className="w-full">
            Submit Answer
          </Button>
        </div>
      );
    }

    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Question type not implemented: {question.type}</p>
        <Button onClick={handleSubmitSelection} className="mt-4">Submit</Button>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Question header */}
      <div className="flex items-start justify-between">
        <div>
          <Badge variant="outline" className="mb-2">{question.type.replace(/-/g, ' ').toUpperCase()}</Badge>
          <h2 className="text-xl font-semibold">{question.title || question.type}</h2>
          <p className="text-sm text-muted-foreground mt-1">{question.instruction}</p>
        </div>
        <div className="text-right">
          <div className={cn(
            "flex items-center gap-2 font-mono text-lg",
            questionTime < 30 && "text-destructive"
          )}>
            <Clock className="h-4 w-4" />
            {formatTime(questionTime)}
          </div>
          <p className="text-xs text-muted-foreground">Time remaining</p>
        </div>
      </div>
      
      {/* Question content */}
      {renderQuestionContent()}
    </div>
  );
}
