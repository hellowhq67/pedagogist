import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { QuestionListPanel } from "@/components/speaking/QuestionListPanel";
import { SpeakingTest } from "@/components/speaking/SpeakingTest";
import { WritingTest } from "@/components/writing/WritingTest";
import { ReadingTest } from "@/components/reading/ReadingTest";
import { ListeningTest } from "@/components/listening/ListeningTest";
import { HistoryPanel } from "@/components/speaking/HistoryPanel";
import { speakingQuestions, TestType, getTestTypeInfo } from "@/data/speakingQuestions";
import { writingQuestions, WritingTestType, getWritingTestTypeInfo } from "@/data/writingQuestions";
import { readingQuestions, ReadingTestType, getReadingTestTypeInfo } from "@/data/readingQuestions";
import { listeningQuestions, ListeningTestType, getListeningTestTypeInfo } from "@/data/listeningQuestions";
import { useUserHistory } from "@/hooks/useUserHistory";
import { useScoringLimit } from "@/hooks/useScoringLimit";
import { ScoreResult } from "@/lib/scoring";
import { BookOpen, History, Menu, ListFilter, ChevronLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type SectionType = "speaking" | "writing" | "reading" | "listening";
type AllTestTypes = TestType | WritingTestType | ReadingTestType | ListeningTestType;

export default function Index() {
  const [selectedSection, setSelectedSection] = useState<SectionType>("speaking");
  const [selectedType, setSelectedType] = useState<AllTestTypes | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set());
  const [isQuestionPanelOpen, setIsQuestionPanelOpen] = useState(false);
  const { saveAttempt } = useUserHistory();
  const { remainingAttempts, canScore, incrementUsage } = useScoringLimit();

  const currentQuestions = selectedType
    ? selectedSection === "speaking"
      ? speakingQuestions.filter((q) => q.type === selectedType)
      : selectedSection === "writing"
      ? writingQuestions.filter((q) => q.type === selectedType)
      : selectedSection === "reading"
      ? readingQuestions.filter((q) => q.type === selectedType)
      : listeningQuestions.filter((q) => q.type === selectedType)
    : [];

  const currentQuestion = currentQuestions[currentQuestionIndex];

  const handleComplete = async (score: ScoreResult | any, text: string, duration?: number) => {
    if (currentQuestion) {
      setCompletedQuestions((prev) => new Set(prev).add(currentQuestion.id));
      if (selectedSection === "speaking") {
        const canProceed = await incrementUsage();
        if (!canProceed) {
          toast.error("Daily scoring limit reached (5/day). Try again tomorrow!");
          return;
        }
        await saveAttempt({
          questionId: currentQuestion.id,
          testType: currentQuestion.type as TestType,
          spokenText: text,
          score,
          durationSeconds: duration || 0,
        });
      }
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    } else {
      setSelectedType(null);
      setCurrentQuestionIndex(0);
    }
  };

  const handleSelectQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setIsQuestionPanelOpen(false);
  };

  const handleSelectType = (type: AllTestTypes) => {
    setSelectedType(type);
    setCurrentQuestionIndex(0);
  };

  const getTypeInfo = () => {
    if (!selectedType) return null;
    switch (selectedSection) {
      case "speaking": return getTestTypeInfo(selectedType as TestType);
      case "writing": return getWritingTestTypeInfo(selectedType as WritingTestType);
      case "reading": return getReadingTestTypeInfo(selectedType as ReadingTestType);
      case "listening": return getListeningTestTypeInfo(selectedType as ListeningTestType);
    }
  };

  const typeInfo = getTypeInfo();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar
          selectedSection={selectedSection}
          selectedType={selectedType}
          onSelectSection={setSelectedSection}
          onSelectType={handleSelectType}
        />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
            <div className="px-4 py-3 flex items-center gap-4">
              <SidebarTrigger>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SidebarTrigger>
              <h1 className="text-lg font-bold gradient-text">PTE Practice Platform</h1>
              
              {/* Question Panel Toggle - shows when a test type is selected */}
              {selectedType && (
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    Question {currentQuestionIndex + 1} of {currentQuestions.length}
                  </span>
                  <Sheet open={isQuestionPanelOpen} onOpenChange={setIsQuestionPanelOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <ListFilter className="h-4 w-4" />
                        <span className="hidden sm:inline">Questions</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:w-[450px] p-0">
                      <QuestionListPanel
                        section={selectedSection}
                        testType={selectedType}
                        questions={currentQuestions}
                        currentQuestionIndex={currentQuestionIndex}
                        completedQuestions={completedQuestions}
                        onSelectQuestion={handleSelectQuestion}
                        onClose={() => setIsQuestionPanelOpen(false)}
                      />
                    </SheetContent>
                  </Sheet>
                </div>
              )}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 overflow-auto">
            {!selectedType ? (
              <Tabs defaultValue="practice" className="space-y-6 max-w-4xl mx-auto">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                  <TabsTrigger value="practice" className="gap-2">
                    <BookOpen className="h-4 w-4" /> Practice
                  </TabsTrigger>
                  <TabsTrigger value="history" className="gap-2">
                    <History className="h-4 w-4" /> History
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="practice">
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-2">Welcome to PTE Practice</h2>
                    <p className="text-muted-foreground">
                      Select a test type from the sidebar to start practicing
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="history">
                  <HistoryPanel />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex gap-4 h-full max-w-4xl mx-auto">
                {/* Test Area - Full Width, Responsive */}
                <div className="flex-1 w-full">
                  {/* Back button and header - Mobile friendly */}
                  <div className="mb-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedType(null)}
                        className="gap-1 -ml-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Back</span>
                      </Button>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xl sm:text-2xl shrink-0">{typeInfo?.icon}</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm sm:text-base truncate">{typeInfo?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Question {currentQuestionIndex + 1} of {currentQuestions.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedSection === "speaking" && currentQuestion && (
                    <>
                      {!canScore && (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-amber-500" />
                          <span className="text-sm">Daily limit reached ({remainingAttempts}/5). Scoring disabled.</span>
                        </div>
                      )}
                      <SpeakingTest
                        key={currentQuestion.id}
                        question={currentQuestion as any}
                        questionIndex={currentQuestionIndex}
                        totalQuestions={currentQuestions.length}
                        onComplete={(score, text, duration) => handleComplete(score, text, duration)}
                        onNext={handleNext}
                        onPrevious={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                      />
                    </>
                  )}

                  {selectedSection === "writing" && currentQuestion && (
                    <WritingTest
                      key={currentQuestion.id}
                      question={currentQuestion as any}
                      onComplete={(score, text) => handleComplete(score, text)}
                      onNext={handleNext}
                    />
                  )}

                  {selectedSection === "reading" && currentQuestion && (
                    <ReadingTest
                      key={currentQuestion.id}
                      question={currentQuestion as any}
                      questionIndex={currentQuestionIndex}
                      totalQuestions={currentQuestions.length}
                      onComplete={(score, correct) => {}}
                      onNext={handleNext}
                      onPrevious={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    />
                  )}

                  {selectedSection === "listening" && currentQuestion && (
                    <ListeningTest
                      key={currentQuestion.id}
                      question={currentQuestion as any}
                      questionIndex={currentQuestionIndex}
                      totalQuestions={currentQuestions.length}
                      onComplete={(score, correct) => {}}
                      onNext={handleNext}
                      onPrevious={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    />
                  )}
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Floating Question Panel Toggle Button - visible on larger screens when panel is closed */}
        {selectedType && (
          <Button
            variant="default"
            size="icon"
            className="fixed right-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full shadow-lg bg-primary hidden xl:flex"
            onClick={() => setIsQuestionPanelOpen(true)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
      </div>
    </SidebarProvider>
  );
}
