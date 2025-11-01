# Scholar Matcher Backend (Supabase)

This repo contains the Supabase schema, row-level security (RLS) policies, and Edge Functions that back the Scholar Matcher experience. Everything is designed so the frontend can talk to the public API key while sensitive transitions (admin approval, destructive deletes, storage uploads) are mediated through Edge Functions.

---

## 1. Database schema

Run the migration (`supabase/migrations/20240221120000_init_schema.sql`) after creating the project:

```bash
supabase db push
```

Key pieces of the schema:

| Table / View | Purpose | Notes |
| --- | --- | --- |
| `project_settings` | Singleton row storing `mode` (`allow_access`, `restrict_access`, `viewing`, `disabled`). | Anyone can read; only admins can update. A trigger on `auth.users` prevents new signups when mode != `allow_access`. |
| `app_admins` | Identifies admin users. | Populate with `user_id` values from `auth.users`. Admins can delete other accounts, approve drafts, and change project mode. |
| `profiles` | Published profiles (approved data only). | Required columns: `name`, `contact_email`, `whatsapp_link`. Optional metadata stored in linked tables. |
| `profile_links`, `projects`, `meeting_wishlist`, `contacts`, `profile_interests`, `profile_skills`, `fun_facts` | Child tables connected via `profile_id`. | All rows are wiped/replaced on admin approval so the published state always matches the latest approved draft. |
| `profile_drafts` | Stores pending profile submissions/edits as JSONB payloads. | One pending draft per user (`status = 'pending'`). Visible to the owner and admins. Status transitions: `pending -> approved/rejected`, leftovers become `archived`. |
| `approved_profiles` (view) | Flat view of approved profiles. | Use when you just need the primary profile fields. |
| `profile_snapshots` (view) | Aggregates the profile plus child tables into a single JSON document per user. | Frontend-friendly source for read views. |

### Project modes

Behaviour is controlled entirely by `project_settings.mode`:

- `allow_access`: full access -- new accounts, editing, viewing.
- `restrict_access`: no new accounts (signups fail), but authenticated users may edit; everyone can view.
- `viewing`: read-only for all profiles; existing users cannot edit or submit drafts.
- `disabled`: every read/write table policy denies public access (only service-role Edge Functions can operate).

`project_mode_allows_signup/edit/view` helper functions are used by policies and Edge Functions. Changing the mode immediately affects permissions.

### Admin helpers

- `is_admin(uid uuid default auth.uid())`: security-definer helper used inside policies and Edge Functions.
- `approve_profile_draft(draft_id, admin_id)`: copies the draft JSON into the normalized tables and marks the draft as approved.
- `reject_profile_draft(draft_id, admin_id, reason)`: marks the draft as rejected.
- `delete_profile_completely(target_user, acting_user)`: removes profile data, linked child rows, drafts, and admin role. Called from the delete Edge Function.

> Populate `app_admins` manually (SQL or Supabase dashboard) with the administrator's `auth.users.id` before using moderation features.

---

## 2. Storage

A private bucket `profile-pictures` is created automatically. RLS policies enforce:

- Users can read images only when viewing is allowed.
- Authenticated users can upload/delete objects under `${auth.uid()}/...` while editing is allowed.
- Admins can manage any file.

Uploads must go through the `upload-profile-picture` Edge Function (enforces file type and <= 5 MB). Store the returned `path` in the draft payload (`profile.profile_picture_path`). The frontend can later request a signed URL via `supabase.storage.from('profile-pictures').createSignedUrl(path, expirySeconds)`.

---

## 3. Edge Functions

All functions live in `supabase/functions/*`. Deploy with:

```bash
supabase functions deploy <function-name>
```

Set these environment variables for every function: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

| Function | Method | Body | Purpose |
| --- | --- | --- | --- |
| `profile-submit` | `POST` (or `PUT`) | JSON draft payload | Authenticated users submit/replace the pending draft. Validates required fields and current project mode, then stores the draft. Response: `{ draft_id, submitted_at, is_initial }`. |
| `upload-profile-picture` | `POST` | `multipart/form-data` with `file` | Authenticated upload for avatars. Enforces image type (`jpg/png/webp`) and 5 MB limit, stores under `<user_id>/<timestamp>.<ext>`, returns `{ path, mime_type, size }`. |
| `profile-delete` | `DELETE` or `POST` | Optional `{ target_user_id, delete_auth_account }` | Deletes all profile data and (optionally) the Supabase auth user. Users can delete themselves; admins may delete anyone. |
| `admin-approve-draft` | `POST` | `{ draft_id }` | Admins approve a pending draft. Triggers the SQL merge logic. |
| `admin-reject-draft` | `POST` | `{ draft_id, reason? }` | Admins reject a draft with an optional message stored in `profile_drafts.rejection_reason`. |
| `admin-set-project-mode` | `POST` | `{ mode }` | Admins update `project_settings.mode`. |

All endpoints expect a `Bearer <JWT>` header from `supabase.auth.signInWithPassword / refreshSession`. Service-role operations happen server-side; tokens are used only to confirm identity and enforce admin checks.

---

## 4. Frontend integration cheatsheet

### Sign-up flow

Use the regular Supabase JS client with the anon key:

```ts
const { data, error } = await supabase.auth.signUp({ email, password });
```

If the project mode is not `allow_access`, the trigger on `auth.users` raises an error (`Account creation is disabled for this project mode`). Handle that message to show the appropriate UI.

### Creating or editing a profile

1. Upload the avatar (optional) via the Edge Function:

```ts
const form = new FormData();
form.append('file', file);
await fetch('/functions/v1/upload-profile-picture', {
  method: 'POST',
  headers: { Authorization: `Bearer ${session.access_token}` },
  body: form,
});
```

2. Submit the profile draft:

```ts
await fetch('/functions/v1/profile-submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  },
  body: JSON.stringify({
    profile: {
      name,
      contact_email,
      whatsapp_link,
      bio,
      linkedin,
      github,
      calendly,
      can_group,
      profile_picture_path: imagePath,
    },
    projects,
    links,
    meeting_wishlist,
    contacts,
    interests,
    skills,
    fun_facts,
  }),
});
```

Users may fetch their latest draft with:

```ts
const { data } = await supabase
  .from('profile_drafts')
  .select('*')
  .eq('status', 'pending')
  .maybeSingle();
```

### Viewing profiles

Use the view for a full snapshot, which respects RLS automatically:

```ts
const { data, error } = await supabase
  .from('profile_snapshots')
  .select('*')
  .order('name');
```

### Admin dashboard essentials

- Pending drafts:
  ```ts
  const { data } = await supabase
    .from('profile_drafts')
    .select('*')
    .eq('status', 'pending')
    .order('submitted_at');
  ```
  (The `profile_submit` cleanup guarantees at most one pending draft per user.)

- Approve / reject: call the Edge Functions with the admin's session token.

- Change project mode:
  ```ts
  await fetch('/functions/v1/admin-set-project-mode', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ mode: 'viewing' }),
  });
  ```

### Project mode awareness

Frontend should read the singleton row to drive UI states:

```ts
const { data } = await supabase
  .from('project_settings')
  .select('mode')
  .single();
```

Use this to disable buttons, hide the sign-up form, or show messaging.

---

## 5. Operational notes

- Every Edge Function throws meaningful JSON errors; surface them in the UI.
- `profile_drafts.rejection_reason` can be displayed to users when a submission is rejected.
- When admins approve a draft, the SQL function wipes and rebuilds the linked tables so there is no stale data.
- Deleting a profile does **not** remove files from storage automatically. The frontend (or an admin tool) can list and delete objects under `${user_id}/` if required.
- Always deploy migrations before functions so the helper functions and types exist for the runtime.

With this pipeline, frontend developers only need the anon key for reads and to call the documented Edge Functions for privileged workflows.
