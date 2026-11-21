import type { ApiRequest, ApiResponse } from "../../src/server/stripe-billing";
import { getAdminClient, getOrigin, getUserId, getStripe, sendError } from "../../src/server/stripe-billing";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") return sendError(res, 405, "Method not allowed");
  try {
    const stripe = getStripe();
    const userId = await getUserId(req);
    if (!userId) return sendError(res, 401, "Sign in to manage your subscription");

    const admin = getAdminClient();
    const { data: subscription, error } = await admin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    if (!subscription?.stripe_customer_id) return sendError(res, 404, "No Stripe customer is linked to this account");

    const portal = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${getOrigin(req)}/billing`,
    });
    return res.status(200).json({ url: portal.url });
  } catch (error) {
    console.error("Stripe portal creation failed", error);
    return sendError(res, 500, "Unable to open billing management right now");
  }
}
