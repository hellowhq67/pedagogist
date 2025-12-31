import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, Play, Shield, Zap } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background pt-20">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] animate-pulse" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--muted)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--muted)/0.1)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 rounded-full bg-secondary/50 backdrop-blur-md border border-border/30 text-secondary-foreground gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Next Gen AI PTE Scoring</span>
              <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
              <span className="text-xs opacity-70">v2.0</span>
            </Badge>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.1] text-foreground"
          >
            Master PTE with{' '}
            <span className="bg-gradient-to-r from-primary via-cyan-400 to-accent bg-clip-text text-transparent">
              Precision AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            The most advanced AI laboratory for PTE Academic. Get instant 1-to-1 scoring,
            personalized roadmap, and real exam conditions.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button asChild size="lg" className="h-14 px-8 text-base font-semibold shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-all hover:scale-105 active:scale-95">
              <Link to="/auth" className="flex items-center gap-2">
                Start Practicing Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-14 px-8 text-base font-semibold bg-background/50 backdrop-blur-md border-border/50 hover:bg-accent/20 transition-all">
              <Link to="/dashboard" className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Live Demo
              </Link>
            </Button>
          </motion.div>

          {/* Trust Ticker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60 hover:opacity-100 transition-all duration-500"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-5 h-5" />
              <span className="font-bold text-sm tracking-widest uppercase">Secure</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="w-5 h-5" />
              <span className="font-bold text-sm tracking-widest uppercase">Instant</span>
            </div>
            <div className="flex items-center gap-3 text-foreground">
              <span className="text-2xl font-bold">4.9/5</span>
              <span className="text-xs leading-tight text-left text-muted-foreground">Trusted by<br />25k+ Students</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Elements (Decorative) */}
      <div className="hidden lg:block">
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[25%] left-[10%] p-4 rounded-2xl glass border border-border/30 shadow-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-success" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Latest Score</div>
              <div className="text-lg font-black text-foreground">89 / 90</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[25%] right-[10%] p-4 rounded-2xl glass border border-border/30 shadow-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">AI Analysis</div>
              <div className="text-sm font-medium text-foreground">Pronunciation Fixed!</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
