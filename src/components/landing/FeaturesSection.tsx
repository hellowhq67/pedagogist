import { motion } from 'framer-motion';
import { 
  Mic, 
  PenTool, 
  BookOpen, 
  Headphones, 
  Brain, 
  BarChart3, 
  Clock, 
  Target 
} from 'lucide-react';

const features = [
  {
    icon: Mic,
    title: 'Speaking AI',
    description: 'Real-time pronunciation and fluency scoring with instant feedback',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: PenTool,
    title: 'Writing Analysis',
    description: 'Grammar, vocabulary, and structure evaluation with suggestions',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  {
    icon: BookOpen,
    title: 'Reading Practice',
    description: 'Adaptive questions with detailed explanations for each answer',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    icon: Headphones,
    title: 'Listening Drills',
    description: 'Authentic audio with varying accents and speeds',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  {
    icon: Brain,
    title: 'AI-Powered Scoring',
    description: 'Human-calibrated AI matches official PTE scoring',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/10',
  },
  {
    icon: BarChart3,
    title: 'Progress Analytics',
    description: 'Track your improvement with detailed performance charts',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
  },
  {
    icon: Clock,
    title: 'Timed Practice',
    description: 'Real exam conditions with accurate time limits',
    color: 'text-rose-400',
    bgColor: 'bg-rose-400/10',
  },
  {
    icon: Target,
    title: 'Personalized Path',
    description: 'AI-generated study plan based on your weaknesses',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/5 to-background" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools designed to maximize your PTE score with AI precision
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)]"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
