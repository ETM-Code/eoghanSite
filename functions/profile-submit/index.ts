import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import {
  createServiceClient as defaultCreateServiceClient,
  requireAuth as defaultRequireAuth,
  jsonResponse as defaultJsonResponse,
  CORS_HEADERS,
} from "../_shared/supabase-client.ts";

export type SubmitPayload = {
  profile: Record<string, unknown>;
  links?: Array<Record<string, unknown>>;
  projects?: Array<Record<string, unknown>>;
  meeting_wishlist?: Array<Record<string, unknown>>;
  contacts?: Array<Record<string, unknown>>;
  interests?: Array<unknown>;
  skills?: Array<unknown>;
  fun_facts?: Record<string, unknown>;
};

const MAX_IMAGE_PATH_LENGTH = 300;
const MAX_TEXT_FIELD = 2000;
const MAX_LIST_LENGTH = 50;

export const sanitizeString = (
  value: unknown,
  { max = MAX_TEXT_FIELD, allowEmpty = false }: { max?: number; allowEmpty?: boolean } = {},
) => {
  if (typeof value !== "string") return allowEmpty ? "" : null;
  const trimmed = value.trim();
  if (!allowEmpty && trimmed === "") return null;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
};

export const sanitizeUrl = (value: unknown) => {
  const text = sanitizeString(value, { allowEmpty: false, max: 2048 });
  if (!text) return null;
  try {
    const url = new URL(text);
    return url.toString();
  } catch (_err) {
    return null;
  }
};

export const sanitizeArray = <T>(value: unknown, mapper: (entry: unknown) => T | null, max = MAX_LIST_LENGTH) => {
  if (!Array.isArray(value)) return [] as T[];
  const result: T[] = [];
  for (const item of value) {
    if (result.length >= max) break;
    const mapped = mapper(item);
    if (mapped) result.push(mapped);
  }
  return result;
};

export type ProfileSubmitDeps = {
  requireAuth: typeof defaultRequireAuth;
  createServiceClient: typeof defaultCreateServiceClient;
  jsonResponse: typeof defaultJsonResponse;
};

const defaultDeps: ProfileSubmitDeps = {
  requireAuth: defaultRequireAuth,
  createServiceClient: defaultCreateServiceClient,
  jsonResponse: defaultJsonResponse,
};

export const handleProfileSubmit = async (
  req: Request,
  deps: ProfileSubmitDeps = defaultDeps,
): Promise<Response> => {
  const { requireAuth, createServiceClient, jsonResponse } = deps;

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (!["POST", "PUT"].includes(req.method)) {
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
    return jsonResponse({ error: "Profile editing is disabled right now." }, { status: 403 });
  }

  let payload: SubmitPayload;
  try {
    payload = await req.json();
  } catch (_err) {
    return jsonResponse({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!payload?.profile || typeof payload.profile !== "object") {
    return jsonResponse({ error: "Profile payload is required" }, { status: 400 });
  }

  const profileNode = payload.profile;
  const name = sanitizeString((profileNode as Record<string, unknown>).name);
  const contactEmail = sanitizeString(
    (profileNode as Record<string, unknown>).contact_email ?? (profileNode as Record<string, unknown>).contactEmail,
  );
  const whatsappLink = sanitizeUrl(
    (profileNode as Record<string, unknown>).whatsapp_link ?? (profileNode as Record<string, unknown>).whatsappLink,
  );
  const bio = sanitizeString((profileNode as Record<string, unknown>).bio, { allowEmpty: true, max: 4000 });
  const linkedin = sanitizeUrl((profileNode as Record<string, unknown>).linkedin);
  const github = sanitizeUrl((profileNode as Record<string, unknown>).github);
  const calendly = sanitizeUrl((profileNode as Record<string, unknown>).calendly);
  const profilePicturePath = sanitizeString(
    (profileNode as Record<string, unknown>).profile_picture_path
      ?? (profileNode as Record<string, unknown>).profilePicturePath,
    {
      allowEmpty: false,
      max: MAX_IMAGE_PATH_LENGTH,
    },
  );

  if (!name) {
    return jsonResponse({ error: "Name is required" }, { status: 422 });
  }
  if (!contactEmail) {
    return jsonResponse({ error: "Contact email is required" }, { status: 422 });
  }
  if (!whatsappLink) {
    return jsonResponse({ error: "Valid WhatsApp link is required" }, { status: 422 });
  }

  const ageValue = (profileNode as Record<string, unknown>).age;
  let age: number | null = null;
  if (typeof ageValue === "number") {
    age = ageValue;
  } else if (typeof ageValue === "string" && ageValue.trim() !== "") {
    const parsed = Number.parseInt(ageValue, 10);
    if (!Number.isNaN(parsed)) {
      age = parsed;
    }
  }
  if (age !== null && (age < 13 || age > 120)) {
    return jsonResponse({ error: "Age must be between 13 and 120" }, { status: 422 });
  }

  const canGroup = Boolean(
    (profileNode as Record<string, unknown>).can_group ?? (profileNode as Record<string, unknown>).canGroup ?? false,
  );

  const links = sanitizeArray(payload.links, (entry) => {
    if (!entry || typeof entry !== "object") return null;
    const label = sanitizeString((entry as Record<string, unknown>).label ?? (entry as Record<string, unknown>).title);
    const url = sanitizeUrl((entry as Record<string, unknown>).url ?? (entry as Record<string, unknown>).href);
    if (!label || !url) return null;
    return { label, url };
  }, 25);

  const projects = sanitizeArray(payload.projects, (entry) => {
    if (!entry || typeof entry !== "object") return null;
    const nameValue = sanitizeString(
      (entry as Record<string, unknown>).name
        ?? (entry as Record<string, unknown>).project_name
        ?? (entry as Record<string, unknown>).title,
    );
    const description = sanitizeString(
      (entry as Record<string, unknown>).description
        ?? (entry as Record<string, unknown>).project_description
        ?? (entry as Record<string, unknown>).summary,
      { max: 4000 },
    );
    const link = sanitizeUrl(
      (entry as Record<string, unknown>).link
        ?? (entry as Record<string, unknown>).project_link
        ?? (entry as Record<string, unknown>).url,
    );
    if (!nameValue || !description) return null;
    return {
      name: nameValue,
      description,
      link,
    };
  }, 25);

  const meetingWishlist = sanitizeArray(payload.meeting_wishlist, (entry) => {
    if (!entry || typeof entry !== "object") return null;
    const nameValue = sanitizeString((entry as Record<string, unknown>).name);
    if (!nameValue) return null;
    return {
      name: nameValue,
      linkedin: sanitizeUrl((entry as Record<string, unknown>).linkedin),
      other_link: sanitizeUrl((entry as Record<string, unknown>).other_link ?? (entry as Record<string, unknown>).otherLink),
    };
  });

  const contacts = sanitizeArray(payload.contacts, (entry) => {
    if (!entry || typeof entry !== "object") return null;
    const nameValue = sanitizeString((entry as Record<string, unknown>).name);
    if (!nameValue) return null;
    return {
      name: nameValue,
      linkedin: sanitizeUrl((entry as Record<string, unknown>).linkedin),
      other_link: sanitizeUrl((entry as Record<string, unknown>).other_link ?? (entry as Record<string, unknown>).otherLink),
      contact_details: sanitizeString(
        (entry as Record<string, unknown>).contact_details ?? (entry as Record<string, unknown>).contactDetails,
        { allowEmpty: true, max: 2000 },
      ),
    };
  });

  const interests = sanitizeArray(payload.interests, (entry) => {
    if (typeof entry !== "string") return null;
    const trimmed = entry.trim();
    return trimmed ? trimmed : null;
  });

  const skills = sanitizeArray(payload.skills, (entry) => {
    if (typeof entry !== "string") return null;
    const trimmed = entry.trim();
    return trimmed ? trimmed : null;
  });

  const funFactsNode = payload.fun_facts ?? {};
  const funFacts = typeof funFactsNode === "object" && funFactsNode !== null
    ? {
        favorite_movie: sanitizeString(
          (funFactsNode as Record<string, unknown>).favorite_movie ?? (funFactsNode as Record<string, unknown>).favoriteMovie,
          { allowEmpty: true },
        ),
        favorite_book: sanitizeString(
          (funFactsNode as Record<string, unknown>).favorite_book ?? (funFactsNode as Record<string, unknown>).favoriteBook,
          { allowEmpty: true },
        ),
        favorite_food: sanitizeString(
          (funFactsNode as Record<string, unknown>).favorite_food ?? (funFactsNode as Record<string, unknown>).favoriteFood,
          { allowEmpty: true },
        ),
        place_to_visit: sanitizeString(
          (funFactsNode as Record<string, unknown>).place_to_visit ?? (funFactsNode as Record<string, unknown>).placeToVisit,
          { allowEmpty: true },
        ),
        famous_person_to_meet: sanitizeString(
          (funFactsNode as Record<string, unknown>).famous_person_to_meet
            ?? (funFactsNode as Record<string, unknown>).famousPersonToMeet,
          { allowEmpty: true },
        ),
        superpower: sanitizeString((funFactsNode as Record<string, unknown>).superpower, { allowEmpty: true }),
        extras: typeof (funFactsNode as Record<string, unknown>).extras === "object"
          ? (funFactsNode as Record<string, unknown>).extras
          : undefined,
      }
    : {};

  const sanitizedDraft = {
    profile: {
      name,
      age,
      contact_email: contactEmail,
      whatsapp_link: whatsappLink,
      bio,
      linkedin,
      github,
      calendly,
      can_group: canGroup,
      profile_picture_path: profilePicturePath ?? undefined,
    },
    links,
    projects,
    meeting_wishlist: meetingWishlist,
    contacts,
    interests,
    skills,
    fun_facts: funFacts,
  } as const;

  const { data: existingProfile, error: profileQueryError } = await service
    .from("profiles")
    .select("user_id")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (profileQueryError && profileQueryError.code !== "PGRST116") {
    return jsonResponse({ error: profileQueryError.message }, { status: 500 });
  }

  await service
    .from("profile_drafts")
    .delete()
    .eq("user_id", auth.user.id)
    .eq("status", "pending");

  const { data: insertResult, error: insertError } = await service
    .from("profile_drafts")
    .insert({
      user_id: auth.user.id,
      data: sanitizedDraft,
      status: "pending",
      is_initial: !existingProfile,
    })
    .select("id, submitted_at")
    .single();

  if (insertError) {
    return jsonResponse({ error: insertError.message }, { status: 422 });
  }

  return jsonResponse({
    draft_id: insertResult.id,
    submitted_at: insertResult.submitted_at,
    is_initial: !existingProfile,
  });
};

if (import.meta.main) {
  serve((req) => handleProfileSubmit(req));
}
