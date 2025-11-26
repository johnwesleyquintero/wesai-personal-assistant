import React, { useState, useEffect } from 'react';
import { signInWithGoogle, getSession, getSupabaseClient } from './services/supabaseService';
import WesAILogo from './components/WesAILogo';

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
      <div className="md:w-1/2 flex flex-col justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating AI Particles */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-400 rounded-full opacity-40 animate-bounce" />
          <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-pink-400 rounded-full opacity-80 animate-ping" />
          <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-cyan-400 rounded-full opacity-50 animate-pulse" />

          {/* Neural Network Lines */}
          <svg
            className="absolute inset-0 w-full h-full opacity-20"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="network-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#EC4899" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <path
              d="M10,10 L30,25 L50,15 L70,30 L90,20"
              stroke="url(#network-gradient)"
              strokeWidth="0.5"
              fill="none"
              className="animate-pulse"
            />
            <path
              d="M20,40 L40,35 L60,45 L80,40"
              stroke="url(#network-gradient)"
              strokeWidth="0.5"
              fill="none"
              className="animate-pulse"
              style={{ animationDelay: '0.5s' }}
            />
            <path
              d="M15,70 L35,65 L55,75 L75,70"
              stroke="url(#network-gradient)"
              strokeWidth="0.5"
              fill="none"
              className="animate-pulse"
              style={{ animationDelay: '1s' }}
            />
          </svg>

          {/* Gradient Orbs */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500 to-transparent rounded-full opacity-10 blur-3xl animate-pulse" />
          <div
            className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-purple-500 to-transparent rounded-full opacity-10 blur-3xl animate-pulse"
            style={{ animationDelay: '2s' }}
          />
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          {/* WesAI Logo */}
          <div className="mb-8">
            <div className="relative mb-6">
              {/* Glowing background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl animate-pulse" />

              {/* Logo with enhanced styling */}
              <div className="relative">
                <WesAILogo size="large" className="drop-shadow-2xl" />
              </div>
            </div>
          </div>

          <p className="text-xl mb-8 leading-relaxed text-gray-200">
            Your AI co-pilot for strategy, creativity, and operations. Transform complexity into
            actionable insights and streamline your workflow like a pro.
          </p>

          {/* Feature Cards */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-gray-200">Executive-level decision support</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <div
                className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"
                style={{ animationDelay: '0.5s' }}
              />
              <span className="text-gray-200">Creative ideation & content assistance</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <div
                className="w-3 h-3 bg-pink-400 rounded-full animate-pulse"
                style={{ animationDelay: '1s' }}
              />
              <span className="text-gray-200">Seamless operational guidance</span>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <p className="text-white font-medium mb-2">🚀 Now with Cloud Storage</p>
            <p className="text-gray-300 text-sm">
              Your conversations sync across all devices. Never lose your insights again.
            </p>
          </div>
        </div>
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
