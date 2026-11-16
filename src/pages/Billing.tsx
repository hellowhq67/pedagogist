import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, CreditCard, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { useUserData } from "@/contexts/UserDataContext";
import { createBillingPortal, createCheckout, verifyCheckout } from "@/lib/billing";

const plans = [
  { id: "pro" as const, title: "Pro", price: "$29", credits: "50 AI scoring credits per day", features: ["All 200 mock tests", "Unlimited practice", "Full test history", "Detailed analytics", "Priority support"] },
  { id: "premium" as const, title: "Premium", price: "$49", credits: "200 AI scoring credits per day", features: ["Everything in Pro", "Priority AI scoring", "Personalized study plans", "Teacher review access", "1-on-1 coaching sessions"] },
];

export default function Billing() {
  const { user, loading: authLoading } = useAuth();
  const { subscription, refresh } = useUserData();
  const { refresh: refreshCredits } = useCredits();
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const handled = useRef(false);
  const currentTier = subscription?.tier ?? "free";

  const verification = useQuery({
    queryKey: ["stripe-checkout-verification", user?.id, sessionId],
    queryFn: () => verifyCheckout(sessionId!),
    enabled: Boolean(user && sessionId),
    retry: false,
  });

  useEffect(() => {
    if (!sessionId || handled.current || verification.isPending) return;
    handled.current = true;
    if (verification.isSuccess) {
      toast.success("Your subscription is active", { description: "Your account has been upgraded." });
      void refresh();
      void refreshCredits();
    } else if (verification.isError) {
      toast.error(verification.error.message || "We could not verify your checkout.");
    }
    const next = new URLSearchParams(searchParams);
    next.delete("session_id");
    setSearchParams(next, { replace: true });
  }, [sessionId, verification.isPending, verification.isSuccess, verification.isError, verification.error, refresh, refreshCredits, searchParams, setSearchParams]);

  const checkout = useMutation({
    mutationFn: createCheckout,
    onSuccess: ({ url }) => { window.location.assign(url); },
    onError: (error: Error) => toast.error(error.message),
  });
  const portal = useMutation({
    mutationFn: createBillingPortal,
    onSuccess: ({ url }) => { window.location.assign(url); },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!authLoading && !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
        <Card className="w-full max-w-lg">
          <CardHeader><CardTitle>Sign in to manage billing</CardTitle><CardDescription>Your subscription and payment details are available after you sign in.</CardDescription></CardHeader>
          <CardContent><Button asChild><Link to="/auth?redirect=%2Fbilling">Continue to sign in</Link></Button></CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Button variant="ghost" asChild><Link to="/dashboard"><ArrowLeft data-icon="inline-start" />Dashboard</Link></Button>
          <Button variant="outline" asChild><Link to="/profile">Account profile</Link></Button>
        </div>

        <header className="mb-10 max-w-2xl">
          <Badge variant="secondary" className="mb-4 gap-2"><CreditCard />Secure billing</Badge>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Your plan, your progress.</h1>
          <p className="mt-4 text-muted-foreground">Manage your subscription and keep every practice session moving forward.</p>
        </header>

        {verification.isPending && <div className="mb-6 flex items-center gap-2 rounded-lg border bg-card p-4 text-sm"><Loader2 className="size-4 animate-spin" />Confirming your purchase with Stripe…</div>}
        {searchParams.get("checkout") === "cancelled" && <div className="mb-6 rounded-lg border bg-card p-4 text-sm text-muted-foreground">Checkout was canceled. You have not been charged.</div>}

        <Card className="mb-10 overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-card to-accent/10">
          <CardContent className="flex flex-col justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current plan</p>
              <div className="mt-2 flex items-center gap-3"><h2 className="font-display text-3xl font-bold capitalize">{currentTier}</h2><Badge variant={currentTier === "free" ? "secondary" : "default"}>{subscription?.status ?? "Free"}</Badge></div>
              <p className="mt-2 text-sm text-muted-foreground">{subscription?.credits_remaining ?? 0} scoring credits remaining</p>
              {subscription?.current_period_end && <p className="mt-1 text-sm text-muted-foreground">Renews or ends {new Date(subscription.current_period_end).toLocaleDateString()}</p>}
            </div>
            {subscription?.stripe_customer_id && <Button variant="outline" disabled={portal.isPending} onClick={() => portal.mutate()}>{portal.isPending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <CreditCard data-icon="inline-start" />}Manage subscription</Button>}
          </CardContent>
        </Card>

        <div className="mb-5 flex items-center gap-2"><Sparkles className="size-5 text-primary" /><h2 className="font-display text-2xl font-semibold">Choose your plan</h2></div>
        <div className="grid gap-5 md:grid-cols-2">
          {plans.map((plan) => {
            const isCurrent = currentTier === (plan.id === "pro" ? "basic" : "premium");
            return (
              <Card key={plan.id} className={`relative flex h-full flex-col ${plan.id === "pro" ? "border-primary shadow-lg" : "border-border"}`}>
                {plan.id === "pro" && <Badge className="absolute -top-3 left-6 gap-1"><Sparkles />Most popular</Badge>}
                <CardHeader className="pt-8">
                  <CardTitle className="font-display text-2xl">{plan.title}</CardTitle>
                  <CardDescription>{plan.credits}</CardDescription>
                  <div className="pt-2"><span className="font-display text-4xl font-bold">{plan.price}</span><span className="text-muted-foreground"> / month</span></div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <ul className="flex flex-1 flex-col gap-3 text-sm text-muted-foreground">
                    {plan.features.map((feature) => <li key={feature} className="flex items-center gap-3"><Check className="size-4 shrink-0 text-primary" /><span>{feature}</span></li>)}
                  </ul>
                  <Button className="mt-8 w-full" variant={plan.id === "pro" ? "default" : "outline"} disabled={isCurrent || checkout.isPending || authLoading || !user} onClick={() => checkout.mutate(plan.id)}>
                    {checkout.isPending && checkout.variables === plan.id ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <ShieldCheck data-icon="inline-start" />}
                    {isCurrent ? "Current plan" : `Continue with ${plan.title}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">Payments are securely processed by Stripe. Prices are billed monthly in USD.</p>
      </div>
    </main>
  );
}
