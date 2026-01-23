import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';
import { PreWithCopyButton } from './PreWithCopyButton.tsx';

export interface CustomCodeRendererProps {
  node?: unknown;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const MarkdownCodeRenderer = ({
  node: _node,
  inline,
  className,
  children,
  ...rest
}: CustomCodeRendererProps) => {
  const match = /language-(\w+)/.exec(className || '');
  if (!inline && match) {
    return (
      <SyntaxHighlighter
        style={oneDark}
        language={match[1]}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: '1.25rem',
          background: 'transparent',
          fontSize: '0.85rem',
          lineHeight: '1.6',
        }}
        {...rest}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    );
  }
  return (
    <code className={className} {...rest}>
      {children}
    </code>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const markdownComponents: Components = {
  pre: PreWithCopyButton,
  code: MarkdownCodeRenderer,
};
