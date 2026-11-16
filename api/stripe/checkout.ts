import type { ApiRequest, ApiResponse } from "../../src/server/stripe-billing";
import { getAdminClient, getOrigin, getUserId, getStripe, PLAN_CATALOG, readJsonBody, sendError } from "../../src/server/stripe-billing";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") return sendError(res, 405, "Method not allowed");
  try {
    const stripe = getStripe();
    const userId = await getUserId(req);
    if (!userId) return sendError(res, 401, "Sign in to continue");

    const { plan } = readJsonBody(req);
    const selectedPlan = typeof plan === "string" ? PLAN_CATALOG[plan as keyof typeof PLAN_CATALOG] : null;
    if (!selectedPlan) return sendError(res, 400, "Choose a valid subscription plan");

    const idempotencyKey = req.headers["idempotency-key"];
    if (typeof idempotencyKey !== "string" || !/^[a-zA-Z0-9_-]{16,128}$/.test(idempotencyKey)) {
      return sendError(res, 400, "A valid idempotency key is required");
    }

    const admin = getAdminClient();
    const { data: existing } = await admin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle();
    const origin = getOrigin(req);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{
        price_data: {
          currency: "usd",
          unit_amount: selectedPlan.amount,
          recurring: { interval: "month" },
          product_data: { name: selectedPlan.name },
        },
        quantity: 1,
      }],
      ...(existing?.stripe_customer_id ? { customer: existing.stripe_customer_id } : {}),
      ...(existing?.stripe_customer_id ? {} : { customer_creation: "always" as const }),
      client_reference_id: userId,
      metadata: { user_id: userId, plan: plan as string },
      subscription_data: { metadata: { user_id: userId, plan: plan as string } },
      success_url: `${origin}/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing?checkout=cancelled`,
      allow_promotion_codes: true,
    }, { idempotencyKey });

    if (!session.url) return sendError(res, 502, "Stripe did not return a checkout URL");
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout creation failed", error);
    return sendError(res, 500, "Unable to start checkout right now");
  }
}
