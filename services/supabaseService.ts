import { createClient } from '@supabase/supabase-js';
import { getEnvVariable } from '../utils/env';
import type { Database } from '../types'; // Import the Database type
import type { AuthError } from '@supabase/supabase-js';

const supabaseUrl = getEnvVariable('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVariable('VITE_SUPABASE_ANON_KEY');

let supabase: ReturnType<typeof createClient<Database>> | null = null; // Use Database type

// --- CENTRALIZED ERROR HANDLING ---
const handleSupabaseError = (error: unknown, context: string): Error => {
  console.error(`[Supabase Service] Error in ${context}:`, error);

  const e = error as
    | { message?: string; status?: number; code?: string; name?: string }
    | AuthError
    | Error
    | unknown;

  const message = (() => {
    if (typeof e === 'object' && e && 'message' in e && typeof e.message === 'string') {
      return e.message.toLowerCase();
    }
    return '';
  })();

  const code = (() => {
    if (typeof e === 'object' && e && 'code' in e && typeof e.code === 'string') {
      return e.code;
    }
    return '';
  })();

  const status = (() => {
    if (typeof e === 'object' && e && 'status' in e && typeof e.status === 'number') {
      return e.status;
    }
    return undefined;
  })();

  // 1. Network/Connection Issues
  if (message.includes('network') || message.includes('connection') || message.includes('fetch')) {
    return new Error(
      'Unable to connect to authentication service. Please check your internet connection.',
      {
        cause: error,
      },
    );
  }

  // 2. Authentication Errors
  if (
    message.includes('invalid login') ||
    message.includes('invalid credentials') ||
    code === 'invalid_credentials'
  ) {
    return new Error('Invalid login credentials. Please check your email and password.', {
      cause: error,
    });
  }

  if (message.includes('user not found') || code === 'user_not_found') {
    return new Error(
      'Account not found. Please check your email address or sign up for a new account.',
      {
        cause: error,
      },
    );
  }

  if (message.includes('email not confirmed') || code === 'email_not_confirmed') {
    return new Error(
      'Please confirm your email address before signing in. Check your email for a confirmation link.',
      {
        cause: error,
      },
    );
  }

  // 3. OAuth/Provider Errors
  if (message.includes('oauth') || message.includes('provider') || code?.includes('oauth')) {
    return new Error(
      'Authentication provider error. Please try again or use a different sign-in method.',
      {
        cause: error,
      },
    );
  }

  // 4. Rate Limiting
  if (status === 429 || message.includes('rate limit') || code === 'too_many_requests') {
    return new Error('Too many sign-in attempts. Please wait a moment and try again.', {
      cause: error,
    });
  }

  // 5. Server Errors
  if (status && status >= 500) {
    return new Error(
      'Authentication service is temporarily unavailable. Please try again in a few moments.',
      {
        cause: error,
      },
    );
  }

  // 6. Session/Token Issues
  if (
    message.includes('jwt') ||
    message.includes('token') ||
    message.includes('session') ||
    code?.includes('jwt')
  ) {
    return new Error('Your session has expired. Please sign in again.', {
      cause: error,
    });
  }

  // 7. Generic Fallback
  return new Error(
    `Authentication request failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
    { cause: error },
  );
};

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
  try {
    const { error } = await getSupabaseClient().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      throw handleSupabaseError(error, 'Google OAuth sign-in');
    }
  } catch (error) {
    throw handleSupabaseError(error, 'Google OAuth sign-in');
  }
};

export const signOut = async () => {
  try {
    const { error } = await getSupabaseClient().auth.signOut();
    if (error) {
      throw handleSupabaseError(error, 'sign-out');
    }
  } catch (error) {
    throw handleSupabaseError(error, 'sign-out');
  }
};

export const getSession = async () => {
  try {
    const { data, error } = await getSupabaseClient().auth.getSession();
    if (error) {
      throw handleSupabaseError(error, 'get session');
    }
    return data.session;
  } catch (error) {
    throw handleSupabaseError(error, 'get session');
  }
};
