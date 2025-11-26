import React from 'react';
import { ClearIcon } from './icons/ClearIcon';

interface CodeInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onClearInput: () => void; // Added for clear button
  disabled?: boolean;
  placeholder?: string;
}

export const CodeInput: React.FC<CodeInputProps> = ({
  value,
  onChange,
  onClearInput,
  disabled,
  placeholder,
}) => {
  return (
    <div className="relative w-full">
      <textarea
        id="codeInput"
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={15}
        className="w-full p-4 pr-10 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 font-mono text-sm transition-colors duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
        placeholder={placeholder}
        aria-label="Code input"
      />
      {value && !disabled && (
        <button
          onClick={onClearInput}
          title="Clear code input"
          aria-label="Clear code input field"
          className="absolute top-2.5 right-2.5 p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <ClearIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
