import React from 'react';
import { FaXmark } from 'react-icons/fa6';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-css';
import 'prismjs/themes/prism-tomorrow.css';

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onClearInput: () => void;
  onSubmit?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const CodeInput: React.FC<CodeInputProps> = ({
  value,
  onChange,
  onClearInput,
  onSubmit,
  disabled,
  placeholder,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (onSubmit && value.trim() && !disabled) {
        onSubmit();
      }
    }
  };

  return (
    <div className="relative w-full h-full group bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-inner focus-within:ring-2 focus-within:ring-blue-500/20 dark:focus-within:ring-blue-400/20 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-all duration-200 ease-in-out overflow-hidden">
      <div className="w-full h-full overflow-y-auto custom-scrollbar p-1">
        <Editor
          value={value}
          onValueChange={onChange}
          highlight={(code) => highlight(code, languages.tsx, 'tsx')}
          padding={16}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className="font-mono text-sm min-h-full"
          style={{
            fontFamily: '"Fira Code", "Fira Mono", monospace',
            fontSize: 14,
            outline: 'none',
          }}
          textareaId="codeInput"
          aria-label="Code input"
        />
      </div>
      <div className="absolute bottom-3 right-4 pointer-events-none opacity-0 group-focus-within:opacity-40 transition-opacity duration-300">
        <kbd className="px-2 py-1 text-[10px] font-sans font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-sm">
          Ctrl + Enter
        </kbd>
      </div>
      {value && !disabled && (
        <button
          onClick={onClearInput}
          title="Clear code input"
          aria-label="Clear code input field"
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 z-10"
        >
          <FaXmark className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
