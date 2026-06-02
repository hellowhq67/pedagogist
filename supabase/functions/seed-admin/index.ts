import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_ADMIN_EMAIL = "admin@pedagogistspte.com";
const DEFAULT_ADMIN_PASSWORD = "Admin@PTE2026";

// One-shot idempotent admin seed. Safe to call multiple times.
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Try to find existing user by email
    let userId: string | null = null;
    const { data: list, error: listErr } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (listErr) throw listErr;

    const existing = list.users.find(
      (u) => u.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase()
    );

    if (existing) {
      userId = existing.id;
      console.log(`[SEED-ADMIN] User already exists: ${userId}`);
    } else {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: DEFAULT_ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { display_name: "PedagogistsPTE Admin" },
      });
      if (createErr) throw createErr;
      userId = created.user!.id;
      console.log(`[SEED-ADMIN] Created user: ${userId}`);
    }

    // 2. Ensure admin role
    const { error: roleErr } = await admin
      .from("user_roles")
      .upsert(
        { user_id: userId, role: "admin" },
        { onConflict: "user_id,role", ignoreDuplicates: true }
      );
    if (roleErr) throw roleErr;

    return new Response(
      JSON.stringify({
        ok: true,
        user_id: userId,
        email: DEFAULT_ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD,
        note: "Change this password immediately after first login.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[SEED-ADMIN] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Seed failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
