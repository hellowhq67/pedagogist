import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { 
  ChevronLeft, ChevronRight, Bookmark, CheckCircle, 
  XCircle, RotateCcw, Play, Pause, Volume2
} from "lucide-react";
import { ListeningQuestion, getListeningTestTypeInfo } from "@/data/listeningQuestions";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ListeningTestProps {
  question: ListeningQuestion;
  questionIndex: number;
  totalQuestions: number;
  onComplete: (score: number, correct: boolean) => void;
  onNext: () => void;
  onPrevious?: () => void;
}

export function ListeningTest({
  question,
  questionIndex,
  totalQuestions,
  onComplete,
  onNext,
  onPrevious
}: ListeningTestProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [fillBlanksAnswers, setFillBlanksAnswers] = useState<Record<string, string>>({});
  const [highlightedWords, setHighlightedWords] = useState<Set<number>>(new Set());
  const [dictationText, setDictationText] = useState("");
  const [summaryText, setSummaryText] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(question.timeLimit);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(0);
  const [hasListened, setHasListened] = useState(false);
  
  const { speak, stop: stopSpeaking, isSpeaking, isSupported } = useTextToSpeech();
  const typeInfo = getListeningTestTypeInfo(question.type);

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswers([]);
    setFillBlanksAnswers({});
    setHighlightedWords(new Set());
    setDictationText("");
    setSummaryText("");
    setIsSubmitted(false);
    setIsCorrect(false);
    setScore(0);
    setTimeRemaining(question.timeLimit);
    setAudioPlayed(0);
    setHasListened(false);
    stopSpeaking();
  }, [question.id]);

  // Timer
  useEffect(() => {
    if (isSubmitted || timeRemaining <= 0 || !hasListened) return;
    const timer = setInterval(() => setTimeRemaining(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [isSubmitted, timeRemaining, hasListened]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayAudio = () => {
    if (audioPlayed >= (question.audioPlayLimit || 1) && !isSpeaking) {
      toast.error("Audio play limit reached");
      return;
    }
    
    if (isSpeaking) {
      stopSpeaking();
    } else {
      // For select missing word, replace last part with beep sound
      let textToSpeak = question.content.audioText;
      if (question.type === "select-missing-word" && question.content.missingWord) {
        textToSpeak = textToSpeak.replace(question.content.missingWord, "beep");
      }
      speak(textToSpeak);
      if (!hasListened) {
        setHasListened(true);
      }
      setAudioPlayed(prev => prev + 1);
    }
  };

  const handleMCSingleSelect = (value: string) => {
    if (!isSubmitted) {
      setSelectedAnswers([value]);
    }
  };

  const handleMCMultipleToggle = (value: string) => {
    if (!isSubmitted) {
      setSelectedAnswers(prev => 
        prev.includes(value) 
          ? prev.filter(v => v !== value)
          : [...prev, value]
      );
    }
  };

  const handleWordClick = (index: number) => {
    if (isSubmitted) return;
    setHighlightedWords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleFillBlankChange = (blankId: string, value: string) => {
    if (!isSubmitted) {
      setFillBlanksAnswers(prev => ({ ...prev, [blankId]: value }));
    }
  };

  const calculateScore = () => {
    let correct = false;
    let calculatedScore = 0;

    switch (question.type) {
      case "highlight-correct-summary":
      case "mc-single-listening":
      case "select-missing-word":
        correct = selectedAnswers.length === 1 && 
          question.content.correctAnswers?.includes(selectedAnswers[0]);
        calculatedScore = correct ? 100 : 0;
        break;

      case "mc-multiple-listening":
        const correctSet = new Set(question.content.correctAnswers || []);
        const selectedSet = new Set(selectedAnswers);
        const correctSelected = selectedAnswers.filter(a => correctSet.has(a)).length;
        const incorrectSelected = selectedAnswers.filter(a => !correctSet.has(a)).length;
        calculatedScore = Math.max(0, ((correctSelected - incorrectSelected) / correctSet.size) * 100);
        correct = calculatedScore === 100;
        break;

      case "fill-blanks-listening":
        const blanks = question.content.blanks || [];
        let correctBlanks = 0;
        blanks.forEach(blank => {
          if (fillBlanksAnswers[blank.id]?.toLowerCase().trim() === blank.correctAnswer.toLowerCase()) {
            correctBlanks++;
          }
        });
        calculatedScore = (correctBlanks / blanks.length) * 100;
        correct = calculatedScore === 100;
        break;

      case "highlight-incorrect-words":
        const incorrectWords = question.content.incorrectWords || [];
        const incorrectPositions = new Set(incorrectWords.map(w => w.position));
        let correctHighlights = 0;
        let wrongHighlights = 0;
        
        highlightedWords.forEach(pos => {
          if (incorrectPositions.has(pos)) {
            correctHighlights++;
          } else {
            wrongHighlights++;
          }
        });
        
        calculatedScore = Math.max(0, ((correctHighlights - wrongHighlights) / incorrectWords.length) * 100);
        correct = correctHighlights === incorrectWords.length && wrongHighlights === 0;
        break;

      case "write-from-dictation":
        const expectedWords = (question.content.dictationText || "").toLowerCase().split(/\s+/);
        const writtenWords = dictationText.toLowerCase().split(/\s+/).filter(Boolean);
        let matchedWords = 0;
        
        writtenWords.forEach((word, index) => {
          if (expectedWords[index] === word.replace(/[.,!?;:'"]/g, "")) {
            matchedWords++;
          }
        });
        
        calculatedScore = (matchedWords / expectedWords.length) * 100;
        correct = calculatedScore >= 90;
        break;

      case "summarize-spoken-text":
        // Basic scoring based on word count and content
        const wordCount = summaryText.split(/\s+/).filter(Boolean).length;
        if (wordCount >= 50 && wordCount <= 70) {
          calculatedScore = 70; // Base score for correct length
          correct = true;
        } else if (wordCount >= 40 && wordCount <= 80) {
          calculatedScore = 50;
          correct = false;
        } else {
          calculatedScore = 30;
          correct = false;
        }
        break;
    }

    return { correct, score: Math.round(calculatedScore) };
  };

  const handleSubmit = () => {
    const result = calculateScore();
    setIsCorrect(result.correct);
    setScore(result.score);
    setIsSubmitted(true);
    
    onComplete(result.score, result.correct);
    
    if (result.correct) {
      toast.success("Correct! Well done!");
    } else {
      toast.error(`Score: ${result.score}%`);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers([]);
    setFillBlanksAnswers({});
    setHighlightedWords(new Set());
    setDictationText("");
    setSummaryText("");
    setIsSubmitted(false);
    setIsCorrect(false);
    setScore(0);
    setTimeRemaining(question.timeLimit);
    setAudioPlayed(0);
    setHasListened(false);
  };

  const renderTranscriptWithHighlights = () => {
    if (!question.content.transcript) return null;
    
    const words = question.content.transcript.split(/\s+/);
    const incorrectPositions = new Set(question.content.incorrectWords?.map(w => w.position) || []);
    
    return (
      <p className="text-lg leading-loose">
        {words.map((word, index) => {
          const isHighlighted = highlightedWords.has(index);
          const isIncorrect = incorrectPositions.has(index);
          const incorrectWord = question.content.incorrectWords?.find(w => w.position === index);
          
          return (
            <span
              key={index}
              onClick={() => handleWordClick(index)}
              className={cn(
                "cursor-pointer px-0.5 transition-colors rounded",
                isHighlighted && "bg-amber-200 dark:bg-amber-800",
                isSubmitted && isIncorrect && !isHighlighted && "bg-red-200 dark:bg-red-800",
                isSubmitted && isHighlighted && isIncorrect && "bg-emerald-200 dark:bg-emerald-800",
                isSubmitted && isHighlighted && !isIncorrect && "bg-red-200 dark:bg-red-800 line-through"
              )}
              title={isSubmitted && incorrectWord ? `Should be: ${incorrectWord.correct}` : undefined}
            >
              {word}{" "}
            </span>
          );
        })}
      </p>
    );
  };

  const renderFillBlanksTranscript = () => {
    if (!question.content.transcript) return null;
    
    const parts = question.content.transcript.split(/\[BLANK\d+\]/g);
    const blanks = question.content.blanks || [];
    
    return (
      <p className="text-lg leading-relaxed">
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < blanks.length && (
              <Input
                type="text"
                value={fillBlanksAnswers[blanks[index].id] || ""}
                onChange={(e) => handleFillBlankChange(blanks[index].id, e.target.value)}
                disabled={isSubmitted}
                className={cn(
                  "inline-block w-32 mx-1 text-center",
                  isSubmitted && fillBlanksAnswers[blanks[index].id]?.toLowerCase().trim() === blanks[index].correctAnswer.toLowerCase()
                    ? "border-emerald-500 bg-emerald-50"
                    : isSubmitted ? "border-red-500 bg-red-50" : ""
                )}
                placeholder={`[${index + 1}]`}
              />
            )}
          </span>
        ))}
      </p>
    );
  };

  return (
    <div className="space-y-4 animate-fade-slide-up">
      {/* Test Type Header */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {typeInfo.icon}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-lg">{typeInfo.name}</h2>
            <p className="text-sm text-muted-foreground">{question.instruction}</p>
          </div>
        </div>
      </Card>

      {/* Question Info Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-medium">#{questionIndex + 1} {question.title}</span>
          <button 
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={cn(
              "p-1 rounded transition-colors",
              isBookmarked ? "text-amber-500" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Bookmark className={cn("h-5 w-5", isBookmarked && "fill-current")} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={timeRemaining < 30 ? "destructive" : "secondary"}>
            ⏱️ {formatTime(timeRemaining)}
          </Badge>
          <Badge variant="outline">
            🔊 {audioPlayed}/{question.audioPlayLimit || 1}
          </Badge>
        </div>
      </div>

      {/* Audio Player */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-12 w-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handlePlayAudio}
            disabled={audioPlayed >= (question.audioPlayLimit || 1) && !isSpeaking}
          >
            {isSpeaking ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          
          <div className="flex-1">
            <Slider 
              value={[isSpeaking ? 50 : 0]} 
              max={100}
              className="w-full"
              disabled
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {hasListened ? "Listened" : "Click to play"}
            </span>
          </div>
        </div>
      </Card>

      {/* Question Content based on type */}
      {(question.type === "highlight-correct-summary" || 
        question.type === "mc-single-listening" || 
        question.type === "select-missing-word") && (
        <Card className="p-6 space-y-4">
          {question.content.question && (
            <p className="font-medium text-lg">{question.content.question}</p>
          )}
          
          <RadioGroup 
            value={selectedAnswers[0] || ""} 
            onValueChange={handleMCSingleSelect}
            className="space-y-3"
          >
            {question.content.options?.map(option => (
              <div 
                key={option.id}
                className={cn(
                  "flex items-start space-x-3 p-4 rounded-lg border transition-colors",
                  selectedAnswers.includes(option.id) 
                    ? "border-primary bg-primary/5" 
                    : "border-muted hover:border-primary/50",
                  isSubmitted && question.content.correctAnswers?.includes(option.id)
                    ? "border-emerald-500 bg-emerald-50"
                    : isSubmitted && selectedAnswers.includes(option.id)
                    ? "border-red-500 bg-red-50"
                    : ""
                )}
              >
                <RadioGroupItem value={option.id} id={option.id} disabled={isSubmitted} className="mt-1" />
                <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                  {option.text}
                </Label>
                {isSubmitted && question.content.correctAnswers?.includes(option.id) && (
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                )}
                {isSubmitted && selectedAnswers.includes(option.id) && !question.content.correctAnswers?.includes(option.id) && (
                  <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                )}
              </div>
            ))}
          </RadioGroup>
        </Card>
      )}

      {question.type === "mc-multiple-listening" && (
        <Card className="p-6 space-y-4">
          {question.content.question && (
            <p className="font-medium text-lg">{question.content.question}</p>
          )}
          
          <div className="space-y-3">
            {question.content.options?.map(option => (
              <div 
                key={option.id}
                className={cn(
                  "flex items-start space-x-3 p-4 rounded-lg border transition-colors cursor-pointer",
                  selectedAnswers.includes(option.id) 
                    ? "border-primary bg-primary/5" 
                    : "border-muted hover:border-primary/50",
                  isSubmitted && question.content.correctAnswers?.includes(option.id)
                    ? "border-emerald-500 bg-emerald-50"
                    : isSubmitted && selectedAnswers.includes(option.id) && !question.content.correctAnswers?.includes(option.id)
                    ? "border-red-500 bg-red-50"
                    : ""
                )}
                onClick={() => handleMCMultipleToggle(option.id)}
              >
                <Checkbox 
                  checked={selectedAnswers.includes(option.id)} 
                  disabled={isSubmitted}
                  className="mt-1"
                />
                <span className="flex-1">{option.text}</span>
                {isSubmitted && question.content.correctAnswers?.includes(option.id) && (
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                )}
                {isSubmitted && selectedAnswers.includes(option.id) && !question.content.correctAnswers?.includes(option.id) && (
                  <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {question.type === "highlight-incorrect-words" && (
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Click on words that are different from what you heard:
          </p>
          {renderTranscriptWithHighlights()}
        </Card>
      )}

      {question.type === "fill-blanks-listening" && (
        <Card className="p-6">
          {renderFillBlanksTranscript()}
          {isSubmitted && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Correct answers:</p>
              {question.content.blanks?.map((blank, index) => (
                <span key={blank.id} className="text-sm">
                  [{index + 1}] {blank.correctAnswer}
                  {index < (question.content.blanks?.length || 0) - 1 && ", "}
                </span>
              ))}
            </div>
          )}
        </Card>
      )}

      {question.type === "write-from-dictation" && (
        <Card className="p-6 space-y-4">
          <Textarea
            value={dictationText}
            onChange={(e) => setDictationText(e.target.value)}
            disabled={isSubmitted}
            placeholder="Type what you hear..."
            className="min-h-[100px]"
          />
          {isSubmitted && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Correct answer:</p>
              <p className="text-sm">{question.content.dictationText}</p>
            </div>
          )}
        </Card>
      )}

      {question.type === "summarize-spoken-text" && (
        <Card className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Write 50-70 words</span>
            <Badge variant={
              summaryText.split(/\s+/).filter(Boolean).length >= 50 && 
              summaryText.split(/\s+/).filter(Boolean).length <= 70
                ? "default"
                : "destructive"
            }>
              {summaryText.split(/\s+/).filter(Boolean).length} words
            </Badge>
          </div>
          <Textarea
            value={summaryText}
            onChange={(e) => setSummaryText(e.target.value)}
            disabled={isSubmitted}
            placeholder="Write your summary here..."
            className="min-h-[200px]"
          />
        </Card>
      )}

      {/* Score Display */}
      {isSubmitted && (
        <Card className={cn(
          "p-6",
          isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isCorrect ? (
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              ) : (
                <XCircle className="h-8 w-8 text-red-500" />
              )}
              <div>
                <p className="font-semibold text-lg">
                  {isCorrect ? "Correct!" : "Keep practicing!"}
                </p>
                <p className="text-muted-foreground">Score: {score}%</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {!isSubmitted ? (
          <Button 
            onClick={handleSubmit} 
            className="bg-emerald-500 hover:bg-emerald-600"
            disabled={!hasListened}
          >
            Submit Answer
          </Button>
        ) : (
          <>
            <Button onClick={handleRetry} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" /> Try Again
            </Button>
            <Button onClick={onNext} className="bg-primary">
              Next Question <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </>
        )}
        
        <div className="ml-auto flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onPrevious}
            disabled={questionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={onNext}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
