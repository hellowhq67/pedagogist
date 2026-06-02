import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function VideoSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section id="demo" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-accent/10 rounded-full blur-[160px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <Badge variant="secondary" className="mb-4 gap-2 px-3 py-1 rounded-full">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs uppercase tracking-widest">Product Demo</span>
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            See PedagogistsPTE in action
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Watch how our AI scores a full speaking response in under 8 seconds — with
            phoneme-level pronunciation feedback.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-border/50 shadow-2xl shadow-primary/10 bg-card">
            {playing ? (
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0"
                title="PedagogistsPTE demo"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, hsl(220 70% 25% / 0.7), hsl(270 70% 30% / 0.7)), radial-gradient(circle at 30% 30%, hsl(187 85% 53% / 0.4), transparent 50%)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center group"
                  aria-label="Play demo video"
                >
                  <span className="relative flex items-center justify-center w-24 h-24 rounded-full bg-primary text-primary-foreground shadow-[0_0_60px_hsl(var(--primary)/0.5)] transition-transform group-hover:scale-110">
                    <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
                    <Play className="relative h-10 w-10 ml-1" fill="currentColor" />
                  </span>
                </button>
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white/90">
                  <div>
                    <div className="text-xs uppercase tracking-widest opacity-70">2 min walkthrough</div>
                    <div className="text-lg font-semibold">Speaking, Writing, Reading, Listening</div>
                  </div>
                  <div className="hidden md:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-white/10 backdrop-blur">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> LIVE
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-2xl opacity-60" />
        </motion.div>
      </div>
    </section>
  );
}
