import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const { user, profile, setUser, setProfile, signOut: clearStore } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    console.log('[PROFILE] Fetching profile for user:', userId);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[PROFILE] Error fetching profile:', error);
        
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create it with required fields
          console.log('[PROFILE] Profile not found, creating fallback profile');
          
          // Get user email from auth
          const { data: { user } } = await supabase.auth.getUser();
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{ 
              id: userId, 
              email: user?.email || '',
              role: 'user',
              created_at: new Date().toISOString() 
            }])
            .select()
            .single();
          
          if (!createError) {
            console.log('[PROFILE] Fallback profile created successfully');
            setProfile(newProfile);
          } else {
            console.error('[PROFILE] Error creating fallback profile:', createError);
          }
        } else {
          throw error;
        }
      } else {
        console.log('[PROFILE] Profile fetched successfully');
        setProfile(data);
      }
    } catch (err) {
      console.error('[PROFILE] Unexpected error:', err);
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    console.log('[SIGNUP] Starting signup process', { email, metadata });
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    
    if (error) {
      console.error('[SIGNUP] Supabase auth error:', error);
      throw error;
    }
    
    console.log('[SIGNUP] Supabase auth success:', { 
      user: !!data.user, 
      session: !!data.session,
      userId: data.user?.id 
    });
    
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    clearStore();
  };

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user
  };
}
