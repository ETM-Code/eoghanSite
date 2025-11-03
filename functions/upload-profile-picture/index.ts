import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import {
  createServiceClient,
  requireAuth,
  jsonResponse,
  CORS_HEADERS,
} from "../_shared/supabase-client.ts";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, { status: 405 });
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
    return jsonResponse({ error: "Expected multipart/form-data" }, { status: 415 });
  }

  let auth;
  try {
    auth = await requireAuth(req);
  } catch (response) {
    return response as Response;
  }

  const formData = await req.formData();
  const fileEntry = formData.get("file");
  if (!(fileEntry instanceof File)) {
    return jsonResponse({ error: "File field is required" }, { status: 422 });
  }

  if (fileEntry.size <= 0) {
    return jsonResponse({ error: "Empty files are not allowed" }, { status: 422 });
  }
  if (fileEntry.size > MAX_FILE_SIZE_BYTES) {
    return jsonResponse({ error: "File exceeds 5MB limit" }, { status: 413 });
  }

  const mimeType = fileEntry.type || "image/jpeg";
  const extension = ALLOWED_TYPES.get(mimeType.toLowerCase());
  if (!extension) {
    return jsonResponse({ error: "Unsupported image type" }, { status: 415 });
  }

  const service = createServiceClient();
  const { data: canEdit, error: modeError } = await service.rpc<boolean>("project_mode_allows_profile_edit");
  if (modeError) {
    return jsonResponse({ error: modeError.message }, { status: 500 });
  }
  if (!canEdit) {
    return jsonResponse({ error: "Uploads are disabled in the current project mode." }, { status: 403 });
  }

  const timestamp = Date.now();
  const fileName = `${timestamp}.${extension}`;
  const objectPath = `${auth.user.id}/${fileName}`;
  const buffer = new Uint8Array(await fileEntry.arrayBuffer());

  const { error: uploadError } = await service.storage
    .from("profile-pictures")
    .upload(objectPath, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    return jsonResponse({ error: uploadError.message }, { status: 400 });
  }

  return jsonResponse({
    path: objectPath,
    mime_type: mimeType,
    size: fileEntry.size,
  }, { status: 201 });
});
