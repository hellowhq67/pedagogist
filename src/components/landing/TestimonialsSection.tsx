import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";

const testimonials = [
  {
    name: "Aisha Rahman",
    role: "Software Engineer",
    score: "85/90",
    country: "🇧🇩 Bangladesh",
    quote:
      "From 65 to 85 in six weeks. The AI pronunciation feedback caught issues my human tutor missed.",
  },
  {
    name: "Diego Martínez",
    role: "MBA Applicant",
    score: "82/90",
    country: "🇲🇽 Mexico",
    quote:
      "The mock test interface is identical to the real exam. Walked in knowing exactly what to expect.",
  },
  {
    name: "Priya Sharma",
    role: "Migration Visa",
    score: "79/90",
    country: "🇮🇳 India",
    quote:
      "Personalized study plan saved me hundreds of hours. Instant scoring means instant improvement.",
  },
  {
    name: "Chen Wei",
    role: "PhD Candidate",
    score: "88/90",
    country: "🇨🇳 China",
    quote:
      "Best PTE prep platform I've used. The detailed trait breakdown is more accurate than Pearson's own scored practice.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Loved by{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              high scorers
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Students from 120+ countries trust PedagogistsPTE to hit their target score.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="relative h-full p-6 bg-card/60 backdrop-blur-md border-border/50 hover:border-primary/40 transition-all group">
                <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/10 group-hover:text-primary/30 transition-colors" />
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed mb-6 min-h-[6rem]">
                  "{t.quote}"
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-border/40">
                  <div>
                    <div className="font-semibold text-sm text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t.country}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Score</div>
                    <div className="text-lg font-black text-primary">{t.score}</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
