import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ChevronRight, 
  Play, 
  Clock, 
  FileText, 
  Crown,
  Star,
  Home,
  Settings,
  HelpCircle,
  LogOut,
  BookOpen,
  Mic,
  Headphones,
  PenTool,
  ChevronLeft,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { mockTestsList, sectionTests, questionTests, MockTestInfo } from "@/data/mockTestsBank";
import logo from "@/assets/logo.png";

export default function MockTestList() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"full" | "section" | "question">("full");
  const [testTypeTab, setTestTypeTab] = useState<"academic" | "core">("academic");

  const handleStartTest = (testId: string) => {
    navigate(`/mock-test?id=${testId}`);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-success/10 text-success border-success/20";
      case "medium":
        return "bg-warning/10 text-warning border-warning/20";
      case "hard":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const renderTestItem = (test: MockTestInfo) => (
    <motion.div
      key={test.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ x: 4 }}
      className="group"
    >
      <Card 
        className={cn(
          "p-4 cursor-pointer transition-all duration-200 border-border/50 hover:border-primary/30 hover:shadow-md",
          "bg-card hover:bg-accent/5"
        )}
        onClick={() => handleStartTest(test.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {test.type === "free" ? (
                <Badge variant="secondary" className="bg-success/10 text-success text-xs">
                  Free
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                  <Crown className="h-3 w-3 mr-1" />
                  VIP
                </Badge>
              )}
              {test.isNew && (
                <Badge variant="secondary" className="bg-accent/10 text-accent text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  New
                </Badge>
              )}
              <Badge variant="outline" className={cn("text-xs", getDifficultyColor(test.difficulty))}>
                {test.difficulty}
              </Badge>
            </div>
            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
              {test.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {test.description}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {test.duration} min
              </span>
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {test.totalQuestions} questions
              </span>
              {test.version && (
                <span className="text-primary/70">
                  {test.version}
                </span>
              )}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card/50 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <img src={logo} alt="PTE Practice" className="h-10 w-auto" />
            <div>
              <h1 className="font-bold text-lg text-foreground">PTE Practice</h1>
              <p className="text-xs text-muted-foreground">Academic & UKVI</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-medium">
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {user?.email?.split("@")[0] || "User"}
              </p>
              <Badge variant="secondary" className="text-xs">
                Free Plan
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            <li>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/dashboard")}
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
            </li>
            <li>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/dashboard")}
              >
                <BookOpen className="h-4 w-4" />
                Study Centre
              </Button>
            </li>
            <li>
              <Button 
                variant="default" 
                className="w-full justify-start gap-3"
              >
                <FileText className="h-4 w-4" />
                Mock Tests
              </Button>
            </li>
            <li>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              >
                <Mic className="h-4 w-4" />
                Speaking Practice
              </Button>
            </li>
            <li>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              >
                <PenTool className="h-4 w-4" />
                Writing Practice
              </Button>
            </li>
            <li>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              >
                <BookOpen className="h-4 w-4" />
                Reading Practice
              </Button>
            </li>
            <li>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              >
                <Headphones className="h-4 w-4" />
                Listening Practice
              </Button>
            </li>
          </ul>

          <div className="mt-8 pt-4 border-t">
            <ul className="space-y-1">
              <li>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </li>
              <li>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
                >
                  <Crown className="h-4 w-4 text-primary" />
                  VIP Centre
                </Button>
              </li>
              <li>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
                >
                  <HelpCircle className="h-4 w-4" />
                  Help (Q&A)
                </Button>
              </li>
              <li>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </Button>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {/* Header */}
        <header className="border-b bg-card/50 p-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/dashboard")}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-foreground">Mock Tests</h1>
          </div>
        </header>

        {/* Test Type Selector */}
        <div className="p-4 border-b bg-card/30">
          <div className="flex justify-center">
            <div className="inline-flex rounded-full bg-muted p-1">
              <Button
                variant={testTypeTab === "academic" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "rounded-full px-6",
                  testTypeTab === "academic" && "bg-primary text-primary-foreground"
                )}
                onClick={() => setTestTypeTab("academic")}
              >
                PTE Academic / UKVI
              </Button>
              <Button
                variant={testTypeTab === "core" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "rounded-full px-6",
                  testTypeTab === "core" && "bg-primary text-primary-foreground"
                )}
                onClick={() => setTestTypeTab("core")}
              >
                PTE Core
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="w-full justify-start bg-transparent border-b rounded-none p-0 h-auto">
              <TabsTrigger 
                value="full"
                className={cn(
                  "rounded-none border-b-2 border-transparent pb-3 pt-2 px-4",
                  "data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                )}
              >
                Full Tests
              </TabsTrigger>
              <TabsTrigger 
                value="section"
                className={cn(
                  "rounded-none border-b-2 border-transparent pb-3 pt-2 px-4",
                  "data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                )}
              >
                Section Tests
              </TabsTrigger>
              <TabsTrigger 
                value="question"
                className={cn(
                  "rounded-none border-b-2 border-transparent pb-3 pt-2 px-4",
                  "data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                )}
              >
                Question Tests
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[calc(100vh-280px)] mt-4">
              <TabsContent value="full" className="mt-0 space-y-3">
                {mockTestsList.map(renderTestItem)}
              </TabsContent>

              <TabsContent value="section" className="mt-0 space-y-3">
                {sectionTests.map(renderTestItem)}
              </TabsContent>

              <TabsContent value="question" className="mt-0 space-y-3">
                {questionTests.map(renderTestItem)}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Footer CTA */}
        <div className="absolute bottom-0 left-64 right-0 p-4 border-t bg-card/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Upgrade to VIP</p>
                <p className="text-sm text-muted-foreground">
                  Access all mock tests and premium features
                </p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
