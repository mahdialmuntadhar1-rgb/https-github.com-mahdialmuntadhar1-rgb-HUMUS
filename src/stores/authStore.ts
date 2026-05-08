import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import type { AuthResponse, User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: 'user' | 'business_owner' | 'admin';
  avatar_url?: string;
}

type SignUpMetadata = {
  full_name?: string;
  role?: 'user' | 'business_owner' | 'admin';
  business_name?: string;
  phone?: string;
  governorate?: string;
  category?: string;
  city?: string;
  description?: string;
};

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  signIn: (email: string, password: string) => Promise<AuthResponse['data']>;
  signUp: (email: string, password: string, metadata?: SignUpMetadata) => Promise<AuthResponse['data']>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  initAuth: () => () => void;
}

// Module-level singleton state survives React StrictMode and multiple useAuth callers.
let subscription: { unsubscribe: () => void } | null = null;
let initConsumers = 0;
let profileRequest: Promise<void> | null = null;


export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    set({ user: data.user ?? null, profile: null, loading: false, initialized: true });
    return data;
  },

  signUp: async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    if (error) throw error;
    if (data.user) {
      set({ user: data.user, profile: null, loading: false, initialized: true });
    }
    return data;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, loading: false, initialized: true });
  },

  refreshProfile: async () => {
    const user = get().user;
    if (!user) {
      set({ profile: null });
      return;
    }

    if (profileRequest) return profileRequest;

    profileRequest = (async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!error && data && get().user?.id === user.id) {
          set({ profile: data as Profile });
        }
      } catch (err) {
        console.error('[AuthStore] Profile fetch error:', err);
      } finally {
        profileRequest = null;
      }
    })();

    return profileRequest;
  },

  initAuth: () => {
    initConsumers += 1;

    if (subscription) {
      return () => {
        initConsumers = Math.max(0, initConsumers - 1);
        if (initConsumers === 0 && subscription) {
          subscription.unsubscribe();
          subscription = null;
        }
      };
    }

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      const previousUserId = get().user?.id;
      set({
        user,
        loading: false,
        initialized: true,
        profile: user && previousUserId === user.id ? get().profile : null,
      });
    });

    subscription = data.subscription;

    return () => {
      initConsumers = Math.max(0, initConsumers - 1);
      if (initConsumers === 0 && subscription) {
        subscription.unsubscribe();
        subscription = null;
      }
    };
  },
}));
