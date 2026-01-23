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
    <footer className="w-full bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-12 pb-8 px-6 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-4 col-span-1">
            <WesAILogo size="medium" />
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
              The ultimate professional workspace for building, deploying, and optimizing AI agents.
              Powered by Gemini.
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="https://github.com/johnwesleyquintero/wesai-personal-assistant"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl hover:text-purple-600 dark:hover:text-purple-400 transition-all border border-transparent hover:border-purple-100 dark:hover:border-purple-900/30 shadow-sm"
              >
                <FaGithub className="w-5 h-5" />
              </a>
              <a
                href="https://aistudio.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl hover:text-purple-600 dark:hover:text-purple-400 transition-all border border-transparent hover:border-purple-100 dark:hover:border-purple-900/30 shadow-sm"
              >
                <FaGoogle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white">
              Workspace
            </h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => onTabChange?.('chat')}
                  className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  <FaMessage className="w-3.5 h-3.5" />
                  Chat Assistant
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange?.('content')}
                  className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  <FaCode className="w-3.5 h-3.5" />
                  Code Studio
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange?.('ai-agents')}
                  className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  <FaRobot className="w-3.5 h-3.5" />
                  Agent Builder
                </button>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white">
              Resources
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://ai.google.dev/gemini-api/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Gemini API Docs
                </a>
              </li>
              <li>
                <button
                  onClick={() => onOpenResources?.('getting-started')}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Getting Started
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenResources?.('best-practices')}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Best Practices
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500">
            © {currentYear} WesAI. Built with precision for professional workflows.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-purple-500 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-purple-500 transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
});
