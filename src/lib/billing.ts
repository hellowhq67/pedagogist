import { supabase } from "@/integrations/supabase/client";

async function billingRequest<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Please sign in to manage billing.");

  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Billing request failed.");
  return result as T;
}

export async function createCheckout(plan: "pro" | "premium") {
  return billingRequest<{ url: string }>("/api/stripe/checkout", { plan });
}

export async function verifyCheckout(sessionId: string) {
  return billingRequest<{ verified: boolean; tier: string; status: string }>("/api/stripe/verify-checkout", { sessionId });
}

export async function createBillingPortal() {
  return billingRequest<{ url: string }>("/api/stripe/portal", {});
}
