import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
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
  Loader2
} from 'lucide-react';
import logo from '@/assets/logo.png';

const modules = [
  {
    id: 'speaking',
    title: 'Speaking',
    icon: Mic,
    description: 'Practice pronunciation and fluency',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    progress: 45,
    questionsCompleted: 23,
    totalQuestions: 50,
  },
  {
    id: 'writing',
    title: 'Writing',
    icon: PenTool,
    description: 'Essays and summaries',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    progress: 30,
    questionsCompleted: 12,
    totalQuestions: 40,
  },
  {
    id: 'reading',
    title: 'Reading',
    icon: BookOpen,
    description: 'Comprehension and vocabulary',
    color: 'text-success',
    bgColor: 'bg-success/10',
    progress: 60,
    questionsCompleted: 36,
    totalQuestions: 60,
  },
  {
    id: 'listening',
    title: 'Listening',
    icon: Headphones,
    description: 'Audio comprehension skills',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    progress: 25,
    questionsCompleted: 15,
    totalQuestions: 60,
  },
];

const stats = [
  { label: 'Questions Done', value: '86', icon: Target },
  { label: 'Practice Time', value: '12h 30m', icon: Clock },
  { label: 'Current Streak', value: '7 days', icon: Trophy },
  { label: 'Avg. Score', value: '72%', icon: BarChart3 },
];

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Signed out',
      description: 'You have been successfully signed out.',
    });
    navigate('/');
  };

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
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user.user_metadata?.display_name || user.email?.split('@')[0]} 👋
          </h1>
          <p className="text-muted-foreground">
            Continue your PTE practice journey. You're doing great!
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border/50 bg-card/50 backdrop-blur-sm">
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
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Module Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-4">Practice Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((module) => (
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
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground font-medium">{module.progress}%</span>
                    </div>
                    <Progress value={module.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {module.questionsCompleted} of {module.totalQuestions} questions completed
                    </p>
                  </div>
                  <Button className="w-full mt-4" variant="secondary">
                    Continue Practice
                  </Button>
                </CardContent>
              </Card>
            ))}
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
              Start Mock Test
            </Button>
            <Button size="lg" variant="outline">
              View Analytics
            </Button>
            <Button size="lg" variant="outline">
              Study Plan
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
