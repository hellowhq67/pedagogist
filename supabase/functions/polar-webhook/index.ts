import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, webhook-id, webhook-timestamp, webhook-signature",
};

// Tier configurations
const TIER_CONFIG = {
  free: { dailyCredits: 10, creditsRemaining: 10 },
  basic: { dailyCredits: 50, creditsRemaining: 100 },
  premium: { dailyCredits: 200, creditsRemaining: 500 },
  enterprise: { dailyCredits: 1000, creditsRemaining: 2000 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const POLAR_WEBHOOK_SECRET = Deno.env.get("POLAR_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get webhook headers for verification
    const webhookId = req.headers.get("webhook-id");
    const webhookTimestamp = req.headers.get("webhook-timestamp");
    const webhookSignature = req.headers.get("webhook-signature");

    const body = await req.text();

    // Verify webhook signature if secret is configured
    if (POLAR_WEBHOOK_SECRET && webhookId && webhookTimestamp && webhookSignature) {
      const signedPayload = `${webhookId}.${webhookTimestamp}.${body}`;
      const expectedSignature = createHmac("sha256", POLAR_WEBHOOK_SECRET)
        .update(signedPayload)
        .digest("base64");

      const signatures = webhookSignature.split(" ");
      const isValid = signatures.some(sig => {
        const [, signature] = sig.split(",");
        return signature === expectedSignature;
      });

      if (!isValid) {
        console.error("Invalid webhook signature");
        return new Response("Invalid signature", { status: 401 });
      }
    }

    const event = JSON.parse(body);
    console.log(`[POLAR WEBHOOK] Event: ${event.type}`);

    switch (event.type) {
      case "checkout.created":
        console.log(`[POLAR WEBHOOK] Checkout created: ${event.data.id}`);
        break;

      case "checkout.updated":
        if (event.data.status === "succeeded") {
          await handleSuccessfulCheckout(supabase, event.data);
        }
        break;

      case "subscription.created":
      case "subscription.updated":
        await handleSubscriptionUpdate(supabase, event.data);
        break;

      case "subscription.canceled":
        await handleSubscriptionCanceled(supabase, event.data);
        break;

      case "order.created":
        console.log(`[POLAR WEBHOOK] Order created: ${event.data.id}`);
        break;

      default:
        console.log(`[POLAR WEBHOOK] Unhandled event: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[POLAR WEBHOOK] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Webhook processing failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleSuccessfulCheckout(supabase: any, checkoutData: any) {
  const userId = checkoutData.metadata?.user_id;
  const tier = checkoutData.metadata?.tier;

  if (!userId || !tier) {
    console.error("[POLAR WEBHOOK] Missing metadata in checkout");
    return;
  }

  console.log(`[POLAR WEBHOOK] Processing successful checkout for user ${userId}, tier: ${tier}`);

  const config = TIER_CONFIG[tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.free;

  // Update subscription
  const { error } = await supabase
    .from("subscriptions")
    .upsert({
      user_id: userId,
      tier: tier,
      status: "active",
      polar_customer_id: checkoutData.customer_id,
      polar_subscription_id: checkoutData.subscription_id,
      credits_remaining: config.creditsRemaining,
      daily_credits_used: 0,
      daily_credits_reset_at: new Date().toISOString(),
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id",
    });

  if (error) {
    console.error("[POLAR WEBHOOK] Failed to update subscription:", error);
    throw error;
  }

  console.log(`[POLAR WEBHOOK] Subscription updated for user ${userId}`);
}

async function handleSubscriptionUpdate(supabase: any, subscriptionData: any) {
  const customerId = subscriptionData.customer_id;

  // Find user by polar_customer_id
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("polar_customer_id", customerId)
    .single();

  if (!subscription) {
    console.error("[POLAR WEBHOOK] No subscription found for customer:", customerId);
    return;
  }

  const status = subscriptionData.status === "active" ? "active" : 
                 subscriptionData.status === "canceled" ? "canceled" : 
                 subscriptionData.status;

  await supabase
    .from("subscriptions")
    .update({
      status: status,
      current_period_start: subscriptionData.current_period_start,
      current_period_end: subscriptionData.current_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", subscription.user_id);

  console.log(`[POLAR WEBHOOK] Subscription updated for user ${subscription.user_id}`);
}

async function handleSubscriptionCanceled(supabase: any, subscriptionData: any) {
  const customerId = subscriptionData.customer_id;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("polar_customer_id", customerId)
    .single();

  if (!subscription) {
    console.error("[POLAR WEBHOOK] No subscription found for customer:", customerId);
    return;
  }

  // Downgrade to free tier at end of period
  await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", subscription.user_id);

  console.log(`[POLAR WEBHOOK] Subscription canceled for user ${subscription.user_id}`);
}
