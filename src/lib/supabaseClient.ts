import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://vluggajylwzjuyydoluy.supabase.co';
const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsdWdnYWp5bHd6anV5eWRvbHV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NDEwMTcsImV4cCI6MjA3NzUxNzAxN30.TdQsQKmIfIkQinlzXz6jl22cB9Hg00AeYFfBOueaPeM';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.SUPABASE_URL ??
  FALLBACK_URL;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_KEY ??
  FALLBACK_ANON_KEY;

let browserClient: SupabaseClient | undefined;

export const getSupabaseBrowserClient = () => {
  if (typeof window === 'undefined') {
    return createClient(supabaseUrl, supabaseAnonKey);
  }

  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'scholar-matcher-session',
      },
    });
  }

  return browserClient;
};

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;

export type BrowserSupabaseClient = ReturnType<typeof getSupabaseBrowserClient>;
