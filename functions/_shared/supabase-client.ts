import { createClient, SupabaseClient, User } from "https://esm.sh/@supabase/supabase-js@2";

export type AuthContext = {
  user: User;
  token: string;
  client: SupabaseClient;
};

const getEnvOrThrow = (key: string) => {
  const value = Deno.env.get(key);
  if (!value) {
    throw new Error(`${key} env var is required`);
  }
  return value;
};

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS, DELETE",
};

export const createServiceClient = () => {
  const supabaseUrl = getEnvOrThrow('SUPABASE_URL');
  const serviceRoleKey = getEnvOrThrow('SUPABASE_SERVICE_ROLE_KEY');
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
};

export const createClientForRequest = (req: Request) => {
  const supabaseUrl = getEnvOrThrow('SUPABASE_URL');
  const anonKey = getEnvOrThrow('SUPABASE_ANON_KEY');
  const token = extractBearerToken(req.headers.get('Authorization'));
  return createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    },
    auth: {
      persistSession: false,
    },
  });
};

export const extractBearerToken = (authHeader: string | null) => {
  if (!authHeader) return "";
  const [scheme, token] = authHeader.split(" ");
  if (!scheme || scheme.toLowerCase() !== "bearer") return "";
  return token ?? "";
};

export const requireAuth = async (req: Request): Promise<AuthContext> => {
  const token = extractBearerToken(req.headers.get("Authorization"));
  if (!token) {
    throw new Response(JSON.stringify({ error: "Missing bearer token" }), {
      status: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
  const client = createClientForRequest(req);
  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) {
    throw new Response(JSON.stringify({ error: "Invalid or expired token" }), {
      status: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
  return { user: data.user, token, client };
};

export const jsonResponse = (payload: unknown, init?: ResponseInit) => {
  const baseHeaders = init?.headers instanceof Headers
    ? Object.fromEntries(init.headers.entries())
    : (init?.headers as Record<string, string> | undefined) ?? {};

  return new Response(JSON.stringify(payload), {
    ...init,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
      ...baseHeaders,
    },
  });
};
