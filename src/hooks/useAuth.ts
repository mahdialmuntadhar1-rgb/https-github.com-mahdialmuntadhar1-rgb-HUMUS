import { useState, useCallback } from 'react';
import { supabase, signUp, signIn, signOut, getCurrentUser, onAuthStateChange } from '@/services/supabase';

export interface AuthUser {
  id: string;
  email: string;
  role?: string;
  full_name?: string;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      const { user, error } = await getCurrentUser();
      if (error) throw error;
      
      setAuthState({
        user: user ? {
          id: user.id,
          email: user.email!,
          role: user.user_metadata?.role,
          full_name: user.user_metadata?.full_name
        } : null,
        loading: false,
        error: null
      });
    } catch (err) {
      setAuthState({
        user: null,
        loading: false,
        error: err instanceof Error ? err.message : 'Auth initialization failed'
      });
    }
  }, []);

  // Sign up
  const signUpUser = useCallback(async (email: string, password: string, metadata?: Record<string, any>) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { data, error } = await signUp(email, password, metadata);
      if (error) throw error;
      
      if (data.user) {
        setAuthState({
          user: {
            id: data.user.id,
            email: data.user.email!,
            role: data.user.user_metadata?.role,
            full_name: data.user.user_metadata?.full_name
          },
          loading: false,
          error: null
        });
      }
      
      return { success: true, data };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Sign up failed';
      setAuthState(prev => ({ ...prev, loading: false, error }));
      return { success: false, error };
    }
  }, []);

  // Sign in
  const signInUser = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { data, error } = await signIn(email, password);
      if (error) throw error;
      
      if (data.user) {
        setAuthState({
          user: {
            id: data.user.id,
            email: data.user.email!,
            role: data.user.user_metadata?.role,
            full_name: data.user.user_metadata?.full_name
          },
          loading: false,
          error: null
        });
      }
      
      return { success: true, data };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Sign in failed';
      setAuthState(prev => ({ ...prev, loading: false, error }));
      return { success: false, error };
    }
  }, []);

  // Sign out
  const signOutUser = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      const { error } = await signOut();
      if (error) throw error;
      
      setAuthState({
        user: null,
        loading: false,
        error: null
      });
      
      return { success: true };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Sign out failed';
      setAuthState(prev => ({ ...prev, loading: false, error }));
      return { success: false, error };
    }
  }, []);

  // Submit business with auth
  const submitBusiness = useCallback(async (businessData: any) => {
    if (!authState.user) {
      return { success: false, error: 'Must be authenticated to submit business' };
    }

    try {
      const { data, error } = await supabase
        .from('businesses')
        .insert([{
          ...businessData,
          submitted_by: authState.user.id,
          moderation_status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;
      
      return { success: true, data };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to submit business' 
      };
    }
  }, [authState.user]);

  // Initialize on mount
  useState(() => {
    initializeAuth();
    
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setAuthState({
          user: {
            id: session.user.id,
            email: session.user.email!,
            role: session.user.user_metadata?.role,
            full_name: session.user.user_metadata?.full_name
          },
          loading: false,
          error: null
        });
      } else if (event === 'SIGNED_OUT') {
        setAuthState({
          user: null,
          loading: false,
          error: null
        });
      }
    });

    return () => subscription.unsubscribe();
  });

  return {
    ...authState,
    signUp: signUpUser,
    signIn: signInUser,
    signOut: signOutUser,
    submitBusiness,
    refresh: initializeAuth
  };
}
