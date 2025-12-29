import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SpeakingAttempt, useUserHistory } from "@/hooks/useUserHistory";
import { getTestTypeInfo } from "@/data/speakingQuestions";
import { TestType } from "@/lib/scoring";
import { format } from "date-fns";
import { TrendingUp, Clock, Target, Loader2 } from "lucide-react";

interface HistoryPanelProps {
  onSelectAttempt?: (attempt: SpeakingAttempt) => void;
}

export function HistoryPanel({ onSelectAttempt }: HistoryPanelProps) {
  const { attempts, isLoading, error, getAverageScore, getRecentAttempts } = useUserHistory();

  const recentAttempts = getRecentAttempts(20);
  const averageScore = getAverageScore();

  const getScoreColor = (score: number) => {
    if (score >= 79) return "text-green-600 bg-green-100";
    if (score >= 65) return "text-blue-600 bg-blue-100";
    if (score >= 50) return "text-yellow-600 bg-yellow-100";
    if (score >= 35) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 79) return "Excellent";
    if (score >= 65) return "Very Good";
    if (score >= 50) return "Good";
    if (score >= 35) return "Fair";
    return "Needs Work";
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-center">{error}</p>
      </Card>
    );
  }

  if (attempts.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Target className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No Practice History</h3>
          <p className="text-muted-foreground text-sm">
            Start practicing to track your progress and see your scores here.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <Target className="h-5 w-5 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">{averageScore}</p>
          <p className="text-xs text-muted-foreground">Avg Score</p>
        </Card>
        <Card className="p-4 text-center">
          <TrendingUp className="h-5 w-5 mx-auto mb-2 text-green-600" />
          <p className="text-2xl font-bold">{attempts.length}</p>
          <p className="text-xs text-muted-foreground">Total Attempts</p>
        </Card>
        <Card className="p-4 text-center">
          <Clock className="h-5 w-5 mx-auto mb-2 text-blue-600" />
          <p className="text-2xl font-bold">
            {Math.round(attempts.reduce((sum, a) => sum + (a.duration_seconds || 0), 0) / 60)}m
          </p>
          <p className="text-xs text-muted-foreground">Practice Time</p>
        </Card>
      </div>

      {/* Recent Attempts */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Recent Attempts</h3>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {recentAttempts.map((attempt) => {
              const typeInfo = getTestTypeInfo(attempt.test_type as TestType);
              return (
                <div
                  key={attempt.id}
                  className="p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onSelectAttempt?.(attempt)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{typeInfo.icon}</span>
                        <span className="font-medium text-sm truncate">
                          {typeInfo.name}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(attempt.created_at), "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getScoreColor(attempt.overall_score)}>
                        {attempt.overall_score}/90
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getScoreLabel(attempt.overall_score)}
                      </p>
                    </div>
                  </div>

                  {/* Score breakdown */}
                  <div className="flex gap-2 mt-2">
                    <div className="flex-1 text-center p-1.5 rounded bg-muted/50">
                      <p className="text-xs text-muted-foreground">Content</p>
                      <p className="text-sm font-semibold">{attempt.content_score}</p>
                    </div>
                    <div className="flex-1 text-center p-1.5 rounded bg-muted/50">
                      <p className="text-xs text-muted-foreground">Fluency</p>
                      <p className="text-sm font-semibold">{attempt.fluency_score}</p>
                    </div>
                    <div className="flex-1 text-center p-1.5 rounded bg-muted/50">
                      <p className="text-xs text-muted-foreground">Pronunciation</p>
                      <p className="text-sm font-semibold">{attempt.pronunciation_score}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
