import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ChevronLeft, ChevronRight, Bookmark, CheckCircle, 
  XCircle, RotateCcw, GripVertical
} from "lucide-react";
import { ReadingQuestion, getReadingTestTypeInfo } from "@/data/readingQuestions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReadingTestProps {
  question: ReadingQuestion;
  questionIndex: number;
  totalQuestions: number;
  onComplete: (score: number, correct: boolean) => void;
  onNext: () => void;
  onPrevious?: () => void;
}

export function ReadingTest({
  question,
  questionIndex,
  totalQuestions,
  onComplete,
  onNext,
  onPrevious
}: ReadingTestProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [reorderedParagraphs, setReorderedParagraphs] = useState<string[]>([]);
  const [fillBlanksAnswers, setFillBlanksAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(question.timeLimit);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const typeInfo = getReadingTestTypeInfo(question.type);

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswers([]);
    setFillBlanksAnswers({});
    setIsSubmitted(false);
    setIsCorrect(false);
    setScore(0);
    setTimeRemaining(question.timeLimit);
    
    // Initialize reordered paragraphs with shuffled order
    if (question.content.paragraphs) {
      const shuffled = [...question.content.paragraphs]
        .sort(() => Math.random() - 0.5)
        .map(p => p.id);
      setReorderedParagraphs(shuffled);
    }
  }, [question.id]);

  // Timer
  useEffect(() => {
    if (isSubmitted || timeRemaining <= 0) return;
    const timer = setInterval(() => setTimeRemaining(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [isSubmitted, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId || isSubmitted) return;
    
    const newOrder = [...reorderedParagraphs];
    const dragIndex = newOrder.indexOf(draggedItem);
    const targetIndex = newOrder.indexOf(targetId);
    
    newOrder.splice(dragIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);
    
    setReorderedParagraphs(newOrder);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
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
      case "mc-single":
        correct = selectedAnswers.length === 1 && 
          question.content.correctAnswers?.includes(selectedAnswers[0]);
        calculatedScore = correct ? 100 : 0;
        break;

      case "mc-multiple":
        const correctSet = new Set(question.content.correctAnswers || []);
        const correctSelected = selectedAnswers.filter(a => correctSet.has(a)).length;
        const incorrectSelected = selectedAnswers.filter(a => !correctSet.has(a)).length;
        calculatedScore = Math.max(0, ((correctSelected - incorrectSelected) / correctSet.size) * 100);
        correct = calculatedScore === 100;
        break;

      case "reorder-paragraphs":
        const correctOrder = question.content.correctOrder || [];
        let correctPairs = 0;
        for (let i = 0; i < reorderedParagraphs.length - 1; i++) {
          const currentIdx = correctOrder.indexOf(reorderedParagraphs[i]);
          const nextIdx = correctOrder.indexOf(reorderedParagraphs[i + 1]);
          if (nextIdx === currentIdx + 1) correctPairs++;
        }
        calculatedScore = (correctPairs / (correctOrder.length - 1)) * 100;
        correct = calculatedScore === 100;
        break;

      case "fill-blanks-drag":
      case "fill-blanks-dropdown":
        const blanks = question.content.blanks || [];
        let correctBlanks = 0;
        blanks.forEach(blank => {
          if (fillBlanksAnswers[blank.id]?.toLowerCase() === blank.correctAnswer.toLowerCase()) {
            correctBlanks++;
          }
        });
        calculatedScore = (correctBlanks / blanks.length) * 100;
        correct = calculatedScore === 100;
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
    setIsSubmitted(false);
    setIsCorrect(false);
    setScore(0);
    setTimeRemaining(question.timeLimit);
    
    if (question.content.paragraphs) {
      const shuffled = [...question.content.paragraphs]
        .sort(() => Math.random() - 0.5)
        .map(p => p.id);
      setReorderedParagraphs(shuffled);
    }
  };

  const renderPassageWithBlanks = () => {
    if (!question.content.passage) return null;
    
    const parts = question.content.passage.split(/\[BLANK\d+\]/g);
    const blanks = question.content.blanks || [];
    
    return (
      <p className="text-lg leading-relaxed">
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < blanks.length && (
              question.type === "fill-blanks-dropdown" ? (
                <Select
                  value={fillBlanksAnswers[blanks[index].id] || ""}
                  onValueChange={(value) => handleFillBlankChange(blanks[index].id, value)}
                  disabled={isSubmitted}
                >
                  <SelectTrigger className={cn(
                    "inline-flex w-[150px] mx-1",
                    isSubmitted && fillBlanksAnswers[blanks[index].id]?.toLowerCase() === blanks[index].correctAnswer.toLowerCase()
                      ? "border-emerald-500 bg-emerald-50"
                      : isSubmitted ? "border-red-500 bg-red-50" : ""
                  )}>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {blanks[index].options?.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span
                  className={cn(
                    "inline-block min-w-[100px] px-3 py-1 mx-1 border-2 border-dashed rounded cursor-pointer transition-colors",
                    fillBlanksAnswers[blanks[index].id]
                      ? "border-primary bg-primary/10"
                      : "border-muted-foreground/30 hover:border-primary/50",
                    isSubmitted && fillBlanksAnswers[blanks[index].id]?.toLowerCase() === blanks[index].correctAnswer.toLowerCase()
                      ? "border-emerald-500 bg-emerald-50"
                      : isSubmitted ? "border-red-500 bg-red-50" : ""
                  )}
                  onClick={() => {
                    if (!isSubmitted && !fillBlanksAnswers[blanks[index].id]) {
                      // Show available options
                    }
                  }}
                >
                  {fillBlanksAnswers[blanks[index].id] || `[${index + 1}]`}
                </span>
              )
            )}
          </span>
        ))}
      </p>
    );
  };

  const renderDragOptions = () => {
    const blanks = question.content.blanks || [];
    const usedAnswers = Object.values(fillBlanksAnswers);
    const availableOptions = blanks
      .flatMap(b => b.options || [])
      .filter((opt, idx, self) => self.indexOf(opt) === idx)
      .filter(opt => !usedAnswers.includes(opt));

    return (
      <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg">
        {availableOptions.map(option => (
          <Badge
            key={option}
            variant="outline"
            className="px-4 py-2 cursor-pointer hover:bg-primary/10 text-base"
            onClick={() => {
              // Find first empty blank and fill it
              const blanks = question.content.blanks || [];
              for (const blank of blanks) {
                if (!fillBlanksAnswers[blank.id]) {
                  handleFillBlankChange(blank.id, option);
                  break;
                }
              }
            }}
          >
            {option}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-fade-slide-up">
      {/* Test Type Header */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
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
          <Badge className="bg-teal-500 text-white">
            {question.difficulty}
          </Badge>
        </div>
      </div>

      {/* Passage */}
      {question.content.passage && question.type !== "fill-blanks-drag" && question.type !== "fill-blanks-dropdown" && (
        <Card className="p-6">
          <p className="text-lg leading-relaxed whitespace-pre-line">
            {question.content.passage}
          </p>
        </Card>
      )}

      {/* Fill in Blanks Passage */}
      {(question.type === "fill-blanks-drag" || question.type === "fill-blanks-dropdown") && (
        <Card className="p-6">
          {renderPassageWithBlanks()}
        </Card>
      )}

      {/* Drag Options for Fill in Blanks */}
      {question.type === "fill-blanks-drag" && !isSubmitted && (
        renderDragOptions()
      )}

      {/* Question and Options for MC */}
      {(question.type === "mc-single" || question.type === "mc-multiple") && (
        <Card className="p-6 space-y-4">
          <p className="font-medium text-lg">{question.content.question}</p>
          
          {question.type === "mc-single" ? (
            <RadioGroup 
              value={selectedAnswers[0] || ""} 
              onValueChange={handleMCSingleSelect}
              className="space-y-3"
            >
              {question.content.options?.map(option => (
                <div 
                  key={option.id}
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-lg border transition-colors",
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
                  <RadioGroupItem value={option.id} id={option.id} disabled={isSubmitted} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    {option.text}
                  </Label>
                  {isSubmitted && question.content.correctAnswers?.includes(option.id) && (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  )}
                  {isSubmitted && selectedAnswers.includes(option.id) && !question.content.correctAnswers?.includes(option.id) && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="space-y-3">
              {question.content.options?.map(option => (
                <div 
                  key={option.id}
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer",
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
                  />
                  <span className="flex-1">{option.text}</span>
                  {isSubmitted && question.content.correctAnswers?.includes(option.id) && (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  )}
                  {isSubmitted && selectedAnswers.includes(option.id) && !question.content.correctAnswers?.includes(option.id) && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Reorder Paragraphs */}
      {question.type === "reorder-paragraphs" && (
        <Card className="p-6 space-y-3">
          {reorderedParagraphs.map((id, index) => {
            const paragraph = question.content.paragraphs?.find(p => p.id === id);
            const correctIndex = question.content.correctOrder?.indexOf(id) ?? -1;
            const isInCorrectPosition = correctIndex === index;
            
            return (
              <div
                key={id}
                draggable={!isSubmitted}
                onDragStart={() => handleDragStart(id)}
                onDragOver={(e) => handleDragOver(e, id)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-lg border transition-all cursor-move",
                  draggedItem === id ? "opacity-50" : "",
                  isSubmitted && isInCorrectPosition
                    ? "border-emerald-500 bg-emerald-50"
                    : isSubmitted
                    ? "border-red-500 bg-red-50"
                    : "border-muted hover:border-primary/50 hover:bg-muted/30"
                )}
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  <Badge variant="outline">{index + 1}</Badge>
                </div>
                <p className="flex-1">{paragraph?.text}</p>
                {isSubmitted && (
                  isInCorrectPosition 
                    ? <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                    : <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                )}
              </div>
            );
          })}
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
                  {isCorrect ? "Correct!" : "Incorrect"}
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
          <Button onClick={handleSubmit} className="bg-emerald-500 hover:bg-emerald-600">
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
