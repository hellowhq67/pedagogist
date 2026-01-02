import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Target, 
  Clock, 
  Sparkles, 
  BookOpen, 
  Mic, 
  PenTool, 
  Headphones,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { format, differenceInDays, addDays } from "date-fns";

interface ExamGoal {
  id: string;
  exam_date: string;
  target_overall_score: number | null;
  target_speaking_score: number | null;
  target_writing_score: number | null;
  target_reading_score: number | null;
  target_listening_score: number | null;
  hours_per_day: number | null;
  study_days_per_week: number | null;
}

interface StudySchedule {
  id: string;
  scheduled_date: string;
  skill_type: string;
  question_types: string[];
  target_questions: number;
  completed_questions: number;
  is_completed: boolean;
}

interface UserProgress {
  skill_type: string;
  average_score: number | null;
  attempt_count: number;
}

const skillIcons = {
  speaking: Mic,
  writing: PenTool,
  reading: BookOpen,
  listening: Headphones,
};

const skillColors = {
  speaking: "text-primary",
  writing: "text-accent",
  reading: "text-emerald-500",
  listening: "text-blue-500",
};

export function StudyPlanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [examGoal, setExamGoal] = useState<ExamGoal | null>(null);
  const [todaySchedule, setTodaySchedule] = useState<StudySchedule[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 });
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [examDate, setExamDate] = useState("");
  const [targetScore, setTargetScore] = useState([79]);
  const [hoursPerDay, setHoursPerDay] = useState([2]);
  const [studyDaysPerWeek, setStudyDaysPerWeek] = useState([5]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (!examGoal?.exam_date) return;

    const timer = setInterval(() => {
      const now = new Date();
      const examDateTime = new Date(examGoal.exam_date);
      const diff = examDateTime.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setCountdown({ days, hours, minutes });
    }, 1000);

    return () => clearInterval(timer);
  }, [examGoal?.exam_date]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch exam goal
      const { data: goal } = await supabase
        .from('exam_goals')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (goal) {
        setExamGoal(goal);
        setExamDate(goal.exam_date);
        setTargetScore([goal.target_overall_score || 79]);
        setHoursPerDay([goal.hours_per_day || 2]);
        setStudyDaysPerWeek([goal.study_days_per_week || 5]);
      }

      // Fetch today's schedule
      const today = new Date().toISOString().split('T')[0];
      const { data: schedule } = await supabase
        .from('study_schedules')
        .select('*')
        .eq('user_id', user.id)
        .eq('scheduled_date', today);
      
      if (schedule) {
        setTodaySchedule(schedule);
      }

      // Fetch user progress
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (progress) {
        setUserProgress(progress);
      }
    } catch (error) {
      console.error('Error fetching study data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveExamGoal = async () => {
    if (!user || !examDate) {
      toast({
        title: "Missing information",
        description: "Please set an exam date.",
        variant: "destructive",
      });
      return;
    }

    try {
      const goalData = {
        user_id: user.id,
        exam_date: examDate,
        target_overall_score: targetScore[0],
        hours_per_day: hoursPerDay[0],
        study_days_per_week: studyDaysPerWeek[0],
      };

      if (examGoal?.id) {
        await supabase
          .from('exam_goals')
          .update(goalData)
          .eq('id', examGoal.id);
      } else {
        await supabase
          .from('exam_goals')
          .insert(goalData);
      }

      toast({
        title: "Goal saved!",
        description: "Your exam goal has been updated.",
      });

      setIsEditingGoal(false);
      fetchData();
      generateStudyPlan();
    } catch (error) {
      console.error('Error saving goal:', error);
      toast({
        title: "Error",
        description: "Failed to save goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateStudyPlan = async () => {
    if (!user || !examDate) return;

    const daysUntilExam = differenceInDays(new Date(examDate), new Date());
    if (daysUntilExam <= 0) return;

    // Analyze weak areas from progress
    const weakAreas = getWeakAreas();
    
    // Generate schedule for next 7 days
    const schedules: Partial<StudySchedule>[] = [];
    
    for (let i = 0; i < 7 && i < daysUntilExam; i++) {
      const date = format(addDays(new Date(), i), 'yyyy-MM-dd');
      
      // Prioritize weak areas
      const skillIndex = i % weakAreas.length;
      const skill = weakAreas[skillIndex] || 'speaking';
      
      schedules.push({
        scheduled_date: date,
        skill_type: skill,
        question_types: getQuestionTypesForSkill(skill),
        target_questions: Math.ceil(hoursPerDay[0] * 5), // ~5 questions per hour
        completed_questions: 0,
        is_completed: false,
      });
    }

    // Delete existing schedules and insert new ones
    await supabase
      .from('study_schedules')
      .delete()
      .eq('user_id', user.id)
      .gte('scheduled_date', format(new Date(), 'yyyy-MM-dd'));

    for (const schedule of schedules) {
      await supabase
        .from('study_schedules')
        .insert({
          user_id: user.id,
          scheduled_date: schedule.scheduled_date!,
          skill_type: schedule.skill_type!,
          question_types: schedule.question_types!,
          target_questions: schedule.target_questions,
          completed_questions: schedule.completed_questions,
          is_completed: schedule.is_completed,
        });
    }

    fetchData();
  };

  const getWeakAreas = (): string[] => {
    const scores: { skill: string; score: number }[] = [
      { skill: 'speaking', score: userProgress.find(p => p.skill_type === 'speaking')?.average_score || 0 },
      { skill: 'writing', score: userProgress.find(p => p.skill_type === 'writing')?.average_score || 0 },
      { skill: 'reading', score: userProgress.find(p => p.skill_type === 'reading')?.average_score || 0 },
      { skill: 'listening', score: userProgress.find(p => p.skill_type === 'listening')?.average_score || 0 },
    ];

    // Sort by score (lowest first = weakest)
    scores.sort((a, b) => a.score - b.score);
    return scores.map(s => s.skill);
  };

  const getQuestionTypesForSkill = (skill: string): string[] => {
    const types: Record<string, string[]> = {
      speaking: ['read-aloud', 'repeat-sentence', 'describe-image', 'retell-lecture'],
      writing: ['summarize-written-text', 'write-essay'],
      reading: ['mc-single', 'mc-multiple', 'reorder-paragraphs', 'fill-blanks-drag'],
      listening: ['highlight-correct-summary', 'mc-single-listening', 'fill-blanks-listening', 'write-from-dictation'],
    };
    return types[skill] || [];
  };

  const getProgressPercentage = (skill: string): number => {
    const progress = userProgress.find(p => p.skill_type === skill);
    return progress?.average_score || 0;
  };

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-24 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Exam Countdown Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-border/50 bg-gradient-to-br from-primary/5 via-card to-accent/5 overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Exam Countdown
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsEditingGoal(!isEditingGoal)}
              >
                {isEditingGoal ? "Cancel" : "Edit Goal"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isEditingGoal ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="examDate">Exam Date</Label>
                  <Input
                    id="examDate"
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Target Score: {targetScore[0]}</Label>
                  <Slider
                    value={targetScore}
                    onValueChange={setTargetScore}
                    min={10}
                    max={90}
                    step={1}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label>Study Hours Per Day: {hoursPerDay[0]}</Label>
                  <Slider
                    value={hoursPerDay}
                    onValueChange={setHoursPerDay}
                    min={0.5}
                    max={8}
                    step={0.5}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label>Study Days Per Week: {studyDaysPerWeek[0]}</Label>
                  <Slider
                    value={studyDaysPerWeek}
                    onValueChange={setStudyDaysPerWeek}
                    min={1}
                    max={7}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <Button onClick={saveExamGoal} className="w-full">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Save & Generate Study Plan
                </Button>
              </div>
            ) : examGoal ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <p className="text-3xl font-bold text-primary">{countdown.days}</p>
                    <p className="text-xs text-muted-foreground">Days</p>
                  </div>
                  <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                    <p className="text-3xl font-bold text-accent">{countdown.hours}</p>
                    <p className="text-xs text-muted-foreground">Hours</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <p className="text-3xl font-bold text-foreground">{countdown.minutes}</p>
                    <p className="text-xs text-muted-foreground">Mins</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span>Target: {examGoal.target_overall_score}/90</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{examGoal.hours_per_day}h/day, {examGoal.study_days_per_week} days/week</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No exam goal set yet</p>
                <Button onClick={() => setIsEditingGoal(true)}>
                  <Target className="w-4 h-4 mr-2" />
                  Set Exam Goal
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily Study Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Today's Study Plan
            </CardTitle>
            <CardDescription>
              Personalized based on your weak areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todaySchedule.length > 0 ? (
              <div className="space-y-4">
                {todaySchedule.map((schedule) => {
                  const Icon = skillIcons[schedule.skill_type as keyof typeof skillIcons] || BookOpen;
                  const color = skillColors[schedule.skill_type as keyof typeof skillColors] || "text-primary";
                  const progress = (schedule.completed_questions / schedule.target_questions) * 100;
                  
                  return (
                    <div key={schedule.id} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${color}`} />
                          </div>
                          <div>
                            <p className="font-medium capitalize">{schedule.skill_type}</p>
                            <p className="text-xs text-muted-foreground">
                              {schedule.question_types.slice(0, 2).join(', ')}
                            </p>
                          </div>
                        </div>
                        {schedule.is_completed ? (
                          <Badge variant="outline" className="border-emerald-500 text-emerald-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Complete
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            {schedule.completed_questions}/{schedule.target_questions}
                          </Badge>
                        )}
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No study plan for today</p>
                {examGoal && (
                  <Button onClick={generateStudyPlan} variant="outline">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Study Plan
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Skill Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Skill Progress
            </CardTitle>
            <CardDescription>
              Focus on your weakest areas for maximum improvement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {(['speaking', 'writing', 'reading', 'listening'] as const).map((skill) => {
                const Icon = skillIcons[skill];
                const color = skillColors[skill];
                const progress = getProgressPercentage(skill);
                const isWeak = progress < 50;
                
                return (
                  <div 
                    key={skill} 
                    className={`p-4 rounded-lg border transition-colors ${
                      isWeak 
                        ? 'bg-amber-500/5 border-amber-500/20' 
                        : 'bg-muted/30 border-border/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span className="font-medium capitalize text-sm">{skill}</span>
                      {isWeak && (
                        <Badge variant="outline" className="text-xs border-amber-500 text-amber-500">
                          Focus Area
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold">{Math.round(progress)}</span>
                      <span className="text-sm text-muted-foreground">/90</span>
                    </div>
                    <Progress value={(progress / 90) * 100} className="h-1.5 mt-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
