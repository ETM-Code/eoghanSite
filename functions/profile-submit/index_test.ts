import { assertEquals, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { handleProfileSubmit, sanitizeString, sanitizeUrl, type ProfileSubmitDeps } from "./index.ts";
import type { AuthContext } from "../_shared/supabase-client.ts";

type ServiceOptions = {
  canEdit?: boolean;
  modeError?: { message: string } | null;
  existingProfile?: Record<string, unknown> | null;
  profileQueryError?: { message: string; code?: string } | null;
  insertError?: string | null;
  capturedInsert?: Record<string, unknown> | null;
  deleteCalled?: boolean;
};

const createMockService = (options: ServiceOptions) => {
  return {
    rpc: async (fn: string) => {
      if (fn === "project_mode_allows_profile_edit") {
        if (options.modeError) {
          return { data: null, error: options.modeError };
        }
        return { data: options.canEdit ?? true, error: null };
      }
      throw new Error(`Unexpected rpc call: ${fn}`);
    },
    from: (_table: string) => {
      if (_table === "profiles") {
        return {
          select() {
            return this;
          },
          eq() {
            return this;
          },
          async maybeSingle() {
            if (options.profileQueryError) {
              return { data: null, error: options.profileQueryError };
            }
            return { data: options.existingProfile ?? null, error: null };
          },
        };
      }
      if (_table === "profile_drafts") {
        return {
          delete() {
            options.deleteCalled = true;
            return {
              eq: () => ({
                eq: async () => ({ data: null, error: null }),
              }),
            };
          },
          insert(payload: Record<string, unknown>) {
            options.capturedInsert = payload;
            return {
              select: () => ({
                single: async () => {
                  if (options.insertError) {
                    return { data: null, error: { message: options.insertError } };
                  }
                  return {
                    data: { id: "new-draft", submitted_at: "2024-01-01T00:00:00Z" },
                    error: null,
                  };
                },
              }),
            };
          },
        };
      }
      throw new Error(`Unexpected table: ${_table}`);
    },
  };
};

const createDeps = (options: ServiceOptions = {}) => {
  const service = createMockService(options);
  const mockAuth = {
    user: { id: "user-1" },
    token: "token",
    client: {},
  } as unknown as AuthContext;
  const deps = {
    requireAuth: async () => mockAuth,
    createServiceClient: () => service as never,
    jsonResponse: (payload: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(payload), {
        status: init?.status ?? 200,
        headers: { "Content-Type": "application/json" },
      }),
  } as ProfileSubmitDeps;
  return { deps, options };
};

Deno.test("sanitizeString trims and limits length", () => {
  assertEquals(sanitizeString("  hello  \n"), "hello");
  assertEquals(sanitizeString("", { allowEmpty: true }), "");
  assertEquals(sanitizeString(123), null);
  assertEquals(sanitizeString("x".repeat(10), { max: 5 }), "x".repeat(5));
});

Deno.test("sanitizeUrl rejects invalid URLs", () => {
  assertEquals(sanitizeUrl("not a url"), null);
  assertEquals(sanitizeUrl("https://example.com"), "https://example.com/");
});

Deno.test("handleProfileSubmit rejects unsupported methods", async () => {
  const { deps } = createDeps();
  const res = await handleProfileSubmit(new Request("https://example.com", { method: "GET" }), deps);
  assertEquals(res.status, 405);
});

Deno.test("handleProfileSubmit respects project mode", async () => {
  const { deps } = createDeps({ canEdit: false });
  const req = new Request("https://example.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile: { name: "Test", contact_email: "a@b.com", whatsapp_link: "https://wa.me/1" } }),
  });
  const res = await handleProfileSubmit(req, deps);
  assertEquals(res.status, 403);
  const body = await res.json();
  assertEquals(body.error, "Profile editing is disabled right now.");
});

Deno.test("handleProfileSubmit validates required fields", async () => {
  const { deps } = createDeps();
  const req = new Request("https://example.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      profile: {
        contact_email: "user@example.com",
        whatsapp_link: "https://wa.me/3531234567",
      },
    }),
  });
  const res = await handleProfileSubmit(req, deps);
  assertEquals(res.status, 422);
  const body = await res.json();
  assertEquals(body.error, "Name is required");
});

Deno.test("handleProfileSubmit validates age bounds", async () => {
  const { deps } = createDeps();
  const req = new Request("https://example.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      profile: {
        name: "Test",
        contact_email: "user@example.com",
        whatsapp_link: "https://wa.me/3531234567",
        age: 200,
      },
    }),
  });
  const res = await handleProfileSubmit(req, deps);
  assertEquals(res.status, 422);
  const body = await res.json();
  assertEquals(body.error, "Age must be between 13 and 120");
});

Deno.test("handleProfileSubmit stores sanitized payload", async () => {
  const serviceOptions: ServiceOptions = {};
  const { deps, options } = createDeps(serviceOptions);
  const req = new Request("https://example.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      profile: {
        name: "  Jane Doe  ",
        contact_email: "  jane@example.com  ",
        whatsapp_link: "https://wa.me/3531234567",
        age: "30",
        bio: " Hello ",
        linkedin: "https://linkedin.com/in/example",
        github: "https://github.com/example",
        calendly: "https://calendly.com/example",
        can_group: true,
        profile_picture_path: " user/avatar.png ",
      },
      projects: [
        { name: " Project A ", description: " Desc ", link: "https://github.com/project" },
      ],
      links: [
        { label: " Site ", url: "https://example.com" },
        { label: "Invalid", url: "notaurl" },
      ],
      interests: ["  hiking  ", 5],
      skills: ["  TypeScript  ", null],
      meeting_wishlist: [
        { name: " Elon ", linkedin: "https://linkedin.com/in/elon" },
      ],
      contacts: [
        { name: "Alice", contact_details: " test " },
      ],
      fun_facts: {
        favorite_movie: "  Matrix  ",
        extras: { note: "Fun" },
      },
    }),
  });

  const res = await handleProfileSubmit(req, deps);
  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body.draft_id, "new-draft");
  assert(options.deleteCalled);
  const insert = options.capturedInsert as Record<string, unknown>;
  assert(insert);
  assertEquals(insert.user_id, "user-1");
  assertEquals(insert.status, "pending");
  assertEquals(insert.is_initial, true);
  const data = insert.data as Record<string, unknown>;
  const profile = data.profile as Record<string, unknown>;
  assertEquals(profile.name, "Jane Doe");
  assertEquals(profile.contact_email, "jane@example.com");
  assertEquals(profile.whatsapp_link, "https://wa.me/3531234567");
  assertEquals(profile.age, 30);
  assertEquals(profile.bio, "Hello");
  assertEquals(profile.can_group, true);
  assertEquals(profile.profile_picture_path, "user/avatar.png");
  const skills = data.skills as string[];
  assertEquals(skills, ["TypeScript"]);
  const links = data.links as Array<Record<string, string>>;
  assertEquals(links.length, 1);
  const projects = data.projects as Array<Record<string, string>>;
  assertEquals(projects[0].name, "Project A");
});
