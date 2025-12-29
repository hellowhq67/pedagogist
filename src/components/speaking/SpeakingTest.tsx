import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, Square, RotateCcw, Loader2, Volume2, VolumeX, 
  Play, Pause, Bookmark, ChevronLeft, ChevronRight, Search,
  Languages, Sparkles
} from "lucide-react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { transcribeAudio, scoreSpeaking, ScoreResult } from "@/lib/scoring";
import { SpeakingQuestion, getTestTypeInfo } from "@/data/speakingQuestions";
import { ScoreDisplay } from "./ScoreDisplay";
import { CountdownTimer } from "./CountdownTimer";
import { AudioWaveform } from "./AudioWaveform";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface SpeakingTestProps {
  question: SpeakingQuestion;
  questionIndex: number;
  totalQuestions: number;
  onComplete: (score: ScoreResult, spokenText: string, duration: number) => void;
  onNext: () => void;
  onPrevious?: () => void;
}

type Phase = "listen" | "prep" | "recording" | "processing" | "results";

// Test types that require listening to audio first
const AUDIO_FIRST_TYPES = ["repeat-sentence", "retell-lecture", "answer-short-question", "summarize-spoken-text"];

export function SpeakingTest({ 
  question, 
  questionIndex,
  totalQuestions,
  onComplete, 
  onNext,
  onPrevious 
}: SpeakingTestProps) {
  const [phase, setPhase] = useState<Phase>("prep");
  const [prepTime, setPrepTime] = useState(0);
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [spokenText, setSpokenText] = useState<string>("");
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const { speak, stop: stopSpeaking, isSpeaking, isSupported: ttsSupported } = useTextToSpeech();
  const { 
    isRecording, 
    recordingTime, 
    audioBlob, 
    audioUrl, 
    audioStream,
    startRecording, 
    stopRecording, 
    resetRecording, 
    error 
  } = useAudioRecorder(question.recordTime);

  const typeInfo = getTestTypeInfo(question.type);

  // Determine if this question type needs TTS first
  const needsAudioFirst = AUDIO_FIRST_TYPES.includes(question.type);
  const textToSpeak = question.content.text || question.content.lectureContent || question.content.question || "";

  // Initialize phase based on question type
  useEffect(() => {
    if (needsAudioFirst && ttsSupported && textToSpeak) {
      setPhase("listen");
    } else {
      setPhase("prep");
      setPrepTime(question.prepTime);
    }
    setScore(null);
    setSpokenText("");
    setShowScoreModal(false);
    resetRecording();
  }, [question.id]);

  // Start TTS for audio-first questions
  useEffect(() => {
    if (phase === "listen" && ttsSupported && textToSpeak && !isSpeaking) {
      const timer = setTimeout(() => {
        speak(textToSpeak);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Transition from listen to prep when TTS ends
  useEffect(() => {
    if (phase === "listen" && !isSpeaking && prepTime === 0) {
      setPhase("prep");
      setPrepTime(question.prepTime);
    }
  }, [isSpeaking, phase]);

  // Prep timer
  useEffect(() => {
    if (phase !== "prep" || prepTime <= 0) return;
    const timer = setInterval(() => setPrepTime(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [phase, prepTime]);

  // Auto-stop recording when time is up
  useEffect(() => {
    if (isRecording && recordingTime >= question.recordTime) {
      stopRecording();
    }
  }, [isRecording, recordingTime, question.recordTime, stopRecording]);

  // Process audio when recording stops
  useEffect(() => {
    if (audioBlob && phase === "recording") {
      processRecording();
    }
  }, [audioBlob]);

  const processRecording = async () => {
    if (!audioBlob) return;
    setPhase("processing");
    
    try {
      const transcription = await transcribeAudio(audioBlob);
      setSpokenText(transcription);
      
      const result = await scoreSpeaking({
        testType: question.type,
        spokenText: transcription,
        originalText: question.content.text,
        imageDescription: question.content.imageDescription,
        lectureContent: question.content.lectureContent,
        question: question.content.question,
        expectedAnswer: question.content.expectedAnswer,
      });
      
      setScore(result);
      setPhase("results");
      setShowScoreModal(true);
      onComplete(result, transcription, recordingTime);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to process recording");
      setPhase("prep");
      setPrepTime(question.prepTime);
      resetRecording();
    }
  };

  const handleStartRecording = useCallback(() => {
    setPhase("recording");
    startRecording();
  }, [startRecording]);

  const handleRetry = () => {
    setScore(null);
    setSpokenText("");
    setPrepTime(question.prepTime);
    setShowScoreModal(false);
    resetRecording();
    if (needsAudioFirst && ttsSupported) {
      setPhase("listen");
    } else {
      setPhase("prep");
    }
  };

  const handlePlayAgain = () => {
    if (textToSpeak) {
      speak(textToSpeak);
    }
  };

  const handleSkipAudio = () => {
    stopSpeaking();
    setPhase("prep");
    setPrepTime(question.prepTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (error) {
    toast.error(error);
  }

  return (
    <div className="space-y-4 animate-fade-slide-up">
      {/* Test Type Header */}
      <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {typeInfo.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-semibold text-lg">{typeInfo.name}</h2>
              <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300">
                📖 Study Guide
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {question.instruction}
            </p>
          </div>
        </div>
      </Card>

      {/* Question Info Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-medium">
            #{questionIndex + 1} {(question as any).title || `Question ${questionIndex + 1}`}
          </span>
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
        <Badge className="bg-teal-500 text-white hover:bg-teal-600">
          Tested ({Math.floor(Math.random() * 30) + 1})
        </Badge>
      </div>

      {/* Timer Display */}
      <div className="text-orange-500 font-medium">
        Time: {formatTime(phase === "recording" ? recordingTime : prepTime)}
      </div>

      {/* Audio Player for Listen Phase */}
      {(phase === "listen" || needsAudioFirst) && phase !== "results" && (
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-12 w-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={isSpeaking ? stopSpeaking : handlePlayAgain}
            >
              {isSpeaking ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            
            <div className="flex-1">
              <Slider 
                value={[isSpeaking ? 50 : 0]} 
                max={100}
                className="w-full"
              />
            </div>
            
            <span className="text-sm text-muted-foreground min-w-[80px]">
              00:03 / 01:35
            </span>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Volume2 className="h-4 w-4" />
              </Button>
              <Badge variant="outline">X1.0</Badge>
              <Badge variant="outline">Blake (US) ▼</Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Question Content */}
      <Card className="p-6 bg-card">
        {/* Show text for read-aloud and describe-image */}
        {question.content.text && !AUDIO_FIRST_TYPES.includes(question.type) && phase !== "results" && (
          <p className="text-lg leading-relaxed">{question.content.text}</p>
        )}
        
        {/* Show question for answer-short-question after listening */}
        {question.content.question && phase !== "listen" && phase !== "results" && (
          <p className="text-xl font-medium">{question.content.question}</p>
        )}
        
        {question.content.imageUrl && (
          <img 
            src={question.content.imageUrl} 
            alt="Describe this" 
            className="rounded-lg max-h-64 object-cover" 
          />
        )}

        {/* Microphone Permission Warning */}
        {phase === "prep" && (
          <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg text-center text-red-600 dark:text-red-400">
            <p className="font-medium">Microphone permission is not granted.</p>
            <Button variant="outline" size="sm" className="mt-2 border-red-300 text-red-600 hover:bg-red-50">
              Help
            </Button>
          </div>
        )}
      </Card>

      {/* Recording Controls */}
      <Card className="p-6">
        {/* Listen Phase */}
        {phase === "listen" && (
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="relative">
                <Volume2 className="h-8 w-8 text-primary animate-pulse" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping" />
              </div>
              <span className="text-lg font-medium">Listen carefully...</span>
            </div>
            
            <AudioWaveform 
              isRecording={true} 
              audioStream={null}
              className="h-16"
              barCount={40}
            />
            
            <Button variant="outline" onClick={handleSkipAudio}>
              Skip to Preparation
            </Button>
          </div>
        )}

        {/* Prep Phase */}
        {phase === "prep" && (
          <div className="text-center space-y-6">
            <CountdownTimer
              totalSeconds={question.prepTime}
              currentSeconds={question.prepTime - prepTime}
              isActive={prepTime > 0}
              label="Preparation Time"
              variant="prep"
            />
            
            <Button 
              onClick={handleStartRecording} 
              size="lg" 
              className="mt-4 gradient-primary text-primary-foreground"
            >
              <Mic className="mr-2 h-5 w-5" /> Start Recording
            </Button>
          </div>
        )}

        {/* Recording Phase */}
        {phase === "recording" && (
          <div className="text-center space-y-6">
            <CountdownTimer
              totalSeconds={question.recordTime}
              currentSeconds={recordingTime}
              isActive={isRecording}
              label="Recording"
              variant="recording"
            />
            
            <AudioWaveform 
              isRecording={isRecording} 
              audioStream={audioStream}
              className="h-16"
            />
            
            <Button onClick={stopRecording} size="lg" variant="destructive">
              <Square className="mr-2 h-5 w-5" /> Stop Recording
            </Button>
          </div>
        )}

        {/* Processing Phase */}
        {phase === "processing" && (
          <div className="text-center space-y-4 py-8">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <div>
              <p className="font-medium">Analyzing your response...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Using PTE scoring methodology
              </p>
            </div>
          </div>
        )}

        {/* Results Phase */}
        {phase === "results" && score && !showScoreModal && (
          <div className="space-y-6">
            <ScoreDisplay 
              score={score} 
              spokenText={spokenText}
              originalText={question.content.text}
              audioUrl={audioUrl || undefined}
            />
            
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

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" disabled={phase === "recording" || phase === "processing"}>
          Submit
        </Button>
        <Button variant="outline" size="sm" onClick={handleRetry} disabled={phase === "recording" || phase === "processing"}>
          Re-do
        </Button>
        <Button variant="outline" size="sm" className="text-primary border-primary">
          <Languages className="h-4 w-4 mr-1" /> Translation
        </Button>
        <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-600">
          <Sparkles className="h-4 w-4 mr-1" /> Zen Practice
        </Button>
        <Button variant="secondary" size="sm" disabled>
          Answer
        </Button>
        
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            📧 × 5
          </Badge>
          <Button variant="outline" size="sm">
            Question Co...
          </Button>
          <Button variant="default" size="sm" className="bg-emerald-500 hover:bg-emerald-600">
            Search
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onPrevious}
            disabled={questionIndex === 0}
          >
            Previous
          </Button>
          <Button 
            variant="default" 
            size="sm"
            className="bg-orange-500 hover:bg-orange-600"
            onClick={onNext}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Score Modal */}
      {showScoreModal && score && (
        <ScoreDisplay 
          score={score}
          spokenText={spokenText}
          originalText={question.content.text}
          audioUrl={audioUrl || undefined}
          isModal
          onClose={() => setShowScoreModal(false)}
        />
      )}
    </div>
  );
}
