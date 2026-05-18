import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Polar.sh pricing tiers
const PRICING_TIERS = {
  free: {
    productId: null,
    priceId: null,
    dailyCredits: 10,
    features: ["10 AI Scoring Credits/Day", "Basic Test History", "Limited Practice"],
  },
  basic: {
    productId: "prod_basic",
    priceId: "price_29",
    dailyCredits: 50,
    monthlyPrice: 29,
    features: ["50 AI Scoring Credits/Day", "Full Test History", "All Practice Questions"],
  },
  premium: {
    productId: "prod_premium",
    priceId: "price_49",
    dailyCredits: 200,
    monthlyPrice: 49,
    features: ["200 AI Scoring Credits/Day", "Priority AI Scoring", "Personalized Study Plans", "Teacher Review Access"],
  },
  enterprise: {
    productId: "prod_enterprise",
    priceId: "price_99",
    dailyCredits: 1000,
    monthlyPrice: 99,
    features: ["Unlimited AI Scoring", "1-on-1 Coaching", "Score Guarantee", "Priority Support"],
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the caller via Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: authData, error: authError } = await supabaseAuthClient.auth.getUser();
    if (authError || !authData?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = authData.user.id;
    const { tier, successUrl, cancelUrl } = await req.json();

    console.log(`[CHECKOUT] Creating checkout for user ${userId}, tier: ${tier}`);

    const POLAR_API_KEY = Deno.env.get("POLAR_API_KEY");
    if (!POLAR_API_KEY) {
      throw new Error("POLAR_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user email (use authenticated user's email, fall back to admin lookup)
    const userEmail = authData.user.email
      ?? (await supabase.auth.admin.getUserById(userId)).data?.user?.email;
    if (!userEmail) {
      throw new Error("User not found");
    }

    const tierConfig = PRICING_TIERS[tier as keyof typeof PRICING_TIERS];
    if (!tierConfig || tier === "free") {
      throw new Error("Invalid tier or cannot checkout free tier");
    }

    // Create Polar checkout session
    const response = await fetch("https://api.polar.sh/v1/checkouts/custom", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${POLAR_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_price_id: tierConfig.priceId,
        success_url: successUrl || `${req.headers.get("origin")}/dashboard?checkout=success`,
        cancel_url: cancelUrl || `${req.headers.get("origin")}/#pricing`,
        customer_email: userData.user.email,
        metadata: {
          user_id: userId,
          tier: tier,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Polar API error:", response.status, errorText);
      throw new Error(`Checkout creation failed: ${response.status}`);
    }

    const checkout = await response.json();

    console.log(`[CHECKOUT] Created session: ${checkout.id}`);

    return new Response(
      JSON.stringify({ 
        checkoutUrl: checkout.url,
        sessionId: checkout.id 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[CHECKOUT] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Checkout failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
