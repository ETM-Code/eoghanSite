'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient, SUPABASE_URL } from '@/lib/supabaseClient';

type ProfileCore = {
  name: string;
  contact_email: string;
  whatsapp_link?: string | null;
  bio?: string | null;
  linkedin?: string | null;
  github?: string | null;
  calendly?: string | null;
  can_group?: boolean | null;
  profile_picture_path?: string | null;
};

type ProfileLink = {
  label?: string | null;
  url?: string | null;
  type?: string | null;
};

type ProfileProject = {
  title?: string | null;
  description?: string | null;
  url?: string | null;
};

type MeetingWishlistItem = {
  title?: string;
  description?: string;
};

type ProfileSnapshot = {
  id?: string;
  profile_id?: string;
  user_id?: string;
  profile: ProfileCore;
  links: ProfileLink[];
  projects: ProfileProject[];
  meeting_wishlist: MeetingWishlistItem[];
  interests: string[];
  skills: string[];
  fun_facts: string[];
  avatarUrl?: string | null;
  updated_at?: string | null;
};

type LinkInput = {
  label: string;
  url: string;
};

type ProjectInput = {
  title: string;
  description: string;
  url: string;
};

type ProfileDraftForm = {
  profile: ProfileCore;
  links: LinkInput[];
  projects: ProjectInput[];
  meetingWishlist: MeetingWishlistItem[];
  interests: string[];
  skills: string[];
  funFacts: string[];
};

const INITIAL_FORM: ProfileDraftForm = {
  profile: {
    name: '',
    contact_email: '',
    whatsapp_link: '',
    bio: '',
    linkedin: '',
    github: '',
    calendly: '',
    can_group: true,
    profile_picture_path: '',
  },
  links: [],
  projects: [],
  meetingWishlist: [],
  interests: [],
  skills: [],
  funFacts: [],
};

const chipStyles =
  'inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm';

function formatDateLabel(input?: string | null) {
  if (!input) return null;
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function sanitizeLinks(links: LinkInput[]) {
  return links
    .filter((link) => link.label.trim() || link.url.trim())
    .map((link) => ({
      label: link.label.trim(),
      url: link.url.trim(),
    }));
}

function sanitizeProjects(projects: ProjectInput[]) {
  return projects
    .filter((project) => project.title.trim() || project.description.trim() || project.url.trim())
    .map((project) => ({
      title: project.title.trim(),
      description: project.description.trim(),
      url: project.url.trim(),
    }));
}

function sanitizeMeetingWishlist(items: MeetingWishlistItem[]) {
  return items
    .filter((item) => (item.title?.trim() ?? '') || (item.description?.trim() ?? ''))
    .map((item) => ({
      title: item.title?.trim() ?? '',
      description: item.description?.trim() ?? '',
    }));
}

const gradientAccent = (
  <div className="pointer-events-none absolute -top-32 right-10 h-80 w-80 rounded-full bg-teal-500/40 blur-3xl" />
);

export default function ScholarMatcherClient() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [session, setSession] = useState<Session | null>(null);
  const [authMode, setAuthMode] = useState<'signIn' | 'signUp'>('signIn');
  const [authForm, setAuthForm] = useState({ email: '', password: '', fullName: '' });
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authWorking, setAuthWorking] = useState(false);

  const [form, setForm] = useState<ProfileDraftForm>(INITIAL_FORM);
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [draftMessage, setDraftMessage] = useState<string | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [profiles, setProfiles] = useState<ProfileSnapshot[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<ProfileSnapshot | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [skillDraft, setSkillDraft] = useState('');
  const [interestDraft, setInterestDraft] = useState('');
  const [funFactDraft, setFunFactDraft] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const loadProfiles = useCallback(async () => {
    setProfilesLoading(true);
    setProfileError(null);

    try {
      const { data, error } = await supabase
        .from('profile_snapshots')
        .select('*');

      if (error) throw error;

      const rows = data ?? [];

      const normalized = await Promise.all(
        rows.map(async (row: any) => {
          const profile: ProfileCore = {
            name: row.profile?.name ?? row.name ?? '',
            contact_email: row.profile?.contact_email ?? row.contact_email ?? '',
            whatsapp_link: row.profile?.whatsapp_link ?? row.whatsapp_link ?? null,
            bio: row.profile?.bio ?? row.bio ?? '',
            linkedin: row.profile?.linkedin ?? row.linkedin ?? '',
            github: row.profile?.github ?? row.github ?? '',
            calendly: row.profile?.calendly ?? row.calendly ?? '',
            can_group:
              row.profile?.can_group ??
              (typeof row.can_group === 'boolean' ? row.can_group : null) ??
              null,
            profile_picture_path:
              row.profile?.profile_picture_path ??
              row.profile?.profile_picture ??
              row.profile_picture_path ??
              null,
          };

          let avatarUrl: string | null = null;
          const picturePath = profile.profile_picture_path;

          if (picturePath) {
            const { data: signed, error: signedError } = await supabase.storage
              .from('profile-pictures')
              .createSignedUrl(picturePath, 60 * 60);

            if (!signedError) {
              avatarUrl = signed?.signedUrl ?? null;
            }
          }

          const ensureStringArray = (value: unknown): string[] => {
            if (!value) return [];
            if (Array.isArray(value)) {
              return value
                .map((item) => (typeof item === 'string' ? item : null))
                .filter(Boolean) as string[];
            }
            if (typeof value === 'string') return [value];
            return [];
          };

          const normalizeLinks = (value: unknown): ProfileLink[] => {
            if (!value) return [];
            if (Array.isArray(value)) return value as ProfileLink[];
            return [];
          };

          const normalizeProjects = (value: unknown): ProfileProject[] => {
            if (!value) return [];
            if (Array.isArray(value)) return value as ProfileProject[];
            return [];
          };

          const normalizeWishlist = (value: unknown): MeetingWishlistItem[] => {
            if (!value) return [];
            if (Array.isArray(value)) {
              return value.map((item) => {
                if (typeof item === 'string') {
                  return { title: item, description: '' };
                }
                return item as MeetingWishlistItem;
              });
            }
            if (typeof value === 'string') return [{ title: value, description: '' }];
            return [];
          };

          const snapshot: ProfileSnapshot = {
            id: row.id ?? row.profile_id ?? row.user_id ?? crypto.randomUUID(),
            profile_id: row.profile_id ?? row.user_id ?? row.id ?? undefined,
            user_id: row.user_id ?? undefined,
            profile,
            links: normalizeLinks(row.links ?? row.profile_links),
            projects: normalizeProjects(row.projects),
            meeting_wishlist: normalizeWishlist(row.meeting_wishlist ?? row.wishlist),
            interests: ensureStringArray(row.interests ?? row.profile_interests),
            skills: ensureStringArray(row.skills ?? row.profile_skills),
            fun_facts: ensureStringArray(row.fun_facts),
            avatarUrl,
            updated_at: row.updated_at ?? row.approved_at ?? null,
          };

          return snapshot;
        })
      );

      normalized.sort((a, b) => a.profile.name.localeCompare(b.profile.name));
      setProfiles(normalized);

      if (normalized.length) {
        setSelectedProfile((prev) => prev ?? normalized[0]);
      }
    } catch (error) {
      console.error(error);
      setProfileError('We could not load the community yet. Please try again in a moment.');
    } finally {
      setProfilesLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  useEffect(() => {
    if (!selectedProfile && profiles.length) {
      setSelectedProfile(profiles[0]);
    }
  }, [profiles, selectedProfile]);

  const filteredProfiles = useMemo(() => {
    if (!searchTerm.trim()) return profiles;
    const needle = searchTerm.trim().toLowerCase();
    return profiles.filter((snapshot) => {
      const { profile, skills, interests, fun_facts, projects } = snapshot;
      const haystack = [
        profile.name,
        profile.bio ?? '',
        profile.linkedin ?? '',
        profile.github ?? '',
        ...skills,
        ...interests,
        ...fun_facts,
        ...projects.map((project) => project.title ?? ''),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(needle);
    });
  }, [profiles, searchTerm]);

  const handleAuthSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setAuthWorking(true);
    setAuthError(null);
    setAuthMessage(null);

    try {
      if (authMode === 'signUp') {
        const { data, error } = await supabase.auth.signUp({
          email: authForm.email,
          password: authForm.password,
          options: {
            data: {
              full_name: authForm.fullName,
            },
          },
        });

        if (error) throw error;
        if (!data.session) {
          setAuthMessage('Check your email to confirm your account before signing in.');
        } else {
          setAuthMessage('Welcome aboard! Build your profile below.');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authForm.email,
          password: authForm.password,
        });

        if (error) throw error;
        if (data.user) {
          setAuthMessage(`Signed in as ${data.user.email}`);
        }
      }
    } catch (error: any) {
      setAuthError(error.message ?? 'Authentication failed.');
    } finally {
      setAuthWorking(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAuthMessage(null);
    setAuthError(null);
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!session) {
      setDraftError('Please sign in before uploading an image.');
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setDraftError(null);
    setDraftMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${SUPABASE_URL}/functions/v1/upload-profile-picture`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details?.error ?? 'Upload failed');
      }

      const payload = (await response.json()) as { path: string };

      setForm((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          profile_picture_path: payload.path,
        },
      }));

      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
      setPhotoPreview(URL.createObjectURL(file));
      setDraftMessage('Profile photo uploaded. Submit your profile to save changes.');
    } catch (error: any) {
      console.error(error);
      setDraftError(error.message ?? 'We could not upload that image.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const submitDraft = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session) {
      setDraftError('Please sign in to share your profile.');
      return;
    }

    setDraftError(null);
    setDraftMessage(null);
    setIsSubmittingDraft(true);

    try {
      const draftPayload = {
        profile: {
          name: form.profile.name.trim(),
          contact_email: form.profile.contact_email.trim(),
          whatsapp_link: form.profile.whatsapp_link?.trim() || null,
          bio: form.profile.bio?.trim() || null,
          linkedin: form.profile.linkedin?.trim() || null,
          github: form.profile.github?.trim() || null,
          calendly: form.profile.calendly?.trim() || null,
          can_group: form.profile.can_group ?? true,
          profile_picture_path: form.profile.profile_picture_path || null,
        },
        links: sanitizeLinks(form.links),
        projects: sanitizeProjects(form.projects),
        meeting_wishlist: sanitizeMeetingWishlist(form.meetingWishlist),
        interests: form.interests,
        skills: form.skills,
        fun_facts: form.funFacts,
        contacts: [],
      };

      const response = await fetch(`${SUPABASE_URL}/functions/v1/profile-submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(draftPayload),
      });

      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details?.error ?? 'Profile submission failed');
      }

      setDraftMessage('Draft submitted for review! We will refresh the feed shortly.');
      loadProfiles();
    } catch (error: any) {
      console.error(error);
      setDraftError(error.message ?? 'Something went wrong while saving your profile.');
    } finally {
      setIsSubmittingDraft(false);
    }
  };

  const addLink = () => {
    setForm((prev) => ({
      ...prev,
      links: [...prev.links, { label: '', url: '' }],
    }));
  };

  const updateLink = (index: number, field: keyof LinkInput, value: string) => {
    setForm((prev) => {
      const next = [...prev.links];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, links: next };
    });
  };

  const removeLink = (index: number) => {
    setForm((prev) => {
      const next = [...prev.links];
      next.splice(index, 1);
      return { ...prev, links: next };
    });
  };

  const addProject = () => {
    setForm((prev) => ({
      ...prev,
      projects: [...prev.projects, { title: '', description: '', url: '' }],
    }));
  };

  const updateProject = (index: number, field: keyof ProjectInput, value: string) => {
    setForm((prev) => {
      const next = [...prev.projects];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, projects: next };
    });
  };

  const removeProject = (index: number) => {
    setForm((prev) => {
      const next = [...prev.projects];
      next.splice(index, 1);
      return { ...prev, projects: next };
    });
  };

  const addWishlistItem = () => {
    setForm((prev) => ({
      ...prev,
      meetingWishlist: [...prev.meetingWishlist, { title: '', description: '' }],
    }));
  };

  const updateWishlist = (index: number, field: keyof MeetingWishlistItem, value: string) => {
    setForm((prev) => {
      const next = [...prev.meetingWishlist];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, meetingWishlist: next };
    });
  };

  const removeWishlist = (index: number) => {
    setForm((prev) => {
      const next = [...prev.meetingWishlist];
      next.splice(index, 1);
      return { ...prev, meetingWishlist: next };
    });
  };

  const removeSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((item) => item !== skill),
    }));
  };

  const removeInterest = (interest: string) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.filter((item) => item !== interest),
    }));
  };

  const removeFunFact = (fact: string) => {
    setForm((prev) => ({
      ...prev,
      funFacts: prev.funFacts.filter((item) => item !== fact),
    }));
  };

  const addSkill = () => {
    if (!skillDraft.trim()) return;
    const value = skillDraft.trim();
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(value) ? prev.skills : [...prev.skills, value],
    }));
    setSkillDraft('');
  };

  const addInterest = () => {
    if (!interestDraft.trim()) return;
    const value = interestDraft.trim();
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(value) ? prev.interests : [...prev.interests, value],
    }));
    setInterestDraft('');
  };

  const addFunFact = () => {
    if (!funFactDraft.trim()) return;
    const value = funFactDraft.trim();
    setForm((prev) => ({
      ...prev,
      funFacts: [...prev.funFacts, value],
    }));
    setFunFactDraft('');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-600/30 blur-3xl" />
        <div className="absolute bottom-20 left-20 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-[120px]" />
      </div>

      <div className="relative z-10">
        <header className="mx-auto max-w-6xl px-6 pt-16 pb-12">
          <p className="text-xs uppercase tracking-[0.4em] text-teal-300">Scholar Matcher</p>
          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Curate a brilliant profile and discover peers worth meeting.
              </h1>
              <p className="mt-4 text-base text-slate-300 sm:text-lg">
                Scholar Matcher is your social canvas—share your focus, amplify your projects, and find collaborators who
                are just as driven as you are.
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-base font-semibold text-white">
                {profiles.length}
              </span>
              active profiles
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 pb-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
            <section className="space-y-6">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_-40px_rgba(45,212,191,0.9)] backdrop-blur-xl">
                {gradientAccent}
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Access</h2>
                    <button
                      type="button"
                      onClick={() => setAuthMode(authMode === 'signIn' ? 'signUp' : 'signIn')}
                      className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 transition hover:bg-white/20"
                    >
                      {authMode === 'signIn' ? 'Need an account?' : 'Have an account?'}
                    </button>
                  </div>

                  {session ? (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-white/80">
                      <p className="font-medium text-white">
                        Signed in as <span className="text-teal-200">{session.user.email}</span>
                      </p>
                      <p className="mt-2 text-xs text-slate-300">
                        Your session auto-refreshes. You can start editing your profile below.
                      </p>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="mt-4 inline-flex items-center justify-center rounded-full bg-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/30"
                      >
                        Sign out
                      </button>
                    </div>
                  ) : (
                    <form className="mt-5 space-y-4" onSubmit={handleAuthSubmit}>
                      {authMode === 'signUp' && (
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wide text-white/70">Full name</label>
                          <input
                            required
                            value={authForm.fullName}
                            onChange={(event) =>
                              setAuthForm((prev) => ({ ...prev, fullName: event.target.value }))
                            }
                            className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/40"
                            placeholder="Adrian Scholar"
                          />
                        </div>
                      )}
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-white/70">Email</label>
                        <input
                          required
                          type="email"
                          value={authForm.email}
                          onChange={(event) => setAuthForm((prev) => ({ ...prev, email: event.target.value }))}
                          className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/40"
                          placeholder="you@example.com"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-white/70">Password</label>
                        <input
                          required
                          type="password"
                          value={authForm.password}
                          onChange={(event) => setAuthForm((prev) => ({ ...prev, password: event.target.value }))}
                          className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/40"
                          placeholder="••••••••"
                          minLength={6}
                        />
                      </div>
                      {authError && <p className="text-xs text-rose-300">{authError}</p>}
                      {authMessage && <p className="text-xs text-teal-200">{authMessage}</p>}
                      <button
                        type="submit"
                        disabled={authWorking}
                        className="w-full rounded-xl bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-teal-500/30 transition hover:from-teal-300 hover:via-cyan-300 hover:to-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {authWorking ? 'Hold tight…' : authMode === 'signIn' ? 'Sign in' : 'Create account'}
                      </button>
                    </form>
                  )}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_100px_-60px_rgba(59,130,246,1)] backdrop-blur-xl">
                <div className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Your profile canvas</h2>
                    <span className="text-xs uppercase tracking-widest text-white/60">
                      {session ? 'Live editing' : 'Sign in to edit'}
                    </span>
                  </div>

                  <form className="mt-6 space-y-6" onSubmit={submitDraft}>
                    <div className="grid gap-5">
                      <div className="flex flex-col items-start gap-4 sm:flex-row">
                        <label className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/20 bg-white/5 text-xs text-white/70">
                          {photoPreview ? (
                            <Image
                              src={photoPreview}
                              alt="Profile preview"
                              width={112}
                              height={112}
                              className="h-full w-full object-cover"
                            />
                          ) : form.profile.profile_picture_path ? (
                            <span className="px-4 text-center text-[0.7rem]">
                              Photo uploaded
                              <br />
                              (replace?)
                            </span>
                          ) : (
                            <span className="px-4 text-center text-[0.7rem]">
                              Upload portrait
                              <br />
                              5MB max
                            </span>
                          )}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                            onChange={handlePhotoChange}
                            disabled={!session || uploadingPhoto}
                          />
                        </label>
                        <div className="flex-1 space-y-4">
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-white/70">Display name *</label>
                            <input
                              required
                              value={form.profile.name}
                              onChange={(event) =>
                                setForm((prev) => ({
                                  ...prev,
                                  profile: { ...prev.profile, name: event.target.value },
                                }))
                              }
                              className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/30"
                              placeholder="Dr. Maya Fields"
                            />
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className="text-xs font-semibold uppercase tracking-wide text-white/70">Contact email *</label>
                              <input
                                required
                                type="email"
                                value={form.profile.contact_email}
                                onChange={(event) =>
                                  setForm((prev) => ({
                                    ...prev,
                                    profile: { ...prev.profile, contact_email: event.target.value },
                                  }))
                                }
                                className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/30"
                                placeholder="connect@maya.dev"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold uppercase tracking-wide text-white/70">WhatsApp link</label>
                              <input
                                value={form.profile.whatsapp_link ?? ''}
                                onChange={(event) =>
                                  setForm((prev) => ({
                                    ...prev,
                                    profile: { ...prev.profile, whatsapp_link: event.target.value },
                                  }))
                                }
                                className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/30"
                                placeholder="https://wa.me/"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-white/70">Bio *</label>
                        <textarea
                          required
                          value={form.profile.bio ?? ''}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              profile: { ...prev.profile, bio: event.target.value },
                            }))
                          }
                          className="mt-1 min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/30"
                          placeholder="Share your research focus, current projects, and what makes you unique."
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wide text-white/70">LinkedIn</label>
                          <input
                            value={form.profile.linkedin ?? ''}
                            onChange={(event) =>
                              setForm((prev) => ({
                                ...prev,
                                profile: { ...prev.profile, linkedin: event.target.value },
                              }))
                            }
                            className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/30"
                            placeholder="https://linkedin.com/in/"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wide text-white/70">GitHub</label>
                          <input
                            value={form.profile.github ?? ''}
                            onChange={(event) =>
                              setForm((prev) => ({
                                ...prev,
                                profile: { ...prev.profile, github: event.target.value },
                              }))
                            }
                            className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/30"
                            placeholder="https://github.com/"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wide text-white/70">Calendly</label>
                          <input
                            value={form.profile.calendly ?? ''}
                            onChange={(event) =>
                              setForm((prev) => ({
                                ...prev,
                                profile: { ...prev.profile, calendly: event.target.value },
                              }))
                            }
                            className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/30"
                            placeholder="https://calendly.com/"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <header className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Spotlight projects</h3>
                        <button
                          type="button"
                          onClick={addProject}
                          className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 transition hover:bg-white/20"
                        >
                          Add project
                        </button>
                      </header>
                      <div className="space-y-4">
                        {form.projects.length === 0 && (
                          <p className="text-xs text-white/60">
                            Nothing featured yet. Add landmark research, publications, or initiatives you lead.
                          </p>
                        )}
                        {form.projects.map((project, index) => (
                          <div
                            key={`project-${index}`}
                            className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-white/80"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 space-y-2">
                                <input
                                  value={project.title}
                                  onChange={(event) => updateProject(index, 'title', event.target.value)}
                                  placeholder="Project title"
                                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/30"
                                />
                                <textarea
                                  value={project.description}
                                  onChange={(event) => updateProject(index, 'description', event.target.value)}
                                  placeholder="What did you build or discover?"
                                  className="min-h-[90px] w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/30"
                                />
                                <input
                                  value={project.url}
                                  onChange={(event) => updateProject(index, 'url', event.target.value)}
                                  placeholder="Link to learn more"
                                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/30"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeProject(index)}
                                className="rounded-full bg-white/10 px-2 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-white/70 transition hover:bg-white/20"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <header className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Signature links</h3>
                        <button
                          type="button"
                          onClick={addLink}
                          className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 transition hover:bg-white/20"
                        >
                          Add link
                        </button>
                      </header>
                      <div className="space-y-4">
                        {form.links.length === 0 && (
                          <p className="text-xs text-white/60">
                            Collect useful resources—personal site, portfolio, publications, or lab pages.
                          </p>
                        )}
                        {form.links.map((link, index) => (
                          <div
                            key={`link-${index}`}
                            className="grid gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto]"
                          >
                            <input
                              value={link.label}
                              onChange={(event) => updateLink(index, 'label', event.target.value)}
                              placeholder="Label"
                              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/30"
                            />
                            <input
                              value={link.url}
                              onChange={(event) => updateLink(index, 'url', event.target.value)}
                              placeholder="https://"
                              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/30"
                            />
                            <button
                              type="button"
                              onClick={() => removeLink(index)}
                              className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:bg-white/20"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <header className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Skills</h3>
                        <div className="flex gap-2">
                          <input
                            value={skillDraft}
                            onChange={(event) => setSkillDraft(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                event.preventDefault();
                                addSkill();
                              }
                            }}
                            placeholder="Add a skill and press Enter"
                            className="w-44 rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/30"
                          />
                          <button
                            type="button"
                            onClick={addSkill}
                            className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:bg-white/20"
                          >
                            Add
                          </button>
                        </div>
                      </header>
                      <div className="flex flex-wrap gap-2">
                        {form.skills.length === 0 && <p className="text-xs text-white/60">Add your superpowers.</p>}
                        {form.skills.map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className={`${chipStyles} hover:bg-white/20`}
                          >
                            {skill}
                            <span className="text-white/40">×</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <header className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Interests</h3>
                        <div className="flex gap-2">
                          <input
                            value={interestDraft}
                            onChange={(event) => setInterestDraft(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                event.preventDefault();
                                addInterest();
                              }
                            }}
                            placeholder="Add an interest"
                            className="w-44 rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/30"
                          />
                          <button
                            type="button"
                            onClick={addInterest}
                            className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:bg-white/20"
                          >
                            Add
                          </button>
                        </div>
                      </header>
                      <div className="flex flex-wrap gap-2">
                        {form.interests.length === 0 && <p className="text-xs text-white/60">Let people know what lights you up.</p>}
                        {form.interests.map((interest) => (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => removeInterest(interest)}
                            className={`${chipStyles} hover:bg-white/20`}
                          >
                            {interest}
                            <span className="text-white/40">×</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <header className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Dream meetings</h3>
                        <button
                          type="button"
                          onClick={addWishlistItem}
                          className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 transition hover:bg-white/20"
                        >
                          Add idea
                        </button>
                      </header>
                      <div className="space-y-4">
                        {form.meetingWishlist.length === 0 && (
                          <p className="text-xs text-white/60">
                            Who do you want to meet? Add topics or collaborations you hope to explore.
                          </p>
                        )}
                        {form.meetingWishlist.map((item, index) => (
                          <div
                            key={`wishlist-${index}`}
                            className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-white/80"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 space-y-2">
                                <input
                                  value={item.title ?? ''}
                                  onChange={(event) => updateWishlist(index, 'title', event.target.value)}
                                  placeholder="Topic or person"
                                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/30"
                                />
                                <textarea
                                  value={item.description ?? ''}
                                  onChange={(event) => updateWishlist(index, 'description', event.target.value)}
                                  placeholder="Why this connection matters"
                                  className="min-h-[70px] w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/30"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeWishlist(index)}
                                className="rounded-full bg-white/10 px-2 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-white/70 transition hover:bg-white/20"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <header className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Fun facts</h3>
                        <div className="flex gap-2">
                          <input
                            value={funFactDraft}
                            onChange={(event) => setFunFactDraft(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                event.preventDefault();
                                addFunFact();
                              }
                            }}
                            placeholder="Mix in something unexpected"
                            className="w-52 rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/30"
                          />
                          <button
                            type="button"
                            onClick={addFunFact}
                            className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:bg-white/20"
                          >
                            Add
                          </button>
                        </div>
                      </header>
                      <div className="flex flex-wrap gap-2">
                        {form.funFacts.length === 0 && (
                          <p className="text-xs text-white/60">Human moments help people remember you.</p>
                        )}
                        {form.funFacts.map((fact, index) => (
                          <button
                            key={`${fact}-${index}`}
                            type="button"
                            onClick={() => removeFunFact(fact)}
                            className={`${chipStyles} hover:bg-white/20`}
                          >
                            {fact}
                            <span className="text-white/40">×</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {draftError && <p className="text-xs text-rose-300">{draftError}</p>}
                    {draftMessage && <p className="text-xs text-teal-200">{draftMessage}</p>}

                    <button
                      type="submit"
                      disabled={!session || isSubmittingDraft}
                      className="w-full rounded-2xl bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:from-blue-300 hover:via-indigo-300 hover:to-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmittingDraft ? 'Submitting…' : 'Submit profile draft'}
                    </button>
                  </form>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_-50px_rgba(99,102,241,0.9)] backdrop-blur-xl">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Community feed</h2>
                    <p className="text-sm text-slate-300">
                      Explore verified profiles, saved drafts, and find collaborators worth messaging.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                    <span className="h-2 w-2 rounded-full bg-teal-300" />
                    {profilesLoading ? 'Syncing' : 'Live'}
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="h-4 w-4 text-white/50"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m21 21-4.35-4.35m0 0a7 7 0 1 0-9.9-9.9 7 7 0 0 0 9.9 9.9Z"
                      />
                    </svg>
                    <input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search by name, skill, interest, or project"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={loadProfiles}
                    className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:bg-white/20"
                  >
                    Refresh
                  </button>
                </div>

                {profileError && <p className="mt-4 text-xs text-rose-300">{profileError}</p>}

                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {profilesLoading
                    ? Array.from({ length: 6 }).map((_, index) => (
                        <div
                          key={`skeleton-${index}`}
                          className="h-56 rounded-2xl border border-white/10 bg-white/5"
                        >
                          <div className="h-full animate-pulse rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-white/0" />
                        </div>
                      ))
                    : filteredProfiles.map((profile) => {
                        const isActive = selectedProfile?.profile_id === profile.profile_id;
                        return (
                          <button
                            key={profile.profile_id ?? profile.id}
                            type="button"
                            onClick={() => setSelectedProfile(profile)}
                            className={`group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5 text-left text-sm text-white/80 transition hover:-translate-y-1 hover:bg-white/10 hover:shadow-lg hover:shadow-slate-900/40 ${
                              isActive ? 'ring-2 ring-teal-300/60' : ''
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-white/10">
                                {profile.avatarUrl ? (
                                  <Image
                                    src={profile.avatarUrl}
                                    alt={`${profile.profile.name} avatar`}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-xs text-white/60">
                                    {profile.profile.name
                                      .split(' ')
                                      .map((part) => part[0])
                                      .join('')
                                      .slice(0, 2)
                                      .toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-base font-semibold text-white">{profile.profile.name}</p>
                                {profile.updated_at && (
                                  <p className="text-[0.65rem] uppercase tracking-[0.35em] text-white/40">
                                    Updated {formatDateLabel(profile.updated_at)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <p className="mt-4 line-clamp-3 text-sm text-white/70">
                              {profile.profile.bio || 'This scholar has not added a bio yet.'}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                              {profile.skills.slice(0, 3).map((skill) => (
                                <span key={skill} className={chipStyles}>
                                  {skill}
                                </span>
                              ))}
                              {profile.skills.length > 3 && (
                                <span className={`${chipStyles} bg-white/5`}>+{profile.skills.length - 3}</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                </div>
              </div>

              {selectedProfile && (
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/[0.02] p-6 backdrop-blur-xl">
                  <div className="absolute -right-10 top-0 h-52 w-52 rounded-full bg-purple-500/20 blur-3xl" />
                  <div className="relative">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-3xl border border-white/20 bg-white/10">
                        {selectedProfile.avatarUrl ? (
                          <Image
                            src={selectedProfile.avatarUrl}
                            alt={`${selectedProfile.profile.name} avatar`}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-white/70">
                            {selectedProfile.profile.name
                              .split(' ')
                              .map((part) => part[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h3 className="text-2xl font-semibold text-white">
                              {selectedProfile.profile.name}
                            </h3>
                            <p className="text-sm text-white/70">{selectedProfile.profile.bio}</p>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-white/70">
                            {selectedProfile.profile.contact_email && (
                              <a
                                href={`mailto:${selectedProfile.profile.contact_email}`}
                                className="rounded-full bg-white/10 px-3 py-1 font-medium transition hover:bg-white/20"
                              >
                                Email
                              </a>
                            )}
                            {selectedProfile.profile.whatsapp_link && (
                              <a
                                href={selectedProfile.profile.whatsapp_link}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full bg-white/10 px-3 py-1 font-medium transition hover:bg-white/20"
                              >
                                WhatsApp
                              </a>
                            )}
                            {selectedProfile.profile.calendly && (
                              <a
                                href={selectedProfile.profile.calendly}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full bg-white/10 px-3 py-1 font-medium transition hover:bg-white/20"
                              >
                                Book time
                              </a>
                            )}
                          </div>
                        </div>

                        {selectedProfile.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {selectedProfile.skills.map((skill) => (
                              <span key={`selected-skill-${skill}`} className={chipStyles}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        {selectedProfile.links.length > 0 && (
                          <div className="space-y-2 text-sm text-white/80">
                            <h4 className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">Links</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedProfile.links.map((link) => (
                                <a
                                  key={`${selectedProfile.profile_id}-${link.url}`}
                                  href={link.url ?? '#'}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white transition hover:bg-white/20"
                                >
                                  {link.label ?? 'View'}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedProfile.projects.length > 0 && (
                          <div className="space-y-3 text-sm text-white/80">
                            <h4 className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">Projects</h4>
                            <div className="space-y-3">
                              {selectedProfile.projects.map((project, index) => (
                                <div
                                  key={`selected-project-${index}`}
                                  className="rounded-2xl border border-white/10 bg-white/10 p-4"
                                >
                                  <div className="flex items-center justify-between gap-4">
                                    <p className="text-base font-semibold text-white">
                                      {project.title ?? 'Untitled project'}
                                    </p>
                                    {project.url && (
                                      <a
                                        href={project.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:bg-white/20"
                                      >
                                        View
                                      </a>
                                    )}
                                  </div>
                                  {project.description && (
                                    <p className="mt-2 text-white/70">{project.description}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedProfile.meeting_wishlist.length > 0 && (
                          <div className="space-y-3 text-sm text-white/80">
                            <h4 className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">Dream meetings</h4>
                            <div className="space-y-2">
                              {selectedProfile.meeting_wishlist.map((item, index) => (
                                <div key={`selected-wishlist-${index}`} className="rounded-2xl bg-white/10 p-3">
                                  <p className="font-semibold text-white">{item.title}</p>
                                  {item.description && (
                                    <p className="mt-1 text-white/70">{item.description}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedProfile.fun_facts.length > 0 && (
                          <div className="space-y-2 text-sm text-white/80">
                            <h4 className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">Fun facts</h4>
                            <ul className="space-y-1 text-white/70">
                              {selectedProfile.fun_facts.map((fact, index) => (
                                <li key={`selected-fun-${index}`}>• {fact}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!selectedProfile && !profilesLoading && filteredProfiles.length === 0 && (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/70">
                  No profiles match that description yet. Try another search or share your own!
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
