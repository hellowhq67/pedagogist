import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Bookmark, ChevronDown, List, BarChart2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SpeakingQuestion, TestType, getTestTypeInfo } from "@/data/speakingQuestions";
import { WritingQuestion, WritingTestType, getWritingTestTypeInfo } from "@/data/writingQuestions";

interface QuestionListPanelProps {
  section: "speaking" | "writing";
  testType: TestType | WritingTestType;
  questions: (SpeakingQuestion | WritingQuestion)[];
  currentQuestionIndex: number;
  completedQuestions?: Set<string>;
  onSelectQuestion: (index: number) => void;
  onClose?: () => void;
}

export function QuestionListPanel({
  section,
  testType,
  questions,
  currentQuestionIndex,
  completedQuestions = new Set(),
  onSelectQuestion,
  onClose,
}: QuestionListPanelProps) {
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "practiced" | "not-practiced">("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [bookmarkFilter, setBookmarkFilter] = useState<"all" | "bookmarked">("all");
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(new Set());

  const typeInfo = section === "speaking" 
    ? getTestTypeInfo(testType as TestType)
    : getWritingTestTypeInfo(testType as WritingTestType);

  const filteredQuestions = questions.filter((q, index) => {
    // Search filter
    const matchesSearch = search === "" || 
      `#${String(index + 1).padStart(8, '0')}`.includes(search) ||
      (q as any).title?.toLowerCase().includes(search.toLowerCase()) ||
      `Question ${index + 1}`.toLowerCase().includes(search.toLowerCase());
    
    // Practice status filter
    const isPracticed = completedQuestions.has(q.id);
    const matchesPracticeStatus = 
      filterTab === "all" || 
      (filterTab === "practiced" && isPracticed) ||
      (filterTab === "not-practiced" && !isPracticed);
    
    // Level/difficulty filter
    const matchesLevel = levelFilter === "all" || q.difficulty === levelFilter;
    
    // Bookmark filter
    const matchesBookmark = bookmarkFilter === "all" || bookmarkedQuestions.has(q.id);
    
    return matchesSearch && matchesPracticeStatus && matchesLevel && matchesBookmark;
  });

  const toggleBookmark = (questionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "border-emerald-500 text-emerald-500";
      case "medium":
        return "border-amber-500 text-amber-500";
      case "hard":
        return "border-red-500 text-red-500";
      default:
        return "border-muted-foreground text-muted-foreground";
    }
  };

  const getOriginalIndex = (question: SpeakingQuestion | WritingQuestion) => {
    return questions.findIndex(q => q.id === question.id);
  };

  // Generate random "appeared" count for demo
  const getAppearedCount = (index: number) => {
    return Math.floor(Math.sin(index * 12345) * 5 + 5);
  };

  return (
    <Card className="h-full flex flex-col bg-background border-l shadow-lg">
      {/* Header */}
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">
                {typeInfo.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </span>
            </div>
            <h2 className="font-semibold text-lg">{typeInfo.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-primary border-primary">
              Reset Practice
            </Button>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={filterTab === "all"}
              onChange={() => setFilterTab("all")}
              className="rounded border-primary text-primary"
            />
            <span className="text-sm text-primary">All</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={filterTab === "practiced"}
              onChange={() => setFilterTab(filterTab === "practiced" ? "all" : "practiced")}
              className="rounded"
            />
            <span className="text-sm">Practiced</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={filterTab === "not-practiced"}
              onChange={() => setFilterTab(filterTab === "not-practiced" ? "all" : "not-practiced")}
              className="rounded"
            />
            <span className="text-sm">Not Practiced</span>
          </label>
          
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Input
                placeholder="Content / Title / Number"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 pr-10 h-9"
              />
              <Button 
                size="icon" 
                className="absolute right-0 top-0 h-9 w-9 rounded-l-none bg-primary"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Column Headers */}
        <div className="flex items-center gap-4 text-sm border-b pb-2">
          <button 
            className={cn(
              "font-medium transition-colors",
              filterTab === "all" ? "text-primary border-b-2 border-primary pb-1" : "text-muted-foreground"
            )}
            onClick={() => setFilterTab("all")}
          >
            All
          </button>
          <button className="text-muted-foreground hover:text-foreground">
            Prediction
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
              Bookmark <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover z-50">
              <DropdownMenuItem onClick={() => setBookmarkFilter("all")}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setBookmarkFilter("bookmarked")}>Bookmarked</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
              Level <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover z-50">
              <DropdownMenuItem onClick={() => setLevelFilter("all")}>All Levels</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLevelFilter("easy")}>Easy</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLevelFilter("medium")}>Medium</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLevelFilter("hard")}>Hard</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="ml-auto flex items-center gap-2 text-muted-foreground">
            <List className="h-4 w-4" />
            <BarChart2 className="h-4 w-4" />
            <span className="text-sm font-medium">{filteredQuestions.length} Questions</span>
            <span className="text-xs">(New to old)</span>
          </div>
        </div>
      </div>

      {/* Question List */}
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {filteredQuestions.map((question, filteredIndex) => {
            const originalIndex = getOriginalIndex(question);
            const isActive = originalIndex === currentQuestionIndex;
            const isCompleted = completedQuestions.has(question.id);
            const isBookmarked = bookmarkedQuestions.has(question.id);
            const questionNumber = `#${String(originalIndex + 18000201).toString()}`;
            const appearedCount = getAppearedCount(originalIndex);

            return (
              <button
                key={question.id}
                onClick={() => onSelectQuestion(originalIndex)}
                className={cn(
                  "w-full px-4 py-3 text-left transition-all flex items-center gap-4",
                  "hover:bg-muted/50",
                  isActive && "bg-primary/5 border-l-4 border-l-primary"
                )}
              >
                {/* Question Number */}
                <span className="text-primary font-medium min-w-[80px]">
                  {questionNumber}
                </span>

                {/* Question Title */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {(question as any).title || `Question ${originalIndex + 1}`}
                  </p>
                </div>

                {/* Difficulty Badge */}
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs capitalize font-normal shrink-0",
                    getDifficultyColor(question.difficulty)
                  )}
                >
                  • {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                </Badge>

                {/* Appeared Count */}
                <Badge variant="outline" className="text-xs text-muted-foreground shrink-0">
                  Appeared ({appearedCount})
                </Badge>

                {/* Bookmark */}
                <button
                  onClick={(e) => toggleBookmark(question.id, e)}
                  className={cn(
                    "p-1 rounded transition-colors shrink-0",
                    isBookmarked ? "text-amber-500" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Bookmark className={cn("h-5 w-5", isBookmarked && "fill-current")} />
                </button>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t bg-teal-600 text-white flex items-center justify-center gap-2">
        <span className="text-sm">ℹ️ Learn the strategies for {typeInfo.name} - </span>
        <a href="#" className="text-sm underline hover:no-underline">Click here</a>
      </div>
    </Card>
  );
}
