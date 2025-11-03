import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import {
  createServiceClient,
  requireAuth,
  jsonResponse,
  CORS_HEADERS,
} from "../_shared/supabase-client.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, { status: 405 });
  }

  let auth;
  try {
    auth = await requireAuth(req);
  } catch (response) {
    return response as Response;
  }

  const service = createServiceClient();
  const { data: isAdmin, error: roleError } = await service.rpc("is_admin", { uid: auth.user.id });
  if (roleError) {
    return jsonResponse({ error: roleError.message }, { status: 500 });
  }
  if (!isAdmin) {
    return jsonResponse({ error: "Admin access required" }, { status: 403 });
  }

  let draftId: string | null = null;
  let reason: string | null = null;
  try {
    const body = await req.json();
    draftId = body?.draft_id ?? body?.draftId ?? null;
    if (body?.reason && typeof body.reason === "string") {
      reason = body.reason.trim();
    } else if (body?.rejection_reason && typeof body.rejection_reason === "string") {
      reason = body.rejection_reason.trim();
    }
  } catch (_err) {
    return jsonResponse({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!draftId || typeof draftId !== "string") {
    return jsonResponse({ error: "draft_id is required" }, { status: 422 });
  }

  const { error } = await service.rpc("reject_profile_draft", {
    p_draft_id: draftId,
    p_admin: auth.user.id,
    p_reason: reason,
  });

  if (error) {
    return jsonResponse({ error: error.message }, { status: 400 });
  }

  return jsonResponse({ message: "Draft rejected" });
});
