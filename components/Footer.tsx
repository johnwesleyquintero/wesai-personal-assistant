import React, { memo } from 'react';
import { FaGithub, FaGoogle, FaRobot, FaMessage, FaCode } from 'react-icons/fa6';
import { WesAILogo } from './WesAILogo';
import type { ActiveTab } from '../types';
import type { ResourceType } from './ResourcesModal';

interface FooterProps {
  onTabChange?: (tabId: ActiveTab) => void;
  onOpenResources?: (type: ResourceType) => void;
}

export const Footer: React.FC<FooterProps> = memo(({ onTabChange, onOpenResources }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-app-main border-t border-app-border pt-12 pb-8 px-6 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-4 col-span-1">
            <WesAILogo size="medium" />
            <p className="text-sm text-app-muted leading-relaxed max-w-sm">
              The ultimate professional workspace for building, deploying, and optimizing AI agents.
              Powered by Gemini.
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="https://github.com/johnwesleyquintero/wesai-personal-assistant"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-app-secondary text-app-muted rounded-xl hover:text-app-accent transition-all border border-transparent hover:border-app-accent/30 shadow-sm active:scale-95"
              >
                <FaGithub className="w-5 h-5" />
              </a>
              <a
                href="https://aistudio.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-app-secondary text-app-muted rounded-xl hover:text-app-accent transition-all border border-transparent hover:border-app-accent/30 shadow-sm active:scale-95"
              >
                <FaGoogle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-app-text">Workspace</h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => onTabChange?.('chat')}
                  className="flex items-center gap-2 text-sm text-app-muted hover:text-app-accent transition-colors"
                >
                  <FaMessage className="w-3.5 h-3.5" />
                  Chat Assistant
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange?.('content')}
                  className="flex items-center gap-2 text-sm text-app-muted hover:text-app-accent transition-colors"
                >
                  <FaCode className="w-3.5 h-3.5" />
                  Code Studio
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange?.('ai-agents')}
                  className="flex items-center gap-2 text-sm text-app-muted hover:text-app-accent transition-colors"
                >
                  <FaRobot className="w-3.5 h-3.5" />
                  Agent Builder
                </button>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-app-text">Resources</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://ai.google.dev/gemini-api/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-app-muted hover:text-app-accent transition-colors"
                >
                  Gemini API Docs
                </a>
              </li>
              <li>
                <button
                  onClick={() => onOpenResources?.('getting-started')}
                  className="text-sm text-app-muted hover:text-app-accent transition-colors"
                >
                  Getting Started
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenResources?.('best-practices')}
                  className="text-sm text-app-muted hover:text-app-accent transition-colors"
                >
                  Best Practices
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-app-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-app-muted opacity-70">
            © {currentYear} WesAI. Built with precision for professional workflows.
          </p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => onOpenResources?.('privacy-policy')}
              className="text-[10px] font-black uppercase tracking-widest text-app-muted hover:text-app-accent transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onOpenResources?.('terms-of-service')}
              className="text-[10px] font-black uppercase tracking-widest text-app-muted hover:text-app-accent transition-colors"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
});
