import React, { useState, useEffect } from 'react';
import { signInWithGoogle, getSession, getSupabaseClient } from './services/supabaseService';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getSession();
        if (session) {
          onLoginSuccess();
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error checking session:', err);
        setError('Failed to check login status.');
        setIsLoading(false);
      }
    };

    checkSession();

    const { data: authListener } = getSupabaseClient().auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        onLoginSuccess();
      }
    });

    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, [onLoginSuccess]);

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred during Google sign-in.',
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-xl text-gray-700 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left: Mini Landing / Hero */}
      <div className="md:w-1/2 flex flex-col justify-center bg-gradient-to-tr from-blue-400 to-purple-600 text-white p-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to WesAI</h1>
        <p className="mb-6 text-lg leading-relaxed">
          Your AI co-pilot for strategy, creativity, and operations. Transform complexity into
          actionable insights and streamline your workflow like a pro.
        </p>
        <ul className="space-y-2 mb-6">
          <li>• Executive-level decision support</li>
          <li>• Creative ideation & content assistance</li>
          <li>• Seamless operational guidance</li>
        </ul>
        <p className="text-sm opacity-80">
          Already have an account? Sign In to get started instantly.
        </p>
      </div>

      {/* Right: Login Form */}
      <div className="md:w-1/2 flex items-center justify-center p-8 bg-gray-100 dark:bg-gray-800">
        <div className="w-full max-w-md space-y-8 bg-gray-50 dark:bg-gray-900 shadow-2xl rounded-lg p-8">
          <header className="text-center">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 py-2">
              Sign In
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Log in to continue</p>
          </header>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 text-center" role="alert">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition duration-150"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              {/* SVG paths */}
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};
