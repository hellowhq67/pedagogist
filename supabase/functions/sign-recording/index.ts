import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Returns a short-lived signed URL for a practice-recordings audio path.
// Authorization: any authenticated user, only if the path is the audio_url of
// an existing speaking_attempts row (i.e. it has been published via a graded
// attempt and is therefore visible through the leaderboard).
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: claims, error: claimErr } = await userClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { path } = await req.json();
    if (typeof path !== "string" || !path.length) {
      return new Response(JSON.stringify({ error: "path required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (path.startsWith("http")) {
      return new Response(JSON.stringify({ signedUrl: path }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });

    // Validate the path is referenced by a published attempt.
    const { data: ref } = await admin
      .from("speaking_attempts")
      .select("id")
      .eq("audio_url", path)
      .limit(1)
      .maybeSingle();
    if (!ref) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: signed, error: signErr } = await admin.storage
      .from("practice-recordings")
      .createSignedUrl(path, 60 * 60);
    if (signErr || !signed) {
      return new Response(JSON.stringify({ error: signErr?.message || "sign failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ signedUrl: signed.signedUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
