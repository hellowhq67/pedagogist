import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles } from 'lucide-react';

type Tier = {
  name: string;
  price: string;
  period?: string;
  highlight?: boolean;
  features: string[];
  cta: string;
};

const TIERS: Tier[] = [
  {
    name: 'Free',
    price: '$0',
    period: '/forever',
    features: [
      '1 Free Mock Test',
      'Limited Practice Questions',
      '10 AI Scoring Credits/Day',
      'Basic Test History',
      '2 Section Tests per Type',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/mo',
    highlight: true,
    features: [
      'All 200 Mock Tests',
      'Unlimited Practice',
      'Unlimited AI Scoring',
      'Full Test History',
      'Detailed Analytics',
      'Priority Support',
    ],
    cta: 'Choose Pro',
  },
  {
    name: 'Premium',
    price: '$49',
    period: '/mo',
    features: [
      'Everything in Pro',
      'Priority AI Scoring',
      'Personalized Study Plans',
      'Teacher Review Access',
      '1-on-1 Coaching Sessions',
      'Score Guarantee',
    ],
    cta: 'Choose Premium',
  },
];

export function PricingSection() {
  const { user } = useAuth();
  const getCtaUrl = (name: string) => {
    if (name === 'Free') return user ? '/dashboard' : `/auth?redirect=${encodeURIComponent('/dashboard')}`;
    const billingPath = `/billing?plan=${name.toLowerCase()}`;
    return user ? billingPath : `/auth?redirect=${encodeURIComponent(billingPath)}`;
  };

  return (
    <section id="pricing" className="py-24 bg-muted/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Simple Pricing for{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Every Learner
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free. Upgrade anytime. Cancel whenever you want.
          </p>
          <ul aria-label="Plan benefits" className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Check className="size-4 text-primary" />Monthly billing</li>
            <li className="flex items-center gap-2"><Check className="size-4 text-primary" />Cancel anytime</li>
            <li className="flex items-center gap-2"><Check className="size-4 text-primary" />Secure Stripe checkout</li>
          </ul>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {TIERS.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className={`h-full relative transition-all duration-300 ${
                  tier.highlight
                    ? 'border-primary/50 shadow-xl shadow-primary/10 ring-1 ring-primary/20 md:-translate-y-2'
                    : 'border-border/50 hover:border-primary/30'
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1 gap-1">
                      <Sparkles className="w-3 h-3" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-foreground">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-5xl font-black text-foreground">{tier.price}</span>
                    {tier.period && (
                      <span className="text-muted-foreground text-lg">{tier.period}</span>
                    )}
                  </div>
                  <CardDescription className="mt-2">
                    {tier.name === 'Free' && 'Perfect to get started'}
                    {tier.name === 'Pro' && 'Best for serious learners'}
                    {tier.name === 'Premium' && 'For guaranteed results'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-4">
                  <ul className="flex-1 space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-success" />
                        </div>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    variant={tier.highlight ? 'default' : 'outline'}
                    className={`mt-auto w-full ${
                      tier.highlight
                        ? 'shadow-[0_0_20px_hsl(var(--primary)/0.3)]'
                        : 'border-border text-foreground hover:bg-muted'
                    }`}
                    size="lg"
                  >
                    <Link to={getCtaUrl(tier.name)}>{tier.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
