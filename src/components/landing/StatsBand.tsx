import { motion } from "framer-motion";
import { Users, Trophy, Target, Globe } from "lucide-react";

const stats = [
  { value: "50K+", label: "Active Students", icon: Users },
  { value: "1.2M", label: "Tests Scored", icon: Target },
  { value: "89/90", label: "Highest Score", icon: Trophy },
  { value: "120+", label: "Countries", icon: Globe },
];

export function StatsBand() {
  return (
    <section className="relative py-20 border-y border-border/50 bg-gradient-to-b from-background via-card/30 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-3">
                <s.icon className="h-6 w-6" />
              </div>
              <div className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                {s.value}
              </div>
              <div className="mt-1 text-sm uppercase tracking-widest text-muted-foreground">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
