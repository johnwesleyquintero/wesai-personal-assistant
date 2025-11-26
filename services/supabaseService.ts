import { createClient } from '@supabase/supabase-js';
import { getEnvVariable } from '../utils/env';
import type { Database } from '../types'; // Import the Database type

const supabaseUrl = getEnvVariable('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVariable('VITE_SUPABASE_ANON_KEY');

let supabase: ReturnType<typeof createClient<Database>> | null = null; // Use Database type

export const initializeSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key is not set in environment variables.');
    return;
  }
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey); // Pass Database type
};

export const getSupabaseClient = () => {
  if (!supabase) {
    initializeSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
  }
  return supabase;
};

export const signInWithGoogle = async () => {
  const { error } = await getSupabaseClient().auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) {
    console.error('Error signing in with Google:', error.message);
    throw error;
  }
};

export const signOut = async () => {
  const { error } = await getSupabaseClient().auth.signOut();
  if (error) {
    console.error('Error signing out:', error.message);
    throw error;
  }
};

export const getSession = async () => {
  const { data, error } = await getSupabaseClient().auth.getSession();
  if (error) {
    console.error('Error getting session:', error.message);
    return null;
  }
  return data.session;
};
