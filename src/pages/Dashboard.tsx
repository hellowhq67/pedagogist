import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
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
  Mic, 
  PenTool, 
  BookOpen, 
  Headphones, 
  LogOut, 
  Settings, 
  BarChart3,
  Target,
  Clock,
  Trophy,
  Loader2,
  TrendingUp,
  Calendar,
  Zap,
  Sparkles,
  Play,
  ArrowRight,
  Crown
} from 'lucide-react';
import logo from '@/assets/logo.png';

// Module definitions
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
    color: 'text-success',
    bgColor: 'bg-success/10',
    chartColor: 'hsl(var(--success))',
  },
  {
    id: 'listening',
    title: 'Listening',
    icon: Headphones,
    description: 'Audio comprehension skills',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    chartColor: 'hsl(var(--warning))',
  },
];

// Mock data for demo - in production, fetch from Supabase
const generateProgressData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, i) => ({
    day,
    speaking: Math.floor(50 + Math.random() * 30),
    writing: Math.floor(45 + Math.random() * 35),
    reading: Math.floor(55 + Math.random() * 25),
    listening: Math.floor(40 + Math.random() * 40),
  }));
};

const generateSkillsData = () => [
  { skill: 'Speaking', score: 72, fullMark: 90 },
  { skill: 'Writing', score: 68, fullMark: 90 },
  { skill: 'Reading', score: 78, fullMark: 90 },
  { skill: 'Listening', score: 65, fullMark: 90 },
  { skill: 'Vocab', score: 70, fullMark: 90 },
  { skill: 'Grammar', score: 75, fullMark: 90 },
];

const generateActivityData = () => [
  { name: 'Speaking', value: 45, fill: 'hsl(var(--primary))' },
  { name: 'Writing', value: 30, fill: 'hsl(var(--accent))' },
  { name: 'Reading', value: 60, fill: 'hsl(var(--success))' },
  { name: 'Listening', value: 25, fill: 'hsl(var(--warning))' },
];

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [progressData, setProgressData] = useState(generateProgressData());
  const [skillsData, setSkillsData] = useState(generateSkillsData());
  const [activityData, setActivityData] = useState(generateActivityData());
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to access the dashboard.',
        variant: 'destructive',
      });
      navigate('/auth');
    }
  }, [user, loading, navigate, toast]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch user progress
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user?.id);
      
      if (progress) {
        setUserProgress(progress);
        // Update activity data based on real progress
        const updatedActivity = modules.map((mod, i) => {
          const modProgress = progress.find(p => p.skill_type === mod.id);
          return {
            name: mod.title,
            value: modProgress?.attempt_count || Math.floor(Math.random() * 60 + 20),
            fill: mod.chartColor,
          };
        });
        setActivityData(updatedActivity);
      }

      // Fetch subscription
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (sub) {
        setSubscription(sub);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Signed out',
      description: 'You have been successfully signed out.',
    });
    navigate('/');
  };

  const stats = [
    { 
      label: 'Questions Done', 
      value: userProgress.reduce((acc, p) => acc + (p.attempt_count || 0), 0) || 86, 
      icon: Target,
      change: '+12 this week'
    },
    { 
      label: 'Practice Time', 
      value: `${Math.floor((userProgress.reduce((acc, p) => acc + (p.total_time_spent_ms || 0), 0) / 3600000) || 12)}h`, 
      icon: Clock,
      change: '+3h this week'
    },
    { 
      label: 'Current Streak', 
      value: '7 days', 
      icon: Trophy,
      change: 'Personal best!'
    },
    { 
      label: 'Avg. Score', 
      value: `${Math.floor(userProgress.reduce((acc, p) => acc + (p.average_score || 72), 0) / (userProgress.length || 1))}%`, 
      icon: BarChart3,
      change: '+5% improvement'
    },
  ];

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

  const currentTier = subscription?.tier || 'free';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="PedagogistsPTE" className="h-8 w-auto" />
              <span className="text-xl font-bold text-foreground hidden sm:block">
                PedagogistsPTE
              </span>
            </Link>

            <div className="flex items-center gap-4">
              {currentTier !== 'free' && (
                <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                  <Crown className="w-3 h-3 mr-1" />
                  {currentTier.toUpperCase()}
                </Badge>
              )}
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
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
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
            <div className="flex gap-3">
              <Button className="shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
                <Play className="w-4 h-4 mr-2" />
                Start Mock Test
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
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/30 overflow-hidden relative">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,hsl(var(--primary)/0.05)_50%,transparent_100%)] animate-shimmer" />
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
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
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
                <p className="text-xs text-success mt-2 flex items-center gap-1">
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
          className="mb-8"
        >
          <Tabs defaultValue="progress" className="space-y-4">
            <TabsList className="bg-card/50 border border-border/50">
              <TabsTrigger value="progress">Weekly Progress</TabsTrigger>
              <TabsTrigger value="skills">Skills Radar</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
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
                      <AreaChart data={progressData}>
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
                            <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorListening" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0}/>
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
                        <Area type="monotone" dataKey="reading" stroke="hsl(var(--success))" fillOpacity={1} fill="url(#colorReading)" />
                        <Area type="monotone" dataKey="listening" stroke="hsl(var(--warning))" fillOpacity={1} fill="url(#colorListening)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4 justify-center">
                    {modules.map((mod) => (
                      <div key={mod.id} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${mod.bgColor}`} style={{ backgroundColor: mod.chartColor }} />
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
                      <RadarChart data={skillsData}>
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
                  <CardDescription>Questions completed by module</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activityData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                        <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={80} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {activityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Module Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-4">Practice Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((module) => {
              const modProgress = userProgress.find(p => p.skill_type === module.id);
              const progress = modProgress?.average_score || Math.floor(Math.random() * 60 + 20);
              const attempts = modProgress?.attempt_count || Math.floor(Math.random() * 40 + 10);
              
              return (
                <Card
                  key={module.id}
                  className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 cursor-pointer group"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl ${module.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <module.icon className={`w-6 h-6 ${module.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-foreground">{module.title}</CardTitle>
                          <CardDescription>{module.description}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Average Score</span>
                        <span className="text-foreground font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {attempts} questions completed
                      </p>
                    </div>
                    <Button className="w-full mt-4" variant="secondary">
                      Continue Practice
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8"
        >
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
              <Play className="w-4 h-4 mr-2" />
              Start Mock Test
            </Button>
            <Button size="lg" variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Exam
            </Button>
            <Button size="lg" variant="outline">
              <Target className="w-4 h-4 mr-2" />
              Set Goals
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
