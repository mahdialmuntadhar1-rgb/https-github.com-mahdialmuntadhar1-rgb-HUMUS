import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: 'user' | 'business_owner' | 'admin';
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  initAuth: () => () => void;
}

// Module-level singleton state — survives React StrictMode
let subscription: { unsubscribe: () => void } | null = null;
let isInitializing = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  refreshProfile: async () => {
    const user = get().user;
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (!error && data) {
        set({ profile: data as Profile });
      }
    } catch (err) {
      console.error('[AuthStore] Profile fetch error:', err);
    }
  },

  initAuth: () => {
    // Prevent double-init in StrictMode — idempotent
    if (isInitializing) {
      return () => {};
    }
    isInitializing = true;

    // Clean up any stale subscription
    if (subscription) {
      subscription.unsubscribe();
      subscription = null;
    }

    // Subscribe ONCE. Callback must be SYNCHRONOUS — no awaits inside.
    const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const user = session?.user ?? null;
        set({ user, loading: false, initialized: true });
        if (!user) {
          set({ profile: null });
        }
      }
    );

    subscription = sub;

    // Return cleanup
    return () => {
      if (subscription) {
        subscription.unsubscribe();
        subscription = null;
      }
      isInitializing = false;
    };
  },
}));
