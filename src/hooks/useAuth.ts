import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

/**
 * Hook to initialize auth and load profile.
 * Safe for React StrictMode — auth subscription is singleton.
 */
export function useAuth() {
  const initAuth = useAuthStore((state) => state.initAuth);
  const refreshProfile = useAuthStore((state) => state.refreshProfile);
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const loading = useAuthStore((state) => state.loading);
  const initialized = useAuthStore((state) => state.initialized);
  const signOut = useAuthStore((state) => state.signOut);

  // Initialize auth listener ONCE (singleton in store)
  useEffect(() => {
    const cleanup = initAuth();
    return cleanup;
  }, [initAuth]);

  // Load profile AFTER user is set (outside onAuthStateChange callback)
  useEffect(() => {
    if (user && !profile) {
      refreshProfile();
    }
  }, [user, profile, refreshProfile]);

  return { user, profile, loading, initialized, signOut };
}

export default useAuth;
