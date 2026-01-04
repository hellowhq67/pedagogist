import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Mic, Square, Play, Pause, Volume2, Send, 
  Loader2, GripVertical, Clock
} from "lucide-react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { AudioWaveform } from "@/components/speaking/AudioWaveform";
import { cn } from "@/lib/utils";

interface MockTestSectionProps {
  question: any;
  questionIndex: number;
  totalQuestions: number;
  onSubmit: (answer: any, score?: number, maxScore?: number) => void;
  onSkip: () => void;
  timeLimit: number;
}

export function MockTestSection({
  question,
  questionIndex,
  totalQuestions,
  onSubmit,
  onSkip,
  timeLimit
}: MockTestSectionProps) {
  const [answer, setAnswer] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [textAnswer, setTextAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionTime, setQuestionTime] = useState(timeLimit);
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);
  const [draggedItems, setDraggedItems] = useState<string[]>([]);
  const [blankAnswers, setBlankAnswers] = useState<Record<string, string>>({});
  
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
    setAnswer(null);
    setSelectedOptions([]);
    setTextAnswer("");
    setQuestionTime(timeLimit);
    setHasPlayedAudio(false);
    setBlankAnswers({});
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
  }, [question.id]);

  // Auto-submit when recording ends
  useEffect(() => {
    if (audioBlob && !isRecording) {
      handleSubmitSpeaking();
    }
  }, [audioBlob, isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAutoSubmit = useCallback(() => {
    // Submit whatever answer we have
    if (isSpeakingQuestion()) {
      if (audioBlob) {
        handleSubmitSpeaking();
      } else {
        onSubmit(null, 0, getMaxScore());
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

  const handleSubmitSpeaking = async () => {
    setIsSubmitting(true);
    // Simplified scoring for mock test - give a random score
    const score = Math.floor(Math.random() * getMaxScore() * 0.4) + getMaxScore() * 0.5;
    onSubmit({ audioBlob, audioUrl }, Math.round(score), getMaxScore());
    setIsSubmitting(false);
  };

  const handleSubmitWriting = () => {
    if (!textAnswer.trim()) {
      onSubmit(null, 0, getMaxScore());
      return;
    }
    
    // Simplified scoring based on word count
    const wordCount = textAnswer.trim().split(/\s+/).length;
    const minWords = question.minWords || 50;
    const maxWords = question.maxWords || 300;
    
    let score = 0;
    if (wordCount >= minWords && wordCount <= maxWords) {
      score = getMaxScore() * 0.7 + Math.random() * getMaxScore() * 0.3;
    } else if (wordCount > 0) {
      score = getMaxScore() * 0.3 + Math.random() * getMaxScore() * 0.2;
    }
    
    onSubmit({ text: textAnswer, wordCount }, Math.round(score), getMaxScore());
  };

  const handleSubmitSelection = () => {
    const correctAnswers = question.content?.correctAnswers || [];
    const correctOrder = question.content?.correctOrder || [];
    
    if (question.type === "reorder-paragraphs") {
      // Score based on correct positions
      let correct = 0;
      draggedItems.forEach((id, idx) => {
        if (correctOrder[idx] === id) correct++;
      });
      onSubmit({ order: draggedItems }, correct, correctOrder.length);
    } else if (question.type.includes("fill-blanks")) {
      const blanks = question.content?.blanks || [];
      let correct = 0;
      blanks.forEach((blank: any) => {
        if (blankAnswers[blank.id]?.toLowerCase() === blank.correctAnswer.toLowerCase()) {
          correct++;
        }
      });
      onSubmit({ answers: blankAnswers }, correct, blanks.length);
    } else {
      // MC questions
      let correct = 0;
      if (selectedOptions.length === correctAnswers.length) {
        correct = selectedOptions.filter(o => correctAnswers.includes(o)).length;
      }
      onSubmit({ selected: selectedOptions }, correct, correctAnswers.length);
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
                  <div className="flex items-center justify-center gap-2 text-success">
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
        <Button onClick={onSkip} className="mt-4">Skip Question</Button>
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