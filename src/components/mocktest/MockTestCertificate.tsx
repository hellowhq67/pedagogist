import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Award, Download, Share2, Home, 
  Mic, BookOpen, Headphones, FileText,
  CheckCircle, Star
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MockTestCertificateProps {
  scores: {
    speaking: number;
    writing: number;
    reading: number;
    listening: number;
    overall: number;
    totalAnswered: number;
    totalQuestions: number;
    timeUsed: number;
  };
  userName: string;
  testDate: Date;
  onClose: () => void;
}

export function MockTestCertificate({
  scores,
  userName,
  testDate,
  onClose
}: MockTestCertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 79) return "text-success";
    if (score >= 65) return "text-primary";
    if (score >= 50) return "text-warning";
    return "text-destructive";
  };

  const getScoreLevel = (score: number) => {
    if (score >= 85) return "Expert";
    if (score >= 79) return "Advanced";
    if (score >= 65) return "Proficient";
    if (score >= 50) return "Intermediate";
    if (score >= 35) return "Basic";
    return "Beginner";
  };

  const handleDownload = () => {
    // In a real app, this would generate a PDF
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My PTE Mock Test Results',
        text: `I scored ${scores.overall} in my PTE Mock Test! Speaking: ${scores.speaking}, Writing: ${scores.writing}, Reading: ${scores.reading}, Listening: ${scores.listening}`,
        url: window.location.href
      });
    }
  };

  const skillScores = [
    { name: "Speaking", score: scores.speaking, icon: Mic, color: "from-orange-500 to-orange-600" },
    { name: "Writing", score: scores.writing, icon: FileText, color: "from-blue-500 to-blue-600" },
    { name: "Reading", score: scores.reading, icon: BookOpen, color: "from-green-500 to-green-600" },
    { name: "Listening", score: scores.listening, icon: Headphones, color: "from-purple-500 to-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Action buttons */}
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={onClose}>
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download Certificate
            </Button>
          </div>
        </div>

        {/* Certificate */}
        <Card 
          ref={certificateRef}
          className="p-8 md:p-12 bg-gradient-to-br from-card to-card/80 border-2 relative overflow-hidden print:shadow-none"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary" />
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
          
          {/* Header */}
          <div className="text-center mb-8 relative">
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                <Award className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold font-display bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Certificate of Completion
            </h1>
            <p className="text-muted-foreground mt-2">PTE Academic Mock Test</p>
          </div>

          {/* Recipient */}
          <div className="text-center mb-8">
            <p className="text-muted-foreground">This certifies that</p>
            <h2 className="text-2xl md:text-3xl font-bold mt-2 capitalize">{userName}</h2>
            <p className="text-muted-foreground mt-2">
              has successfully completed the PTE Academic Mock Test on
            </p>
            <p className="font-medium text-lg">{formatDate(testDate)}</p>
          </div>

          {/* Overall Score */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-40 h-40 rounded-full border-8 border-primary/20 flex items-center justify-center">
                <div className="text-center">
                  <p className={cn("text-5xl font-bold", getScoreColor(scores.overall))}>
                    {scores.overall}
                  </p>
                  <p className="text-sm text-muted-foreground">Overall Score</p>
                </div>
              </div>
              <Badge 
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-white px-4"
              >
                {getScoreLevel(scores.overall)}
              </Badge>
            </div>
          </div>

          {/* Skill Scores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {skillScores.map((skill) => (
              <Card key={skill.name} className="p-4 text-center bg-muted/30">
                <div className={cn(
                  "w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white bg-gradient-to-br",
                  skill.color
                )}>
                  <skill.icon className="h-6 w-6" />
                </div>
                <p className={cn("text-2xl font-bold", getScoreColor(skill.score))}>
                  {skill.score}
                </p>
                <p className="text-sm text-muted-foreground">{skill.name}</p>
              </Card>
            ))}
          </div>

          {/* Test Details */}
          <div className="grid grid-cols-3 gap-4 text-center mb-8">
            <div>
              <p className="text-2xl font-bold">{scores.totalAnswered}</p>
              <p className="text-sm text-muted-foreground">Questions Answered</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{scores.totalQuestions}</p>
              <p className="text-sm text-muted-foreground">Total Questions</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{formatTime(scores.timeUsed)}</p>
              <p className="text-sm text-muted-foreground">Time Used</p>
            </div>
          </div>

          {/* Performance Summary */}
          <Card className="p-4 bg-muted/30 mb-8">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Star className="h-5 w-5 text-warning" />
              Performance Summary
            </h3>
            <div className="space-y-2 text-sm">
              {scores.overall >= 79 && (
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-4 w-4" />
                  <span>Excellent! You've achieved a score suitable for most university admissions.</span>
                </div>
              )}
              {scores.overall >= 65 && scores.overall < 79 && (
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle className="h-4 w-4" />
                  <span>Great progress! You're approaching the target score for many institutions.</span>
                </div>
              )}
              {scores.overall < 65 && (
                <div className="flex items-center gap-2 text-warning">
                  <CheckCircle className="h-4 w-4" />
                  <span>Keep practicing! Focus on your weaker areas to improve your overall score.</span>
                </div>
              )}
              
              {/* Identify strongest and weakest skills */}
              {(() => {
                const sorted = [...skillScores].sort((a, b) => b.score - a.score);
                const strongest = sorted[0];
                const weakest = sorted[sorted.length - 1];
                
                return (
                  <>
                    <p className="text-muted-foreground mt-2">
                      <strong>Strongest skill:</strong> {strongest.name} ({strongest.score})
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Focus area:</strong> {weakest.name} ({weakest.score})
                    </p>
                  </>
                );
              })()}
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground border-t pt-6">
            <p>This is an unofficial practice test certificate.</p>
            <p className="mt-1">
              Certificate ID: MOCK-{testDate.getTime().toString(36).toUpperCase()}
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Award className="h-4 w-4 text-white" />
              </div>
              <span className="font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                PedagogistsPTE
              </span>
            </div>
          </div>
        </Card>

        {/* Recommendations */}
        <Card className="mt-6 p-6">
          <h3 className="font-semibold text-lg mb-4">Next Steps</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={onClose}>
              <BookOpen className="h-6 w-6" />
              <span>Practice More</span>
              <span className="text-xs text-muted-foreground">Focus on weak areas</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span>View Study Plan</span>
              <span className="text-xs text-muted-foreground">Personalized recommendations</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Award className="h-6 w-6" />
              <span>Take Another Test</span>
              <span className="text-xs text-muted-foreground">Track your progress</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}