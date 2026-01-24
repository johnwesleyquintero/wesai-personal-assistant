import React, { useState, useEffect, useRef } from 'react';
import WesAILogo from './components/WesAILogo';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

interface GoogleSignInResponse {
  credential?: string;
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleSignInResponse) => void;
            use_fedcm_for_prompt?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: { theme: string; size: string; width?: number },
          ) => void;
        };
      };
    };
  }
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: '408818190066-ku10cb8afqouo3qbiij131gbeqqs9lqu.apps.googleusercontent.com',
          callback: handleCredentialResponse,
          use_fedcm_for_prompt: true,
        });
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: googleButtonRef.current.offsetWidth,
        });
      }
    };

    const handleCredentialResponse = (_response: GoogleSignInResponse) => {
      try {
        setIsLoading(true);
        // In a local-only app, we just accept the credential
        // and mark the user as logged in.
        // We could decode the JWT to get user info if needed.
        localStorage.setItem('isLoggedIn', 'true');
        onLoginSuccess();
      } catch (err) {
        console.error('Login failed:', err);
        setError('Google Sign-In failed. Please try again.');
        setIsLoading(false);
      }
    };

    // Check if script is already loaded
    if (window.google) {
      initializeGoogleSignIn();
    } else {
      // Wait for script to load if it's not ready
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          initializeGoogleSignIn();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [onLoginSuccess]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-app-main">
        <p className="text-xl text-app-text">Loading...</p>
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
              className="animate-pulse [animation-delay:0.5s]"
            />
            <path
              d="M15,70 L35,65 L55,75 L75,70"
              stroke="url(#network-gradient)"
              strokeWidth="0.5"
              fill="none"
              className="animate-pulse [animation-delay:1s]"
            />
          </svg>

          {/* Gradient Orbs */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500 to-transparent rounded-full opacity-10 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-purple-500 to-transparent rounded-full opacity-10 blur-3xl animate-pulse [animation-delay:2s]" />
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
            The ultimate platform to build, deploy, and optimize your AI agents. Streamline complex
            workflows and automate your productivity with custom-built intelligence.
          </p>

          {/* Feature Cards */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-gray-200">Custom AI Agent Builder (Markdown-ready)</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse [animation-delay:0.5s]" />
              <span className="text-gray-200">Advanced Workflow Optimization</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse [animation-delay:1s]" />
              <span className="text-gray-200">Privacy-First, Local-Only Data Storage</span>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <p className="text-white font-medium mb-2">Private & Local</p>
            <p className="text-gray-300 text-sm">
              Your conversations are stored only on your device. Complete privacy, no cloud
              required.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="md:w-1/2 flex items-center justify-center p-8 bg-app-secondary">
        <div className="w-full max-w-md space-y-8 bg-app-main shadow-2xl rounded-3xl p-10 border border-app-border">
          <header className="text-center">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 py-2 uppercase tracking-tighter">
              Enter Workspace
            </h2>
            <p className="text-app-muted mt-2 font-medium">Sign in to build and optimize</p>
          </header>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p
                className="text-sm text-red-600 dark:text-red-400 text-center font-bold"
                role="alert"
              >
                {error}
              </p>
            </div>
          )}

          <div className="flex flex-col items-center justify-center space-y-6">
            <div
              ref={googleButtonRef}
              className="w-full flex justify-center p-1 bg-app-tertiary rounded-xl border border-app-border hover:border-app-accent/30 transition-all"
            />
            <p className="text-[10px] text-app-muted uppercase tracking-[0.2em] font-black">
              Secure Google Authentication
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
