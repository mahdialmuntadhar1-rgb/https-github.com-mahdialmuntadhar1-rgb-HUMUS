import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase: any = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(
    supabaseUrl, 
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      }
    }
  )
} else {
  console.error('🔴 Supabase credentials are missing. Please check your environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).')
  console.error('Current env vars:', {
    VITE_SUPABASE_URL: supabaseUrl ? 'SET' : 'MISSING',
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'SET' : 'MISSING'
  })
}

export { supabase }

// Auth helpers
export const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Please check your environment variables.')
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Please check your environment variables.')
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Please check your environment variables.')
  }
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Please check your environment variables.')
  }
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  if (!supabase) {
    console.error('Supabase client is not initialized. Please check your environment variables.')
    return { data: { subscription: null } }
  }
  return supabase.auth.onAuthStateChange(callback)
}
