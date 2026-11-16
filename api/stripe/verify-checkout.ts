import type { ApiRequest, ApiResponse } from "../../src/server/stripe-billing";
import { getAdminClient, getUserId, getStripe, readJsonBody, sendError, tierForPlan } from "../../src/server/stripe-billing";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") return sendError(res, 405, "Method not allowed");
  try {
    const stripe = getStripe();
    const userId = await getUserId(req);
    if (!userId) return sendError(res, 401, "Sign in to verify your purchase");

    const { sessionId } = readJsonBody(req);
    if (typeof sessionId !== "string" || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
      return sendError(res, 400, "Invalid checkout session");
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["subscription"] });
    if (session.client_reference_id !== userId || session.metadata?.user_id !== userId) {
      return sendError(res, 403, "This checkout session belongs to another account");
    }
    if (session.status !== "complete" || session.mode !== "subscription") {
      return sendError(res, 409, "Checkout has not been completed");
    }

    const subscription = typeof session.subscription === "string"
      ? await stripe.subscriptions.retrieve(session.subscription)
      : session.subscription;
    if (!subscription || !["active", "trialing"].includes(subscription.status)) {
      return sendError(res, 409, "Your subscription is not active yet");
    }

    const plan = tierForPlan(session.metadata?.plan ?? "");
    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
    if (!plan || !customerId) return sendError(res, 400, "Checkout subscription details are incomplete");

    const admin = getAdminClient();
    const { error } = await admin.from("subscriptions").upsert({
      user_id: userId,
      tier: plan.tier,
      status: subscription.status,
      credits_remaining: plan.credits,
      daily_credits_used: 0,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    if (error) throw error;

    return res.status(200).json({ verified: true, tier: plan.tier, status: subscription.status });
  } catch (error) {
    console.error("Stripe checkout verification failed", error);
    return sendError(res, 500, "Unable to verify the checkout session");
  }
}
