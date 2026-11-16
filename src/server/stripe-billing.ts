import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import type { IncomingMessage, ServerResponse } from "node:http";

export type ApiRequest = IncomingMessage & { body?: unknown };
export type ApiResponse = ServerResponse & {
  status: (statusCode: number) => ApiResponse;
  json: (body: unknown) => void;
};

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("Stripe is not configured");
  return new Stripe(secretKey);
}
const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export function getAdminClient() {
  if (!supabaseUrl || !supabaseServiceKey) throw new Error("Billing service is not configured");
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function getUserId(req: ApiRequest) {
  if (!supabaseUrl || !supabaseAnonKey) throw new Error("Authentication service is not configured");
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return null;
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await client.auth.getUser(token);
  return error ? null : data.user?.id ?? null;
}

export function getOrigin(req: ApiRequest) {
  const host = req.headers["x-forwarded-host"] ?? req.headers.host;
  const protocol = req.headers["x-forwarded-proto"] ?? "https";
  if (!host || Array.isArray(host) || Array.isArray(protocol)) throw new Error("Request origin is missing");
  return `${protocol === "http" && host.includes("localhost") ? "http" : "https"}://${host}`;
}

export function sendError(res: ApiResponse, statusCode: number, message: string) {
  return res.status(statusCode).json({ error: message });
}

export function readJsonBody(req: ApiRequest): Record<string, unknown> {
  if (typeof req.body === "string") {
    try {
      const parsed: unknown = JSON.parse(req.body);
      return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : {};
    } catch {
      return {};
    }
  }
  return req.body && typeof req.body === "object" ? req.body as Record<string, unknown> : {};
}

export const PLAN_CATALOG = {
  pro: { tier: "basic" as const, name: "PedagogistsPTE Pro", amount: 2900, credits: 50 },
  premium: { tier: "premium" as const, name: "PedagogistsPTE Premium", amount: 4900, credits: 200 },
};

export function tierForPlan(plan: string) {
  return PLAN_CATALOG[plan as keyof typeof PLAN_CATALOG] ?? null;
}
