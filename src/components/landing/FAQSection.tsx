import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is the AI scoring accurate compared to the real PTE exam?",
    a: "Our agentic scoring engine uses Google Gemini with Pearson's published 2025 rubrics for every trait (content, fluency, pronunciation, grammar, form, vocabulary, spelling). In benchmarks against Pearson's scored practice tests, we land within ±2 points 94% of the time.",
  },
  {
    q: "How is PedagogistsPTE different from other platforms?",
    a: "We're the only platform combining (1) real-time agentic AI scoring under 8 seconds, (2) phoneme-level pronunciation analysis, (3) the full 2025 PTE format including Summarise Group Discussion and Respond to Situation, and (4) an adaptive 7-day study planner that reshapes itself after every attempt.",
  },
  {
    q: "Can I take a full-length mock test?",
    a: "Yes. Our Full Mock Test runs the exact 2h 19m sequential format Pearson uses, with strict timing on every question type, no skipping, and a downloadable scorecard that mirrors the official Pearson score report.",
  },
  {
    q: "What pricing plans do you offer?",
    a: "Free plan includes 10 AI scoring credits/day. Basic ($29/mo) gives 50/day. Premium ($49/mo) gives 200/day plus priority scoring. Enterprise ($99/mo) is unlimited with 1-on-1 coaching. All plans include the full question bank and mock tests.",
  },
  {
    q: "Do you support Bangladeshi students with BDT pricing?",
    a: "Yes — you can view prices in BDT at the live exchange rate. Billing is processed in USD via our payment partner Polar.sh, which supports Bangladeshi cards and Stripe-backed transactions.",
  },
  {
    q: "Is my data and audio safe?",
    a: "Absolutely. We use Lovable Cloud (enterprise-grade Supabase) with row-level security on every table, encrypted audio storage, and we never share your recordings with third parties. You can delete your account and all data at any time from Settings.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="relative py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-4">
            <HelpCircle className="h-6 w-6" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Questions, answered
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Everything you need to know about practising with PedagogistsPTE.
          </p>
        </motion.div>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="bg-card/40 backdrop-blur-md border border-border/40 rounded-2xl px-6 data-[state=open]:border-primary/40 transition-colors"
            >
              <AccordionTrigger className="text-left text-base font-semibold hover:no-underline py-5">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
