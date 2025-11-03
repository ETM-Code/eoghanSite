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

  if (!["DELETE", "POST"].includes(req.method)) {
    return jsonResponse({ error: "Method not allowed" }, { status: 405 });
  }

  let auth;
  try {
    auth = await requireAuth(req);
  } catch (response) {
    return response as Response;
  }

  const service = createServiceClient();
  const { data: canEdit, error: modeError } = await service.rpc("project_mode_allows_profile_edit");
  if (modeError) {
    return jsonResponse({ error: modeError.message }, { status: 500 });
  }
  if (!canEdit) {
    return jsonResponse({ error: "Profile deletion is disabled in the current project mode." }, { status: 403 });
  }

  let targetUserId = auth.user.id;
  let deleteAuthAccount = true;

  if (req.method === "POST") {
    try {
      const body = await req.json();
      if (body?.target_user_id) {
        targetUserId = String(body.target_user_id);
      }
      if (typeof body?.delete_auth_account === "boolean") {
        deleteAuthAccount = body.delete_auth_account;
      }
    } catch (_err) {
      // Ignore JSON parse errors for POST without body
    }
  } else {
    const url = new URL(req.url);
    const target = url.searchParams.get("target_user_id");
    if (target) {
      targetUserId = target;
    }
    const deleteFlag = url.searchParams.get("delete_auth_account");
    if (deleteFlag) {
      deleteAuthAccount = deleteFlag !== "false";
    }
  }

  if (!targetUserId) {
    return jsonResponse({ error: "Target user id missing" }, { status: 400 });
  }

  const { error: rpcError } = await service.rpc("delete_profile_completely", {
    target_user: targetUserId,
    acting_user: auth.user.id,
  });

  if (rpcError) {
    return jsonResponse({ error: rpcError.message }, { status: 403 });
  }

  if (deleteAuthAccount) {
    const { error: deleteError } = await service.auth.admin.deleteUser(targetUserId);
    if (deleteError) {
      return jsonResponse({
        warning: "Profile data cleared, but unable to delete auth user.",
        error: deleteError.message,
      }, { status: 200 });
    }
  }

  return jsonResponse({ message: "Profile deleted" });
});
