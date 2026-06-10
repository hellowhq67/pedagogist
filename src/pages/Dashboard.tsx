import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
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
import { StudyPlanner } from "@/components/dashboard/StudyPlanner";
import { speakingQuestions, TestType, getTestTypeInfo } from "@/data/speakingQuestions";
import { writingQuestions, WritingTestType, getWritingTestTypeInfo } from "@/data/writingQuestions";
import { readingQuestions, ReadingTestType, getReadingTestTypeInfo } from "@/data/readingQuestions";
import { listeningQuestions, ListeningTestType, getListeningTestTypeInfo } from "@/data/listeningQuestions";
import { useUserHistory } from "@/hooks/useUserHistory";
import { useScoringLimit } from "@/hooks/useScoringLimit";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/contexts/UserDataContext";
import { ScoreResult } from "@/lib/scoring";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
} from 'recharts';
import {
  BookOpen,
  History,
  Menu,
  ListFilter,
  ChevronLeft,
  AlertCircle,
  Mic,
  PenTool,
  Headphones,
  LogOut,
  Settings,
  BarChart3,
  Target,
  Clock,
  Trophy,
  Loader2,
  TrendingUp,
  Zap,
  Sparkles,
  Play,
  ArrowRight,
  Crown,
  LayoutDashboard,
  CalendarDays,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { CreditsBadge } from "@/components/dashboard/CreditsBadge";

type SectionType = "speaking" | "writing" | "reading" | "listening";
type AllTestTypes = TestType | WritingTestType | ReadingTestType | ListeningTestType;

// Module definitions for analytics
const modules = [
  {
    id: 'speaking',
    title: 'Speaking',
    icon: Mic,
    description: 'Practice pronunciation and fluency',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    chartColor: 'hsl(var(--primary))',
  },
  {
    id: 'writing',
    title: 'Writing',
    icon: PenTool,
    description: 'Essays and summaries',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    chartColor: 'hsl(var(--accent))',
  },
  {
    id: 'reading',
    title: 'Reading',
    icon: BookOpen,
    description: 'Comprehension and vocabulary',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    chartColor: '#10b981',
  },
  {
    id: 'listening',
    title: 'Listening',
    icon: Headphones,
    description: 'Audio comprehension skills',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    chartColor: '#3b82f6',
  },
];

// (analytics now driven by UserDataContext)


export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast: showToast } = useToast();
  const {
    weeklyProgress,
    skillsRadar,
    activity,
    stats: realStats,
    subscription,
    refresh,
  } = useUserData();

  // View state: 'overview' or 'practice'
  const [currentView, setCurrentView] = useState<'overview' | 'practice'>('overview');

  // Practice state
  const [selectedSection, setSelectedSection] = useState<SectionType>("speaking");
  const [selectedType, setSelectedType] = useState<AllTestTypes | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set());
  const [isQuestionPanelOpen, setIsQuestionPanelOpen] = useState(false);
  const { saveAttempt } = useUserHistory();
  const { remainingAttempts, canScore, incrementUsage } = useScoringLimit();

  const tier = subscription?.tier ?? "free";
  const FREE_QUESTION_LIMIT = 2;
  const isFree = tier === "free";

  useEffect(() => {
    if (!loading && !user) {
      showToast({
        title: 'Authentication required',
        description: 'Please sign in to access the dashboard.',
        variant: 'destructive',
      });
      navigate('/auth');
    }
  }, [user, loading, navigate, showToast]);


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
  const isCurrentLocked = isFree && currentQuestionIndex >= FREE_QUESTION_LIMIT;

  const handleComplete = async (
    score: ScoreResult | any,
    text: string,
    duration?: number,
    audioPath?: string | null,
  ) => {
    if (!currentQuestion) return;
    if (isCurrentLocked) {
      toast.error("This question is locked. Upgrade to unlock all questions.");
      return;
    }
    // Server-side rate limit applies to every practice attempt
    const canProceed = await incrementUsage();
    if (!canProceed) {
      toast.error("You've run out of scoring credits. Upgrade to keep practicing.");
      return;
    }
    setCompletedQuestions((prev) => new Set(prev).add(currentQuestion.id));
    if (selectedSection === "speaking") {
      await saveAttempt({
        questionId: currentQuestion.id,
        testType: currentQuestion.type as TestType,
        spokenText: text,
        score,
        durationSeconds: duration || 0,
        audioUrl: audioPath ?? null,
      });
    }
    // Refresh dashboard stats so the overview reflects this attempt
    refresh();
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
    setCurrentView('practice');
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

  const handleSignOut = async () => {
    await signOut();
    showToast({
      title: 'Signed out',
      description: 'You have been successfully signed out.',
    });
    navigate('/');
  };

  const stats = [
    {
      label: 'Questions Done',
      value: realStats.questionsDone,
      icon: Target,
      change: realStats.questionsDone > 0 ? 'Keep it up!' : 'Start practicing'
    },
    {
      label: 'Practice Time',
      value: `${realStats.practiceHours}h`,
      icon: Clock,
      change: 'Total practice'
    },
    {
      label: 'Current Streak',
      value: `${realStats.streakDays} day${realStats.streakDays === 1 ? '' : 's'}`,
      icon: Trophy,
      change: realStats.streakDays > 0 ? 'On a roll!' : 'Practice today'
    },
    {
      label: 'Avg. Score',
      value: `${realStats.averageScore}%`,
      icon: BarChart3,
      change: realStats.averageScore > 0 ? 'Across all skills' : 'No data yet'
    },
  ];

  const typeInfo = getTypeInfo();
  const currentTier = subscription?.tier || 'free';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
          <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
            <div className="px-4 py-3 flex items-center gap-4">
              <SidebarTrigger>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SidebarTrigger>

              <Link to="/" className="flex items-center gap-2">
                <img src={logo} alt="PedagogistsPTE" className="h-8 w-auto" />
                <span className="text-lg font-bold text-foreground hidden sm:block">
                  PedagogistsPTE
                </span>
              </Link>

              {/* View Toggle */}
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant={currentView === 'overview' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setCurrentView('overview');
                    setSelectedType(null);
                  }}
                  className="gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </Button>
                <Button
                  variant={currentView === 'practice' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('practice')}
                  className="gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Practice</span>
                </Button>
              </div>

              <div className="ml-auto flex items-center gap-4">
                {currentTier !== 'free' && (
                  <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                    <Crown className="w-3 h-3 mr-1" />
                    {currentTier.toUpperCase()}
                  </Badge>
                )}
                
                {/* Question Panel Toggle - shows when practicing */}
                {selectedType && currentView === 'practice' && (
                  <>
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
                  </>
                )}

                <CreditsBadge />
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {user.email}
                </span>
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 overflow-auto">
            {currentView === 'overview' && !selectedType ? (
              // Analytics Dashboard View
              <div className="max-w-6xl mx-auto space-y-6">
                {/* Welcome Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground mb-2">
                        Welcome back, {user.user_metadata?.display_name || user.email?.split('@')[0]} 👋
                      </h1>
                      <p className="text-muted-foreground">
                        Continue your PTE practice journey. You're doing great!
                      </p>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      <Button 
                        onClick={() => setCurrentView('practice')}
                        className="shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Practice
                      </Button>
                      <Button variant="secondary" asChild>
                        <Link to="/mock-test">
                          <Clock className="w-4 h-4 mr-2" />
                          Full Mock Test (2h 19m)
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to="/#pricing">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Upgrade
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>

                {/* VIP Banner for free users */}
                {currentTier === 'free' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.05 }}
                  >
                    <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/30 overflow-hidden relative">
                      <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">Unlock Full Potential</h3>
                            <p className="text-sm text-muted-foreground">Get unlimited AI scoring, detailed analytics, and personalized study plans</p>
                          </div>
                        </div>
                        <Button asChild className="shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
                          <Link to="/#pricing">
                            Upgrade Now
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Stats Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  {stats.map((stat) => (
                    <Card key={stat.label} className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <stat.icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                          </div>
                        </div>
                        <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {stat.change}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>

                {/* Analytics Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                >
                  <Tabs defaultValue="progress" className="space-y-4">
                    <TabsList className="bg-card/50 border border-border/50">
                      <TabsTrigger value="progress">Weekly Progress</TabsTrigger>
                      <TabsTrigger value="skills">Skills Radar</TabsTrigger>
                      <TabsTrigger value="activity">Activity</TabsTrigger>
                      <TabsTrigger value="schedule">Schedule Exam</TabsTrigger>
                    </TabsList>

                    <TabsContent value="progress">
                      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Weekly Score Progress
                          </CardTitle>
                          <CardDescription>Your performance across all modules this week</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={weeklyProgress}>
                                <defs>
                                  <linearGradient id="colorSpeaking" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                  </linearGradient>
                                  <linearGradient id="colorWriting" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                                  </linearGradient>
                                  <linearGradient id="colorReading" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                  </linearGradient>
                                  <linearGradient id="colorListening" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                                <YAxis domain={[0, 90]} stroke="hsl(var(--muted-foreground))" />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: 'hsl(var(--card))', 
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px'
                                  }}
                                />
                                <Area type="monotone" dataKey="speaking" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorSpeaking)" />
                                <Area type="monotone" dataKey="writing" stroke="hsl(var(--accent))" fillOpacity={1} fill="url(#colorWriting)" />
                                <Area type="monotone" dataKey="reading" stroke="#10b981" fillOpacity={1} fill="url(#colorReading)" />
                                <Area type="monotone" dataKey="listening" stroke="#3b82f6" fillOpacity={1} fill="url(#colorListening)" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="flex flex-wrap gap-4 mt-4 justify-center">
                            {modules.map((mod) => (
                              <div key={mod.id} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: mod.chartColor }} />
                                <span className="text-sm text-muted-foreground">{mod.title}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="skills">
                      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" />
                            Skills Overview
                          </CardTitle>
                          <CardDescription>Your current skill levels across different areas</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart data={skillsRadar}>
                                <PolarGrid stroke="hsl(var(--border))" />
                                <PolarAngleAxis dataKey="skill" stroke="hsl(var(--muted-foreground))" />
                                <PolarRadiusAxis angle={30} domain={[0, 90]} stroke="hsl(var(--muted-foreground))" />
                                <Radar
                                  name="Current Score"
                                  dataKey="score"
                                  stroke="hsl(var(--primary))"
                                  fill="hsl(var(--primary))"
                                  fillOpacity={0.3}
                                />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="activity">
                      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            Practice Activity
                          </CardTitle>
                          <CardDescription>Questions attempted per module</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={activity}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                                <YAxis stroke="hsl(var(--muted-foreground))" />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px'
                                  }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                  {activity.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="schedule">
                      <StudyPlanner />
                    </TabsContent>
                  </Tabs>
                </motion.div>

                {/* Quick Practice Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h2 className="text-xl font-semibold mb-4">Quick Practice</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {modules.map((mod) => {
                      const firstType: Record<string, AllTestTypes> = {
                        speaking: "read-aloud",
                        writing: "summarize-written-text",
                        reading: "mc-single",
                        listening: "highlight-correct-summary",
                      };
                      return (
                        <Card
                          key={mod.id}
                          className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all cursor-pointer group"
                          onClick={() => {
                            setSelectedSection(mod.id as SectionType);
                            handleSelectType(firstType[mod.id]);
                          }}
                        >
                          <CardContent className="p-6">
                            <div className={`w-12 h-12 rounded-xl ${mod.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                              <mod.icon className={`w-6 h-6 ${mod.color}`} />
                            </div>
                            <h3 className="font-semibold text-foreground mb-1">{mod.title}</h3>
                            <p className="text-sm text-muted-foreground">{mod.description}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            ) : currentView === 'practice' && !selectedType ? (
              // Practice Selection View
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
                    <h2 className="text-2xl font-bold mb-2">Ready to Practice</h2>
                    <p className="text-muted-foreground mb-6">
                      Select a test type from the sidebar to start practicing
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                      {modules.map((mod) => (
                        <Card 
                          key={mod.id}
                          className="cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={() => setSelectedSection(mod.id as SectionType)}
                        >
                          <CardContent className="p-4 text-center">
                            <mod.icon className={`w-8 h-8 ${mod.color} mx-auto mb-2`} />
                            <p className="font-medium text-sm">{mod.title}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history">
                  <HistoryPanel />
                </TabsContent>
              </Tabs>
            ) : (
              // Active Test View
              <div className="flex gap-4 h-full max-w-4xl mx-auto">
                <div className="flex-1 w-full">
                  {/* Back button and header */}
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

                  {isCurrentLocked && (
                    <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-between gap-3">
                      <div className="text-sm">
                        🔒 This question is locked. Free users get the first {FREE_QUESTION_LIMIT} questions per type.
                      </div>
                      <Button size="sm" asChild>
                        <Link to="/#pricing">Upgrade</Link>
                      </Button>
                    </div>
                  )}
                  {!canScore && !isCurrentLocked && (
                    <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      <span className="text-sm">No scoring credits left ({remainingAttempts} remaining). Upgrade to continue.</span>
                    </div>
                  )}
                  {!isCurrentLocked && (
                    <>
                  {selectedSection === "speaking" && currentQuestion && (
                    <SpeakingTest
                      key={currentQuestion.id}
                      question={currentQuestion as any}
                      questionIndex={currentQuestionIndex}
                      totalQuestions={currentQuestions.length}
                      onComplete={(score, text, duration, audioPath) => handleComplete(score, text, duration, audioPath)}
                      onNext={handleNext}
                      onPrevious={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    />
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
                    </>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Floating Question Panel Toggle Button */}
        {selectedType && currentView === 'practice' && (
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
