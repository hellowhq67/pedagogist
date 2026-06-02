import { motion } from "framer-motion";

const partners = [
  "Pearson Aligned",
  "Lovable Cloud",
  "Google Gemini",
  "Polar.sh",
  "Recharts",
  "Supabase",
];

export function PartnerLogos() {
  return (
    <section className="py-16 border-y border-border/30 bg-card/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs uppercase tracking-[0.3em] text-muted-foreground mb-8">
          Powered by enterprise-grade infrastructure
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60 hover:opacity-100 transition-opacity">
          {partners.map((p, i) => (
            <motion.div
              key={p}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="font-display text-lg md:text-xl font-bold text-foreground/80 tracking-tight"
            >
              {p}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
