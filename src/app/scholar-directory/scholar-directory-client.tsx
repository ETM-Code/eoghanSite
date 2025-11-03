'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient, SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabaseClient';

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
  pending?: boolean;
  draftId?: string;
  submitted_at?: string | null;
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

function ensureStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : null))
      .filter(Boolean) as string[];
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }
  return [];
}

function normalizeLinks(value: unknown): ProfileLink[] {
  if (!value) return [];
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const label = 'label' in item && typeof item.label === 'string' ? item.label.trim() : '';
      const url = 'url' in item && typeof item.url === 'string' ? item.url.trim() : '';
      if (!label && !url) return null;
      return { label, url };
    })
    .filter(Boolean) as ProfileLink[];
}

function normalizeProjects(value: unknown): ProfileProject[] {
  if (!value) return [];
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const title =
        ('title' in item && typeof item.title === 'string' ? item.title :
          'name' in item && typeof item.name === 'string' ? (item as any).name : '').trim();
      const description =
        ('description' in item && typeof item.description === 'string'
          ? item.description
          : 'project_description' in item && typeof (item as any).project_description === 'string'
          ? (item as any).project_description
          : '').trim();
      const url =
        ('url' in item && typeof item.url === 'string'
          ? item.url
          : 'link' in item && typeof (item as any).link === 'string'
          ? (item as any).link
          : 'project_link' in item && typeof (item as any).project_link === 'string'
          ? (item as any).project_link
          : '').trim();
      if (!title && !description && !url) return null;
      return { title, description, url };
    })
    .filter(Boolean) as ProfileProject[];
}

function normalizeWishlist(value: unknown): MeetingWishlistItem[] {
  if (!value) return [];
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const title =
        ('title' in item && typeof item.title === 'string'
          ? item.title
          : 'name' in item && typeof (item as any).name === 'string'
          ? (item as any).name
          : '').trim();
      const description =
        ('description' in item && typeof item.description === 'string'
          ? item.description
          : 'reason' in item && typeof (item as any).reason === 'string'
          ? (item as any).reason
          : '').trim();
      if (!title && !description) return null;
      return { title, description };
    })
    .filter(Boolean) as MeetingWishlistItem[];
}

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

type ActiveModal =
  | { type: 'profile'; index: number }
  | { type: 'auth'; mode: 'signIn' | 'signUp' }
  | { type: 'builder'; mode: 'create' | 'edit' }
  | { type: 'submitted'; draft: ProfileSnapshot }
  | null;

export default function ScholarDirectoryClient() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [session, setSession] = useState<Session | null>(null);
  const [authMode, setAuthMode] = useState<'signIn' | 'signUp'>('signIn');
  const [authForm, setAuthForm] = useState({ email: '', password: '', fullName: '' });
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authWorking, setAuthWorking] = useState(false);

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [wizardStep, setWizardStep] = useState(0);
  const [builderSeedAvatar, setBuilderSeedAvatar] = useState<string | null>(null);
  const [pendingBuilderMode, setPendingBuilderMode] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState<ProfileDraftForm>(INITIAL_FORM);
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [draftMessage, setDraftMessage] = useState<string | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [profiles, setProfiles] = useState<ProfileSnapshot[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [pendingDraft, setPendingDraft] = useState<ProfileSnapshot | null>(null);
  const [adminDrafts, setAdminDrafts] = useState<ProfileSnapshot[]>([]);
  const [adminDraftsLoading, setAdminDraftsLoading] = useState(false);
  const [adminDraftsError, setAdminDraftsError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [skillDraft, setSkillDraft] = useState('');
  const [interestDraft, setInterestDraft] = useState('');
  const [funFactDraft, setFunFactDraft] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [moderationWorking, setModerationWorking] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);
  const [moderationMessage, setModerationMessage] = useState<string | null>(null);

  const myProfile = useMemo(() => {
    if (!session?.user) return null;
    if (pendingDraft && pendingDraft.user_id === session.user.id) {
      return pendingDraft;
    }
    return profiles.find((snapshot) => snapshot.user_id === session.user.id) ?? null;
  }, [pendingDraft, profiles, session]);

  const combinedProfiles = useMemo(() => {
    const list: ProfileSnapshot[] = [];
    if (pendingDraft) list.push(pendingDraft);
    if (isAdmin && adminDrafts.length) {
      list.push(
        ...adminDrafts.filter((draft) =>
          pendingDraft ? draft.draftId !== pendingDraft.draftId : true
        )
      );
    }
    list.push(...profiles);

    const seen = new Set<string>();
    const deduped: ProfileSnapshot[] = [];
    for (const item of list) {
      const key = item.profile_id ?? item.user_id ?? item.draftId ?? item.id ?? item.profile.name;
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(item);
    }
    return deduped;
  }, [adminDrafts, isAdmin, pendingDraft, profiles]);

  const filteredProfiles = useMemo(() => {
    if (!searchTerm.trim()) return combinedProfiles;
    const needle = searchTerm.trim().toLowerCase();
    return combinedProfiles.filter((snapshot) => {
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
  }, [combinedProfiles, searchTerm]);

  const releasePhotoPreview = useCallback(() => {
    setPhotoPreview((current) => {
      if (current && current.startsWith('blob:')) {
        URL.revokeObjectURL(current);
      }
      return null;
    });
  }, []);

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (!hash || (!hash.includes('access_token') && !hash.includes('code'))) return;

    void (async () => {
      setAuthWorking(true);
      setAuthError(null);

      try {
        const { data, error } = await supabase.auth.getSessionFromURL({ storeSession: true });

        if (error) {
          throw error;
        }

        const flowType = new URLSearchParams(hash.slice(1)).get('type');

        setAuthMessage(
          flowType === 'recovery'
            ? 'Password updated. You are back in!'
            : data.session
              ? 'Email confirmed. You are signed in. Start your profile below.'
              : 'Email confirmed. You can now sign in.'
        );
      } catch (error) {
        console.error('Failed to complete Supabase email link', error);
        setAuthError('We could not finish signing you in. Please try again.');
      } finally {
        if (typeof window !== 'undefined') {
          const url = window.location.pathname + window.location.search;
          window.history.replaceState({}, document.title, url);

          if (window.location.pathname === '/' && window.location.hash) {
            const target = new URL('/scholar-directory', window.location.origin);
            window.location.assign(target.toString());
            return;
          }
        }

        setAuthWorking(false);
      }
    })();
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
            pending: false,
          };

          return snapshot;
        })
      );

      normalized.sort((a, b) => a.profile.name.localeCompare(b.profile.name));
      setProfiles(normalized);
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

  const loadAdminDrafts = useCallback(async () => {
    if (!isAdmin || !session?.user) {
      setAdminDrafts([]);
      return;
    }

    setAdminDraftsLoading(true);
    setAdminDraftsError(null);

    try {
      const { data, error } = await supabase
        .from('profile_drafts')
        .select('id, user_id, data, submitted_at, status')
        .eq('status', 'pending');

      if (error) throw error;

      const rows = data ?? [];

      const snapshots = await Promise.all(
        rows.map(async (row) => {
          const payload = row.data ?? {};
          const profileNode = (payload as any).profile ?? {};

          const takeString = (value: unknown) => (typeof value === 'string' ? value : '');
          const profilePicturePath = takeString(profileNode.profile_picture_path ?? profileNode.profilePicturePath);
          const canGroupValue = profileNode.can_group ?? profileNode.canGroup ?? false;
          const canGroup = typeof canGroupValue === 'boolean' ? canGroupValue : String(canGroupValue).toLowerCase() === 'true';

          const interests = ensureStringArray(payload.interests);
          const skills = ensureStringArray(payload.skills);
          let funFacts: string[] = [];
          const funFactsNode = payload.fun_facts;
          if (Array.isArray(funFactsNode)) {
            funFacts = ensureStringArray(funFactsNode);
          } else if (funFactsNode && typeof funFactsNode === 'object') {
            funFacts = Object.values(funFactsNode)
              .map((entry) => (typeof entry === 'string' ? entry.trim() : null))
              .filter(Boolean) as string[];
          }

          const snapshot: ProfileSnapshot = {
            id: row.id,
            draftId: row.id,
            profile_id: row.user_id,
            user_id: row.user_id,
            profile: {
              name: takeString(profileNode.name),
              contact_email: takeString(profileNode.contact_email ?? profileNode.contactEmail),
              whatsapp_link: takeString(profileNode.whatsapp_link ?? profileNode.whatsappLink) || null,
              bio: takeString(profileNode.bio) || null,
              linkedin: takeString(profileNode.linkedin) || null,
              github: takeString(profileNode.github) || null,
              calendly: takeString(profileNode.calendly) || null,
              can_group: canGroup,
              profile_picture_path: profilePicturePath || undefined,
            },
            links: normalizeLinks(payload.links),
            projects: normalizeProjects(payload.projects),
            meeting_wishlist: normalizeWishlist(payload.meeting_wishlist),
            interests,
            skills,
            fun_facts: funFacts,
            avatarUrl: null,
            updated_at: row.submitted_at ?? null,
            submitted_at: row.submitted_at ?? null,
            pending: true,
          };

          if (profilePicturePath) {
            const { data: signed } = await supabase.storage
              .from('profile-pictures')
              .createSignedUrl(profilePicturePath, 60 * 60);
            snapshot.avatarUrl = signed?.signedUrl ?? null;
          }

          return snapshot;
        })
      );

      const filtered = snapshots.filter((draft) => !(pendingDraft && draft.draftId === pendingDraft.draftId));
      setAdminDrafts(filtered);
    } catch (error: any) {
      console.error(error);
      setAdminDraftsError(error.message ?? 'Unable to load pending drafts.');
    } finally {
      setAdminDraftsLoading(false);
    }
  }, [isAdmin, pendingDraft, session, supabase]);

  useEffect(() => {
    if (activeModal?.type === 'profile' && activeModal.index >= filteredProfiles.length) {
      setActiveModal(null);
    }
  }, [activeModal, filteredProfiles.length]);

  useEffect(() => {
    if (!session) {
      setPendingDraft(null);
    }
  }, [session]);

  useEffect(() => {
    if (!pendingDraft || !session?.user) return;
    const hasPublished = profiles.some((snapshot) => snapshot.user_id === session.user!.id);
    if (hasPublished) {
      setPendingDraft(null);
    }
  }, [pendingDraft, profiles, session]);

  useEffect(() => () => releasePhotoPreview(), [releasePhotoPreview]);

  useEffect(() => {
    if (!session?.user) {
      setIsAdmin(false);
      setAdminDrafts([]);
      return;
    }

    supabase
      .rpc('is_admin')
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
          setIsAdmin(false);
        } else {
          setIsAdmin(Boolean(data));
        }
      })
      .catch((error) => {
        console.error(error);
        setIsAdmin(false);
      });
  }, [session, supabase]);

  useEffect(() => {
    if (isAdmin) {
      loadAdminDrafts();
    } else {
      setAdminDrafts([]);
    }
  }, [isAdmin, loadAdminDrafts]);

  const activeProfile =
    activeModal?.type === 'profile' ? filteredProfiles[activeModal.index] ?? null : null;

  const pendingProfileIndex = useMemo(() => {
    if (!session?.user) return -1;
    return filteredProfiles.findIndex(
      (snapshot) => snapshot.pending && snapshot.user_id === session.user.id,
    );
  }, [filteredProfiles, session]);

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
          apikey: SUPABASE_ANON_KEY,
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

      if (photoPreview?.startsWith('blob:')) {
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
      const sanitizedLinks = sanitizeLinks(form.links);
      const sanitizedProjects = sanitizeProjects(form.projects);
      const sanitizedWishlist = sanitizeMeetingWishlist(form.meetingWishlist);
      const sanitizedFunFacts = form.funFacts
        .map((fact) => fact.trim())
        .filter((fact) => fact.length > 0);

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
        links: sanitizedLinks,
        projects: sanitizedProjects,
        meeting_wishlist: sanitizedWishlist,
        interests: form.interests,
        skills: form.skills,
        fun_facts: sanitizedFunFacts,
        contacts: [],
      };

      const response = await fetch(`${SUPABASE_URL}/functions/v1/profile-submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(draftPayload),
      });

      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details?.error ?? 'Profile submission failed');
      }

      const submitResult = (await response.json()) as {
        draft_id?: string;
        submitted_at?: string;
      };

      let pendingAvatarUrl: string | null = null;
      if (draftPayload.profile.profile_picture_path) {
        const { data: signed } = await supabase.storage
          .from('profile-pictures')
          .createSignedUrl(draftPayload.profile.profile_picture_path, 60 * 60);
        pendingAvatarUrl = signed?.signedUrl ?? null;
      }

      if (session?.user) {
        const pendingSnapshot: ProfileSnapshot = {
          id: `pending-${session.user.id}`,
          profile_id: session.user.id,
          user_id: session.user.id,
          profile: {
            name: draftPayload.profile.name,
            contact_email: draftPayload.profile.contact_email,
            whatsapp_link: draftPayload.profile.whatsapp_link ?? null,
            bio: draftPayload.profile.bio ?? null,
            linkedin: draftPayload.profile.linkedin ?? null,
            github: draftPayload.profile.github ?? null,
            calendly: draftPayload.profile.calendly ?? null,
            can_group: draftPayload.profile.can_group ?? true,
            profile_picture_path: draftPayload.profile.profile_picture_path ?? undefined,
          },
          links: sanitizedLinks,
          projects: sanitizedProjects,
          meeting_wishlist: sanitizedWishlist,
          interests: [...draftPayload.interests],
          skills: [...draftPayload.skills],
          fun_facts: [...sanitizedFunFacts],
          avatarUrl: pendingAvatarUrl,
          updated_at: submitResult.submitted_at ?? new Date().toISOString(),
          submitted_at: submitResult.submitted_at ?? new Date().toISOString(),
          pending: true,
          draftId: submitResult.draft_id,
        };

        setPendingDraft(pendingSnapshot);
        setSearchTerm('');
        closeModal();
        setActiveModal({ type: 'submitted', draft: pendingSnapshot });
      } else {
        closeModal();
      }

      setDraftMessage(null);
      setForm(INITIAL_FORM);
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

  const hydrateFormFromSnapshot = useCallback(
    (snapshot: ProfileSnapshot) => {
      releasePhotoPreview();
      setForm({
        profile: {
          name: snapshot.profile.name ?? '',
          contact_email: snapshot.profile.contact_email ?? '',
          whatsapp_link: snapshot.profile.whatsapp_link ?? '',
          bio: snapshot.profile.bio ?? '',
          linkedin: snapshot.profile.linkedin ?? '',
          github: snapshot.profile.github ?? '',
          calendly: snapshot.profile.calendly ?? '',
          can_group: snapshot.profile.can_group ?? true,
          profile_picture_path: snapshot.profile.profile_picture_path ?? '',
        },
        links: (snapshot.links ?? []).map((link) => ({
          label: link.label ?? '',
          url: link.url ?? '',
        })),
        projects: (snapshot.projects ?? []).map((project) => ({
          title: project.title ?? '',
          description: project.description ?? '',
          url: project.url ?? '',
        })),
        meetingWishlist: (snapshot.meeting_wishlist ?? []).map((item) => ({
          title: item.title ?? '',
          description: item.description ?? '',
        })),
        interests: [...(snapshot.interests ?? [])],
        skills: [...(snapshot.skills ?? [])],
        funFacts: [...(snapshot.fun_facts ?? [])],
      });
      setBuilderSeedAvatar(snapshot.avatarUrl ?? null);
    },
    [releasePhotoPreview]
  );

  const openAuthModal = useCallback(
    (mode: 'signIn' | 'signUp') => {
      setAuthMode(mode);
      setAuthError(null);
      setAuthMessage(null);
      setActiveModal({ type: 'auth', mode });
    },
    []
  );

  const closeModal = useCallback(() => {
    setModerationError(null);
    setModerationMessage(null);
    setModerationWorking(false);

    if (activeModal?.type === 'builder') {
      releasePhotoPreview();
      setWizardStep(0);
      setDraftMessage(null);
      setDraftError(null);
      setPendingBuilderMode(null);
    }

    if (activeModal?.type === 'auth') {
      setAuthMessage(null);
      setAuthError(null);
    }

    setActiveModal(null);
  }, [activeModal, releasePhotoPreview]);

  const builderSteps = useMemo(
    () => [
      {
        title: 'Identity',
        description: 'Add the basics so people can recognise you instantly.',
      },
      {
        title: 'Story',
        description: 'Share what you are building and why it matters.',
      },
      {
        title: 'Links',
        description: 'Drop the key places where people can follow your work.',
      },
      {
        title: 'Highlights',
        description: 'Add quick-fire tags, projects, and wishlist items.',
      },
    ],
    []
  );

  const totalSteps = builderSteps.length;

  const validateStep = useCallback(
    (step: number) => {
      switch (step) {
        case 0: {
          const hasName = form.profile.name.trim().length > 0;
          const hasEmail = form.profile.contact_email.trim().length > 0;
          if (!hasName || !hasEmail) {
            setDraftError('Share your name and an email so people can connect with you.');
            return false;
          }
          break;
        }
        case 1: {
          const hasBio = (form.profile.bio ?? '').trim().length > 0;
          if (!hasBio) {
            setDraftError('A short bio helps the community understand what you are building.');
            return false;
          }
          break;
        }
        default:
          break;
      }
      setDraftError(null);
      return true;
    },
    [form.profile.contact_email, form.profile.bio, form.profile.name]
  );

  const openBuilder = useCallback(
    (mode: 'create' | 'edit') => {
      if (!session) {
        openAuthModal('signIn');
        setPendingBuilderMode(mode);
        return;
      }

      setWizardStep(0);
      setDraftMessage(null);
      setDraftError(null);
      setActiveModal({ type: 'builder', mode });

      if (mode === 'edit' && myProfile) {
        hydrateFormFromSnapshot(myProfile);
      } else {
        releasePhotoPreview();
        setBuilderSeedAvatar(null);
        setForm({
          profile: {
            ...INITIAL_FORM.profile,
            contact_email: session.user?.email ?? '',
          },
          links: [],
          projects: [],
          meetingWishlist: [],
          interests: [],
          skills: [],
          funFacts: [],
        });
      }
    },
    [hydrateFormFromSnapshot, myProfile, openAuthModal, releasePhotoPreview, session]
  );

  const handleCreateProfile = useCallback(() => {
    const nextMode: 'create' | 'edit' = myProfile ? 'edit' : 'create';
    if (!session) {
      setPendingBuilderMode(nextMode);
      openAuthModal('signUp');
      return;
    }
    openBuilder(nextMode);
  }, [myProfile, openAuthModal, openBuilder, session]);

  const handleProfileIconClick = useCallback(() => {
    const nextMode: 'create' | 'edit' = myProfile ? 'edit' : 'create';
    if (!session) {
      setPendingBuilderMode(nextMode);
      openAuthModal('signIn');
      return;
    }
    openBuilder(nextMode);
  }, [myProfile, openAuthModal, openBuilder, session]);

  useEffect(() => {
    if (session && pendingBuilderMode) {
      openBuilder(pendingBuilderMode);
      setPendingBuilderMode(null);
    }
  }, [openBuilder, pendingBuilderMode, session]);

  const openProfileAt = useCallback(
    (index: number) => {
      if (!filteredProfiles[index]) return;
      setModerationError(null);
      setModerationMessage(null);
      setActiveModal({ type: 'profile', index });
    },
    [filteredProfiles]
  );

  const showPrevProfile = useCallback(() => {
    if (activeModal?.type !== 'profile' || filteredProfiles.length === 0) return;
    setActiveModal({
      type: 'profile',
      index: (activeModal.index - 1 + filteredProfiles.length) % filteredProfiles.length,
    });
  }, [activeModal, filteredProfiles.length]);

  const showNextProfile = useCallback(() => {
    if (activeModal?.type !== 'profile' || filteredProfiles.length === 0) return;
    setActiveModal({
      type: 'profile',
      index: (activeModal.index + 1) % filteredProfiles.length,
    });
  }, [activeModal, filteredProfiles.length]);

  const handleApproveDraft = useCallback(
    async (draftId: string) => {
      if (!session) {
        openAuthModal('signIn');
        return;
      }

      if (moderationWorking) return;

      setModerationError(null);
      setModerationMessage(null);
      setModerationWorking(true);

      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-approve-draft`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ draft_id: draftId }),
        });

        if (!response.ok) {
          const details = await response.json().catch(() => ({}));
          throw new Error(details?.error ?? 'Approval failed.');
        }

        if (pendingDraft?.draftId === draftId) {
          setPendingDraft(null);
        }

        setAdminDrafts((prev) => prev.filter((draft) => draft.draftId !== draftId));

        await loadAdminDrafts();
        await loadProfiles();

        setModerationMessage('Draft approved and published.');
        setActiveModal(null);
      } catch (error: any) {
        console.error(error);
        setModerationError(error.message ?? 'Approval failed.');
      } finally {
        setModerationWorking(false);
      }
    },
    [loadAdminDrafts, loadProfiles, moderationWorking, openAuthModal, pendingDraft, session]
  );

  const handleAdvanceStep = useCallback(() => {
    if (!validateStep(wizardStep)) return;
    setWizardStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps, validateStep, wizardStep]);

  const handleRetreatStep = useCallback(() => {
    setDraftError(null);
    setWizardStep((prev) => Math.max(prev - 1, 0));
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-600/30 blur-3xl" />
        <div className="absolute bottom-20 left-20 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-[120px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="px-6 pt-12 pb-8 sm:pb-10">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-500 text-lg font-semibold text-slate-950 shadow-lg shadow-teal-500/40">
                  SD
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-teal-300">Web Summit Scholars</p>
                  <h1 className="text-3xl font-semibold text-white sm:text-4xl">Scholar Directory</h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCreateProfile}
                  className="hidden h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-500 text-lg font-semibold text-slate-900 shadow-lg shadow-teal-500/40 transition hover:scale-105 sm:flex"
                  aria-label="Add your profile"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={handleProfileIconClick}
                  className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 text-sm font-semibold text-white transition hover:border-teal-300/60"
                  aria-label={session ? 'Edit your profile' : 'Sign in to manage your profile'}
                  title={session ? 'Edit your profile' : 'Sign in to manage your profile'}
                >
                  {session ? (
                    myProfile?.avatarUrl ? (
                      <Image src={myProfile.avatarUrl} alt="Your avatar" fill className="object-cover" />
                    ) : (
                      (session.user.email ?? 'You')[0]?.toUpperCase()
                    )
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="h-5 w-5 text-white/80"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 20v-1a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v1m12-9a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <p className="max-w-3xl text-sm text-slate-300 sm:text-base">
              A private, Instagram-style space for the ~50 Irish Web Summit Scholars to see what everyone else is
              building, swap intros, and keep momentum between meetups.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex min-w-[220px] flex-1 items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-4 w-4 text-white/60"
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
                  placeholder="Search by scholar, skill, interest, or project"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                />
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white/60">
                {profilesLoading ? 'Syncing' : `${profiles.length} live profiles`}
              </div>
              <button
                type="button"
                onClick={loadProfiles}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:bg-white/10"
              >
                Refresh
              </button>
            </div>
          </div>
        </header>

        <main className="relative flex-1 pb-28">
          <div className="mx-auto w-full max-w-6xl px-6">
            {profileError && (
              <div className="mb-6 rounded-2xl border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {profileError}
              </div>
            )}

            {isAdmin && adminDraftsError && (
              <div className="mb-6 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                {adminDraftsError}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {profilesLoading
                ? Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={`profile-skeleton-${index}`}
                      className="h-64 rounded-3xl border border-white/10 bg-white/5"
                    >
                      <div className="h-full w-full animate-pulse rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
                    </div>
                  ))
                : filteredProfiles.map((profile, index) => {
                    const isPending = Boolean(profile.pending);
                    const isMine = session?.user?.id === profile.user_id;
                    const pendingLabel = isPending
                      ? isMine
                        ? 'Pending review'
                        : 'Awaiting approval'
                      : null;
                    return (
                      <button
                        key={profile.profile_id ?? profile.id ?? `profile-${index}`}
                        type="button"
                        onClick={() => openProfileAt(index)}
                        className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 text-left shadow-[0_25px_80px_-45px_rgba(15,118,110,0.7)] transition hover:-translate-y-1 hover:bg-white/10 hover:border-teal-300/40 ${
                          isPending ? 'ring-1 ring-amber-400/60' : ''
                        }`}
                      >
                        {pendingLabel && (
                          <span className="pointer-events-none absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amber-200">
                            {pendingLabel}
                          </span>
                        )}
                      <div className="relative h-56 w-full overflow-hidden">
                        {profile.avatarUrl ? (
                          <Image
                            src={profile.avatarUrl}
                            alt={`${profile.profile.name} portrait`}
                            fill
                            className="object-cover transition duration-500 group-hover:scale-[1.05]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-xl font-semibold text-white/70">
                            {profile.profile.name
                              .split(' ')
                              .map((part) => part[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent opacity-60 transition group-hover:opacity-80" />
                      </div>
                      <div className="flex flex-col gap-3 p-4">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-200/80">Scholar</p>
                          <p className="mt-1 text-lg font-semibold text-white">{profile.profile.name}</p>
                          {profile.updated_at && (
                            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-white/40">
                              Updated {formatDateLabel(profile.updated_at)}
                            </p>
                          )}
                        </div>
                        <p className="line-clamp-2 text-sm text-white/70">
                          {profile.profile.bio || 'This scholar is still drafting their story.'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.slice(0, 3).map((skill) => (
                            <span key={`${profile.profile_id}-skill-${skill}`} className={chipStyles}>
                              {skill}
                            </span>
                          ))}
                          {profile.skills.length === 0 && (
                            <span className={`${chipStyles} bg-white/5`}>No tags yet</span>
                          )}
                        </div>
                      </div>
                      </button>
                    );
                  })}
            </div>

            {!profilesLoading && filteredProfiles.length === 0 && (
              <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/70">
                Nobody fits that search yet. Try a different phrase or add your own profile to kick things off.
              </div>
            )}
          </div>
        </main>
      </div>

      <button
        type="button"
        onClick={handleCreateProfile}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-500 text-2xl font-semibold text-slate-900 shadow-[0_20px_50px_-20px_rgba(13,148,136,0.8)] transition hover:scale-105 sm:hidden"
        aria-label="Add your profile"
      >
        +
      </button>

      {activeModal?.type === 'profile' && activeProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xl">
          <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/[0.02] shadow-2xl">
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-5 top-5 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Close profile"
            >
              ×
            </button>

            <div className="absolute left-5 top-1/2 hidden -translate-y-1/2 md:block">
              <button
                type="button"
                onClick={showPrevProfile}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                aria-label="Previous profile"
              >
                ‹
              </button>
            </div>
            <div className="absolute right-5 top-1/2 hidden -translate-y-1/2 md:block">
              <button
                type="button"
                onClick={showNextProfile}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                aria-label="Next profile"
              >
                ›
              </button>
            </div>

            <div className="grid gap-0 md:grid-cols-[320px_minmax(0,1fr)]">
              <div className="relative h-80 w-full overflow-hidden bg-white/10 md:h-full">
                {activeProfile.avatarUrl ? (
                  <Image src={activeProfile.avatarUrl} alt={`${activeProfile.profile.name} portrait`} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-4xl font-semibold text-white/70">
                    {activeProfile.profile.name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-6 p-6 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-teal-200/80">Scholar</p>
                    <h2 className="mt-2 text-3xl font-semibold text-white">{activeProfile.profile.name}</h2>
                    {activeProfile.pending && session?.user?.id === activeProfile.user_id && (
                      <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amber-200">
                        Draft awaiting approval
                      </span>
                    )}
                    {activeProfile.profile.bio && (
                      <p className="mt-3 text-sm text-white/70">{activeProfile.profile.bio}</p>
                    )}
                  </div>
                  <span className="text-xs uppercase tracking-[0.3em] text-white/40">
                    {activeModal.index + 1} / {filteredProfiles.length}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-white/70">
                  {activeProfile.profile.contact_email && (
                    <a
                      href={`mailto:${activeProfile.profile.contact_email}`}
                      className="rounded-full bg-white/10 px-3 py-1 font-medium transition hover:bg-white/20"
                    >
                      Email
                    </a>
                  )}
                  {activeProfile.profile.whatsapp_link && (
                    <a
                      href={activeProfile.profile.whatsapp_link}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-white/10 px-3 py-1 font-medium transition hover:bg-white/20"
                    >
                      WhatsApp
                    </a>
                  )}
                {activeProfile.profile.calendly && (
                  <a
                    href={activeProfile.profile.calendly}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-white/10 px-3 py-1 font-medium transition hover:bg-white/20"
                  >
                    Book time
                  </a>
                )}
                </div>

                {isAdmin && activeProfile.pending && activeProfile.draftId && (
                  <div className="space-y-3 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-100">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.3em]">Admin review</span>
                      {activeProfile.submitted_at && (
                        <span className="text-[0.65rem] uppercase tracking-[0.3em] text-amber-200/80">
                          Submitted {formatDateLabel(activeProfile.submitted_at)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-amber-100/80">
                      Approve this draft to publish it to the directory immediately.
                    </p>
                    {moderationError && <p className="text-xs text-rose-200">{moderationError}</p>}
                    {moderationMessage && <p className="text-xs text-teal-200">{moderationMessage}</p>}
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleApproveDraft(activeProfile.draftId as string)}
                        disabled={moderationWorking}
                        className="rounded-full bg-amber-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {moderationWorking ? 'Approving…' : 'Approve draft'}
                      </button>
                    </div>
                  </div>
                )}

                {activeProfile.skills.length > 0 && (
                  <div className="space-y-2 text-sm text-white/80">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {activeProfile.skills.map((skill) => (
                        <span key={`profile-skill-${skill}`} className={chipStyles}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {activeProfile.interests.length > 0 && (
                  <div className="space-y-2 text-sm text-white/80">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {activeProfile.interests.map((interest) => (
                        <span key={`profile-interest-${interest}`} className={chipStyles}>
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {activeProfile.links.length > 0 && (
                  <div className="space-y-2 text-sm text-white/80">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">Links</h3>
                    <div className="flex flex-wrap gap-2">
                      {activeProfile.links.map((link) => (
                        <a
                          key={`profile-link-${link.url}`}
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

                {activeProfile.projects.length > 0 && (
                  <div className="space-y-3 text-sm text-white/80">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">Projects</h3>
                    <div className="space-y-3">
                      {activeProfile.projects.map((project, projectIndex) => (
                        <div
                          key={`active-project-${projectIndex}`}
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

                {activeProfile.meeting_wishlist.length > 0 && (
                  <div className="space-y-2 text-sm text-white/80">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">Dream meetings</h3>
                    <div className="space-y-2">
                      {activeProfile.meeting_wishlist.map((item, wishlistIndex) => (
                        <div key={`active-wishlist-${wishlistIndex}`} className="rounded-2xl bg-white/10 p-3">
                          <p className="font-semibold text-white">{item.title}</p>
                          {item.description && (
                            <p className="mt-1 text-white/70">{item.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeProfile.fun_facts.length > 0 && (
                  <div className="space-y-2 text-sm text-white/80">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">Fun facts</h3>
                    <ul className="space-y-1 text-white/70">
                      {activeProfile.fun_facts.map((fact, factIndex) => (
                        <li key={`active-fact-${factIndex}`}>• {fact}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal?.type === 'auth' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6 backdrop-blur-xl">
          <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-slate-900/60 p-8 shadow-2xl">
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Close"
            >
              ×
            </button>
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-teal-200/80">
                  {authMode === 'signIn' ? 'Welcome back' : 'Join the directory'}
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-white">
                  {authMode === 'signIn'
                    ? 'Sign in to browse and connect'
                    : 'Create an account to add your profile'}
                </h2>
                <p className="mt-2 text-sm text-white/70">
                  This directory is private to the Irish Web Summit Scholars cohort.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleAuthSubmit}>
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
                      placeholder="Aisling Scholar"
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

              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'signIn' ? 'signUp' : 'signIn')}
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:bg-white/10"
              >
                {authMode === 'signIn' ? 'Need an account?' : 'Have an account?'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal?.type === 'builder' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-xl">
          <div className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-slate-900/60 shadow-2xl">
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Close builder"
            >
              ×
            </button>

            <div className="flex flex-col gap-2 border-b border-white/10 p-6 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-teal-200/80">
                  {activeModal.mode === 'edit' ? 'Refresh your profile' : 'Launch your profile'}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {builderSteps[wizardStep]?.title ?? 'Profile'}
                </h2>
                <p className="text-sm text-white/70">
                  {builderSteps[wizardStep]?.description ?? 'Fill in the details below.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {builderSteps.map((_step, stepIndex) => (
                  <div
                    key={`builder-step-${stepIndex}`}
                    className={`h-1.5 w-10 rounded-full transition ${stepIndex <= wizardStep ? 'bg-teal-300' : 'bg-white/10'}`}
                  />
                ))}
              </div>
            </div>

            <form className="max-h-[70vh] overflow-y-auto p-6 sm:p-8" onSubmit={submitDraft}>
              <div className="space-y-8">
                {wizardStep === 0 && (
                  <div className="grid gap-6 sm:grid-cols-[150px_minmax(0,1fr)]">
                    <label className="group relative flex h-40 w-40 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-3xl border border-dashed border-white/20 bg-white/5 text-xs text-white/70 sm:h-48 sm:w-48">
                      {photoPreview ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={photoPreview} alt="Profile preview" className="h-full w-full object-cover" />
                      ) : builderSeedAvatar ? (
                        <Image
                          src={builderSeedAvatar}
                          alt="Profile preview"
                          fill
                          className="object-cover"
                          sizes="160px"
                        />
                      ) : (
                        <span className="px-6 text-center text-[0.7rem]">
                          Upload portrait
                          <br />
                          (5MB max)
                        </span>
                      )}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="absolute inset-0 h-full w-full opacity-0"
                        onChange={handlePhotoChange}
                        disabled={!session || uploadingPhoto}
                      />
                      <span className="pointer-events-none absolute inset-x-0 bottom-0 hidden justify-center bg-black/50 py-1 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-white transition group-hover:flex">
                        Change
                      </span>
                    </label>

                    <div className="space-y-4">
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
                          className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/40"
                          placeholder="Dr. Maeve Byrne"
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wide text-white/70">Email *</label>
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
                            className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/40"
                            placeholder="scholar@example.com"
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
                            className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/40"
                            placeholder="https://wa.me/..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 1 && (
                  <div className="space-y-4">
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
                        className="mt-1 min-h-[160px] w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/40"
                        placeholder="Talk about what you're building, why it matters, and what you want to collaborate on."
                      />
                    </div>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="space-y-6">
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
                          placeholder="https://linkedin.com/in/..."
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
                          placeholder="https://github.com/..."
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
                          placeholder="https://calendly.com/..."
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Signature links</h3>
                        <button
                          type="button"
                          onClick={addLink}
                          className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 transition hover:bg-white/20"
                        >
                          Add link
                        </button>
                      </div>
                      <div className="space-y-4">
                        {form.links.length === 0 && (
                          <p className="text-xs text-white/60">
                            Drop personal sites, research hubs, or social profiles people should click first.
                          </p>
                        )}
                        {form.links.map((link, linkIndex) => (
                          <div
                            key={`link-${linkIndex}`}
                            className="grid gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]"
                          >
                            <input
                              value={link.label}
                              onChange={(event) => updateLink(linkIndex, 'label', event.target.value)}
                              placeholder="Label"
                              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/30"
                            />
                            <input
                              value={link.url}
                              onChange={(event) => updateLink(linkIndex, 'url', event.target.value)}
                              placeholder="https://..."
                              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/30"
                            />
                            <button
                              type="button"
                              onClick={() => removeLink(linkIndex)}
                              className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:bg-white/20"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Spotlight projects</h3>
                        <button
                          type="button"
                          onClick={addProject}
                          className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 transition hover:bg-white/20"
                        >
                          Add project
                        </button>
                      </div>
                      <div className="space-y-4">
                        {form.projects.length === 0 && (
                          <p className="text-xs text-white/60">
                            Feature launches, awards, or research the cohort should know about.
                          </p>
                        )}
                        {form.projects.map((project, projectIndex) => (
                          <div
                            key={`project-${projectIndex}`}
                            className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-white/80"
                          >
                            <div className="flex flex-col gap-3">
                              <input
                                value={project.title}
                                onChange={(event) => updateProject(projectIndex, 'title', event.target.value)}
                                placeholder="Project title"
                                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/30"
                              />
                              <textarea
                                value={project.description ?? ''}
                                onChange={(event) => updateProject(projectIndex, 'description', event.target.value)}
                                placeholder="What are you building?"
                                className="min-h-[90px] rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/30"
                              />
                              <input
                                value={project.url ?? ''}
                                onChange={(event) => updateProject(projectIndex, 'url', event.target.value)}
                                placeholder="Link to more info"
                                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/30"
                              />
                              <button
                                type="button"
                                onClick={() => removeProject(projectIndex)}
                                className="self-start rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:bg-white/20"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="space-y-6">
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
                            placeholder="Add a skill"
                            className="w-48 rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/30"
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
                        {form.skills.length === 0 && (
                          <p className="text-xs text-white/60">Tag yourself so people know who to ping.</p>
                        )}
                        {form.skills.map((skill) => (
                          <button
                            key={`skill-${skill}`}
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
                            className="w-48 rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/30"
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
                        {form.interests.length === 0 && (
                          <p className="text-xs text-white/60">Great for people looking to jam on similar topics.</p>
                        )}
                        {form.interests.map((interest) => (
                          <button
                            key={`interest-${interest}`}
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

                    <div className="space-y-3">
                      <header className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Dream meetings</h3>
                        <button
                          type="button"
                          onClick={addWishlistItem}
                          className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 transition hover:bg-white/20"
                        >
                          Add wish
                        </button>
                      </header>
                      <div className="space-y-3">
                        {form.meetingWishlist.length === 0 && (
                          <p className="text-xs text-white/60">
                            Pick a person or org you would love an introduction to.
                          </p>
                        )}
                        {form.meetingWishlist.map((item, wishlistIndex) => (
                          <div
                            key={`wishlist-${wishlistIndex}`}
                            className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-white/80"
                          >
                            <div className="flex flex-col gap-3">
                              <input
                                value={item.title ?? ''}
                                onChange={(event) => updateWishlist(wishlistIndex, 'title', event.target.value)}
                                placeholder="Who do you want to meet?"
                                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/30"
                              />
                              <textarea
                                value={item.description ?? ''}
                                onChange={(event) => updateWishlist(wishlistIndex, 'description', event.target.value)}
                                placeholder="Why would this intro be magic?"
                                className="min-h-[80px] rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-400/30"
                              />
                              <button
                                type="button"
                                onClick={() => removeWishlist(wishlistIndex)}
                                className="self-start rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:bg-white/20"
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
                            placeholder="Add something memorable"
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
                          <p className="text-xs text-white/60">Little details spark conversations at the summit.</p>
                        )}
                        {form.funFacts.map((fact) => (
                          <button
                            key={`fun-${fact}`}
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
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-white/60">
                  {draftError && <span className="text-rose-300">{draftError}</span>}
                  {draftMessage && <span className="text-teal-200">{draftMessage}</span>}
                </div>
                <div className="flex items-center gap-3">
                  {wizardStep > 0 && (
                    <button
                      type="button"
                      onClick={handleRetreatStep}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:bg-white/10"
                    >
                      Back
                    </button>
                  )}
                  {wizardStep < totalSteps - 1 && (
                    <button
                      type="button"
                      onClick={handleAdvanceStep}
                      className="rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900 shadow-lg shadow-teal-500/30 transition hover:from-teal-300 hover:via-cyan-300 hover:to-blue-300"
                    >
                      Next step
                    </button>
                  )}
                  {wizardStep === totalSteps - 1 && (
                    <button
                      type="submit"
                      disabled={isSubmittingDraft}
                      className="rounded-full bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-purple-500/30 transition hover:from-blue-300 hover:via-indigo-300 hover:to-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmittingDraft ? 'Saving…' : activeModal.mode === 'edit' ? 'Update profile' : 'Go live'}
                    </button>
                  )}
                </div>
              </div>

              {session && (
                <div className="mt-4 text-right">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40 transition hover:text-white/70"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {activeModal?.type === 'submitted' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xl">
          <div className="relative w-full max-w-md rounded-3xl border border-amber-400/40 bg-gradient-to-br from-white/10 via-white/5 to-slate-950/70 p-8 text-white shadow-2xl">
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Close"
            >
              ×
            </button>

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amber-200">
                  Draft submitted
                </span>
                <h2 className="text-2xl font-semibold text-white">We&apos;ve got your profile</h2>
                <p className="text-sm text-white/70">
                  Your draft is now with the team. Once it&apos;s approved, it will appear publicly in the directory. You can still view or edit your draft while it&apos;s under review.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {pendingProfileIndex !== -1 && (
                  <button
                    type="button"
                    onClick={() => setActiveModal({ type: 'profile', index: pendingProfileIndex })}
                    className="flex-1 rounded-full border border-amber-300/40 bg-amber-400/20 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-amber-100 transition hover:bg-amber-400/30"
                  >
                    View your draft
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:bg-white/10"
                >
                  Back to directory
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
