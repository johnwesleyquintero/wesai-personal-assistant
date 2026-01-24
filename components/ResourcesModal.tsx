import React, { memo } from 'react';
import {
  FaXmark,
  FaRocket,
  FaLightbulb,
  FaBook,
  FaCheck,
  FaShieldHalved,
  FaGavel,
} from 'react-icons/fa6';

export type ResourceType =
  | 'getting-started'
  | 'best-practices'
  | 'privacy-policy'
  | 'terms-of-service';

interface ResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ResourceType;
}

export const ResourcesModal: React.FC<ResourcesModalProps> = memo(({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  const content = {
    'getting-started': {
      title: 'Getting Started',
      icon: <FaRocket className="w-5 h-5 text-app-accent" />,
      iconBg: 'bg-app-accent-soft',
      sections: [
        {
          title: 'Welcome to WesAI',
          description: 'Your professional workspace for building and optimizing AI agents.',
          steps: [
            'Configure your Gemini API key in the settings.',
            'Use the Chat Assistant for quick queries and creative writing.',
            'Explore the Code Studio for technical reviews and refactoring.',
            'Build and manage specialized AI agents in the Agents panel.',
          ],
        },
        {
          title: 'Key Features',
          description: 'Everything you need in one place.',
          steps: [
            'Real-time streaming responses from Gemini 2.0.',
            'Integrated code editor with syntax highlighting.',
            'Persistent chat sessions with local storage.',
            'Dark and light mode for optimal comfort.',
          ],
        },
      ],
    },
    'best-practices': {
      title: 'Best Practices',
      icon: <FaLightbulb className="w-5 h-5 text-app-accent" />,
      iconBg: 'bg-app-accent-soft',
      sections: [
        {
          title: 'Effective Prompting',
          description: 'Get the best results from your AI interactions.',
          steps: [
            'Be specific and provide context in your prompts.',
            'Use system instructions to define agent personalities.',
            'Break complex tasks into smaller, manageable steps.',
            'Provide examples of the desired output format.',
          ],
        },
        {
          title: 'Performance & Safety',
          description: 'Maintain a secure and efficient workspace.',
          steps: [
            'Regularly update your custom agent instructions.',
            'Keep your API keys secure and never share them.',
            'Use the Code Studio to verify AI-generated code.',
            'Monitor your session usage and clean up old chats.',
          ],
        },
      ],
    },
    'privacy-policy': {
      title: 'Privacy Policy',
      icon: <FaShieldHalved className="w-5 h-5 text-app-accent" />,
      iconBg: 'bg-app-accent-soft',
      sections: [
        {
          title: 'Data Privacy',
          description: 'How we handle your data and maintain your privacy.',
          steps: [
            'All chat history and agent data are stored locally in your browser.',
            'We do not store your API keys on our servers.',
            'Data is only transmitted to Gemini API for processing.',
            'Your local data remains private and is never shared with third parties.',
          ],
        },
        {
          title: 'Gemini API Usage',
          description: 'Information regarding the use of external AI services.',
          steps: [
            'Interactions with AI models are subject to Google Gemini API terms.',
            'Ensure you review Google Privacy Policy for API data handling.',
            'We recommend not sharing sensitive personal information in prompts.',
            'You can clear your local storage at any time to remove all data.',
          ],
        },
      ],
    },
    'terms-of-service': {
      title: 'Terms of Service',
      icon: <FaGavel className="w-5 h-5 text-app-accent" />,
      iconBg: 'bg-app-accent-soft',
      sections: [
        {
          title: 'Usage Terms',
          description: 'Guidelines for using the WesAI personal assistant.',
          steps: [
            'WesAI is provided for professional and personal productivity.',
            'Users are responsible for the content they generate and share.',
            'Prohibited use includes any illegal or harmful activities.',
            'We reserve the right to update these terms as the platform evolves.',
          ],
        },
        {
          title: 'Limitations of Liability',
          description: 'Important legal notices regarding tool usage.',
          steps: [
            'AI outputs should be verified for accuracy and safety.',
            'We are not liable for decisions made based on AI-generated content.',
            'The tool is provided "as is" without warranties of any kind.',
            'Use of the Gemini API is subject to its own service limitations.',
          ],
        },
      ],
    },
  }[type];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm dark:bg-app-main/80 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-app-main p-0 shadow-2xl border border-app-border flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 mx-4 max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-app-border bg-app-secondary/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 ${content.iconBg} rounded-lg`}>{content.icon}</div>
            <h2 className="text-xl font-bold text-app-text">{content.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-app-muted hover:text-app-text transition-colors rounded-full hover:bg-app-tertiary active:scale-95"
            aria-label="Close modal"
          >
            <FaXmark className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {content.sections.map((section, idx) => (
            <div key={idx} className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-app-text flex items-center gap-2">
                  <FaBook className="w-4 h-4 text-app-accent" />
                  {section.title}
                </h3>
                <p className="text-sm text-app-muted">{section.description}</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {section.steps.map((step, sIdx) => (
                  <div
                    key={sIdx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-app-secondary border border-app-border group hover:border-app-accent/30 transition-colors"
                  >
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-app-accent-soft flex items-center justify-center">
                      <FaCheck className="w-2.5 h-2.5 text-app-accent" />
                    </div>
                    <p className="text-sm text-app-text leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-app-border bg-app-secondary/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-app-accent hover:opacity-90 text-white text-sm font-bold rounded-xl shadow-lg shadow-app-accent/25 transition-all hover:-translate-y-0.5 active:scale-95"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
});

ResourcesModal.displayName = 'ResourcesModal';
