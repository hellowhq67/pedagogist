import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, Play, Pause, ChevronRight, ChevronLeft, 
  Volume2, Mic, FileText, BookOpen, Headphones,
  AlertTriangle, CheckCircle, X, Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { speakingQuestions } from "@/data/speakingQuestions";
import { writingQuestions } from "@/data/writingQuestions";
import { readingQuestions } from "@/data/readingQuestions";
import { listeningQuestions } from "@/data/listeningQuestions";
import { MockTestSection } from "@/components/mocktest/MockTestSection";
import { MockTestCertificate } from "@/components/mocktest/MockTestCertificate";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// PTE Test Structure (2 hours 19 minutes = 139 minutes total)
const TEST_SECTIONS = [
  { 
    id: "speaking", 
    name: "Speaking & Writing", 
    icon: Mic, 
    duration: 77, // 77 minutes
    color: "from-orange-500 to-orange-600",
    questionTypes: [
      { type: "read-aloud", count: 6, timePerQ: 40 },
      { type: "repeat-sentence", count: 10, timePerQ: 15 },
      { type: "describe-image", count: 3, timePerQ: 40 },
      { type: "retell-lecture", count: 2, timePerQ: 40 },
      { type: "answer-short-question", count: 5, timePerQ: 10 },
      { type: "summarize-written-text", count: 1, timePerQ: 600 },
      { type: "write-essay", count: 1, timePerQ: 1200 },
    ]
  },
  { 
    id: "reading", 
    name: "Reading", 
    icon: BookOpen, 
    duration: 29, // 29 minutes
    color: "from-blue-500 to-blue-600",
    questionTypes: [
      { type: "mc-single", count: 2, timePerQ: 120 },
      { type: "mc-multiple", count: 2, timePerQ: 150 },
      { type: "reorder-paragraphs", count: 2, timePerQ: 180 },
      { type: "fill-blanks-drag", count: 2, timePerQ: 180 },
      { type: "fill-blanks-dropdown", count: 2, timePerQ: 180 },
    ]
  },
  { 
    id: "listening", 
    name: "Listening", 
    icon: Headphones, 
    duration: 33, // 33 minutes (includes audio playback)
    color: "from-purple-500 to-purple-600",
    questionTypes: [
      { type: "summarize-spoken-text", count: 1, timePerQ: 600 },
      { type: "mc-multiple-listening", count: 2, timePerQ: 150 },
      { type: "fill-blanks-listening", count: 2, timePerQ: 180 },
      { type: "highlight-correct-summary", count: 2, timePerQ: 180 },
      { type: "mc-single-listening", count: 2, timePerQ: 120 },
      { type: "select-missing-word", count: 2, timePerQ: 120 },
      { type: "highlight-incorrect-words", count: 2, timePerQ: 180 },
      { type: "write-from-dictation", count: 3, timePerQ: 60 },
    ]
  }
];

// Total test duration: 2h 19min = 139 minutes = 8340 seconds
const TOTAL_TEST_DURATION = 8340;

interface MockTestAnswer {
  questionId: string;
  questionType: string;
  section: string;
  answer: any;
  score?: number;
  maxScore?: number;
  timeSpent: number;
}

type TestPhase = "intro" | "testing" | "break" | "completed";

export default function MockTest() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  const [phase, setPhase] = useState<TestPhase>("intro");
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalTimeRemaining, setTotalTimeRemaining] = useState(TOTAL_TEST_DURATION);
  const [sectionTimeRemaining, setSectionTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [answers, setAnswers] = useState<MockTestAnswer[]>([]);
  const [testQuestions, setTestQuestions] = useState<any[]>([]);
  const [showCertificate, setShowCertificate] = useState(false);
  const [testStartTime, setTestStartTime] = useState<Date | null>(null);
  const [testEndTime, setTestEndTime] = useState<Date | null>(null);
  const [finalScores, setFinalScores] = useState<any>(null);
  
  const questionStartTimeRef = useRef<number>(Date.now());

  // Generate test questions on mount
  useEffect(() => {
    const questions: any[] = [];
    
    TEST_SECTIONS.forEach(section => {
      section.questionTypes.forEach(qt => {
        let sourceQuestions: any[] = [];
        
        if (section.id === "speaking") {
          sourceQuestions = speakingQuestions.filter(q => 
            q.type === qt.type || 
            q.type.replace(/-/g, '-').toLowerCase() === qt.type.toLowerCase()
          );
        } else if (section.id === "reading") {
          sourceQuestions = readingQuestions.filter(q => 
            q.type === qt.type
          );
        } else if (section.id === "listening") {
          sourceQuestions = listeningQuestions.filter(q => 
            q.type === qt.type
          );
        }
        
        // Shuffle and take required count
        const shuffled = [...sourceQuestions].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(qt.count, shuffled.length));
        
        selected.forEach(q => {
          questions.push({
            ...q,
            section: section.id,
            sectionName: section.name,
            timeLimit: qt.timePerQ
          });
        });
      });
    });
    
    setTestQuestions(questions);
  }, []);

  // Timer effect
  useEffect(() => {
    if (phase !== "testing" || isPaused) return;
    
    const timer = setInterval(() => {
      setTotalTimeRemaining(prev => {
        if (prev <= 0) {
          handleTestComplete();
          return 0;
        }
        return prev - 1;
      });
      
      setSectionTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [phase, isPaused]);

  // Initialize section time when section changes
  useEffect(() => {
    if (phase === "testing" && currentSectionIndex < TEST_SECTIONS.length) {
      setSectionTimeRemaining(TEST_SECTIONS[currentSectionIndex].duration * 60);
    }
  }, [currentSectionIndex, phase]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTest = () => {
    setPhase("testing");
    setTestStartTime(new Date());
    questionStartTimeRef.current = Date.now();
    toast.success("Test started! Good luck!");
  };

  const handleAnswerSubmit = useCallback((answer: any, score?: number, maxScore?: number) => {
    const currentQuestion = testQuestions[currentQuestionIndex];
    if (!currentQuestion) return;
    
    const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
    
    const newAnswer: MockTestAnswer = {
      questionId: currentQuestion.id,
      questionType: currentQuestion.type,
      section: currentQuestion.section,
      answer,
      score,
      maxScore,
      timeSpent
    };
    
    setAnswers(prev => [...prev, newAnswer]);
    
    // Move to next question
    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      questionStartTimeRef.current = Date.now();
      
      // Check if we're moving to a new section
      const nextQuestion = testQuestions[currentQuestionIndex + 1];
      const currentSection = currentQuestion.section;
      
      if (nextQuestion && nextQuestion.section !== currentSection) {
        const nextSectionIdx = TEST_SECTIONS.findIndex(s => s.id === nextQuestion.section);
        if (nextSectionIdx !== -1) {
          setCurrentSectionIndex(nextSectionIdx);
          toast.info(`Moving to ${TEST_SECTIONS[nextSectionIdx].name} section`);
        }
      }
    } else {
      handleTestComplete();
    }
  }, [currentQuestionIndex, testQuestions]);

  const handleSkipQuestion = useCallback(() => {
    const currentQuestion = testQuestions[currentQuestionIndex];
    if (!currentQuestion) return;
    
    const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
    
    const newAnswer: MockTestAnswer = {
      questionId: currentQuestion.id,
      questionType: currentQuestion.type,
      section: currentQuestion.section,
      answer: null,
      score: 0,
      maxScore: currentQuestion.maxScore || 1,
      timeSpent
    };
    
    setAnswers(prev => [...prev, newAnswer]);
    
    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      questionStartTimeRef.current = Date.now();
    } else {
      handleTestComplete();
    }
  }, [currentQuestionIndex, testQuestions]);

  const handleTestComplete = useCallback(() => {
    setPhase("completed");
    setTestEndTime(new Date());
    
    // Calculate final scores
    const sectionScores: Record<string, { earned: number; max: number; count: number }> = {
      speaking: { earned: 0, max: 0, count: 0 },
      reading: { earned: 0, max: 0, count: 0 },
      listening: { earned: 0, max: 0, count: 0 },
      writing: { earned: 0, max: 0, count: 0 }
    };
    
    answers.forEach(ans => {
      const section = ans.section === "speaking" && 
        (ans.questionType === "summarize-written-text" || ans.questionType === "write-essay")
        ? "writing" : ans.section;
      
      if (sectionScores[section]) {
        sectionScores[section].earned += ans.score || 0;
        sectionScores[section].max += ans.maxScore || 1;
        sectionScores[section].count += 1;
      }
    });
    
    // Convert to PTE scale (10-90)
    const calculatePTEScore = (earned: number, max: number) => {
      if (max === 0) return 10;
      const percentage = (earned / max) * 100;
      return Math.round(10 + (percentage / 100) * 80);
    };
    
    const scores = {
      speaking: calculatePTEScore(sectionScores.speaking.earned, sectionScores.speaking.max),
      writing: calculatePTEScore(sectionScores.writing.earned, sectionScores.writing.max),
      reading: calculatePTEScore(sectionScores.reading.earned, sectionScores.reading.max),
      listening: calculatePTEScore(sectionScores.listening.earned, sectionScores.listening.max),
      overall: 0,
      totalAnswered: answers.length,
      totalQuestions: testQuestions.length,
      timeUsed: TOTAL_TEST_DURATION - totalTimeRemaining
    };
    
    scores.overall = Math.round((scores.speaking + scores.writing + scores.reading + scores.listening) / 4);
    
    setFinalScores(scores);
    setShowCertificate(true);
  }, [answers, testQuestions.length, totalTimeRemaining]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  const currentQuestion = testQuestions[currentQuestionIndex];
  const currentSection = TEST_SECTIONS[currentSectionIndex];
  const progress = testQuestions.length > 0 
    ? ((currentQuestionIndex + 1) / testQuestions.length) * 100 
    : 0;

  // Intro screen
  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mx-auto flex items-center justify-center mb-4">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold font-display mb-2">PTE Academic Mock Test</h1>
              <p className="text-muted-foreground">Full simulation of the actual PTE Academic exam</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Test Duration
                </h3>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-2xl font-bold text-primary">2 hours 19 minutes</p>
                  <p className="text-sm text-muted-foreground mt-1">139 minutes total</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  Test Structure
                </h3>
                <div className="space-y-2">
                  {TEST_SECTIONS.map(section => (
                    <div key={section.id} className="flex items-center justify-between p-2 rounded bg-muted">
                      <div className="flex items-center gap-2">
                        <section.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{section.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{section.duration} min</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-warning-foreground">Important Instructions</h4>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Ensure you have a stable internet connection</li>
                    <li>• Use headphones and a microphone for speaking sections</li>
                    <li>• Do not refresh the page during the test</li>
                    <li>• The test cannot be paused once started</li>
                    <li>• You will receive a certificate upon completion</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-accent text-white px-8"
                onClick={handleStartTest}
              >
                <Play className="mr-2 h-5 w-5" />
                Start Mock Test
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Certificate screen
  if (showCertificate && finalScores) {
    return (
      <MockTestCertificate 
        scores={finalScores}
        userName={user?.email?.split('@')[0] || 'Student'}
        testDate={testEndTime || new Date()}
        onClose={() => navigate("/dashboard")}
      />
    );
  }

  // Testing screen
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge 
                className={cn(
                  "text-white px-3 py-1",
                  `bg-gradient-to-r ${currentSection?.color || 'from-primary to-accent'}`
                )}
              >
                {currentSection?.name || 'Mock Test'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {testQuestions.length}
              </span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Section Time</p>
                <p className="font-mono font-bold text-lg">{formatTime(sectionTimeRemaining)}</p>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Total Time</p>
                <p className={cn(
                  "font-mono font-bold text-lg",
                  totalTimeRemaining < 300 && "text-destructive"
                )}>
                  {formatTime(totalTimeRemaining)}
                </p>
              </div>
              
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => {
                  if (confirm("Are you sure you want to end the test? This action cannot be undone.")) {
                    handleTestComplete();
                  }
                }}
              >
                <X className="mr-1 h-4 w-4" />
                End Test
              </Button>
            </div>
          </div>
          
          <Progress value={progress} className="mt-2 h-1" />
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 py-6">
          {currentQuestion ? (
            <MockTestSection
              question={currentQuestion}
              questionIndex={currentQuestionIndex}
              totalQuestions={testQuestions.length}
              onSubmit={handleAnswerSubmit}
              onSkip={handleSkipQuestion}
              timeLimit={currentQuestion.timeLimit}
            />
          ) : (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="mt-4 text-muted-foreground">Loading questions...</p>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer Navigation */}
      <footer className="border-t bg-card py-4">
        <div className="max-w-5xl mx-auto px-4 flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {TEST_SECTIONS.map((section, idx) => (
              <div 
                key={section.id}
                className={cn(
                  "w-3 h-3 rounded-full",
                  idx === currentSectionIndex 
                    ? "bg-primary" 
                    : idx < currentSectionIndex 
                      ? "bg-success" 
                      : "bg-muted"
                )}
              />
            ))}
          </div>
          
          <Button onClick={handleSkipQuestion}>
            Skip
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
}