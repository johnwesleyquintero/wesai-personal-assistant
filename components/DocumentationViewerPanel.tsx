import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { PreWithCopyButton } from './PreWithCopyButton.tsx';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export const DocumentationViewerPanel: React.FC = () => {
  const [documentationContent, setDocumentationContent] = useState<string>('');
  const [isDocLoading, setIsDocLoading] = useState<boolean>(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [tocItems, setTocItems] = useState<TocItem[]>([]);

  const extractHeadings = useCallback((markdown: string) => {
    const headings: TocItem[] = [];
    // Regex to find h2 (##) and h3 (###) headings
    const regex = /^(## |### )(.*)$/gm;
    let match;
    while ((match = regex.exec(markdown)) !== null) {
      const level = match[1].startsWith('## ') ? 2 : 3;
      const text = match[2].trim();
      // Simple slug generation for ID. remarkGfm typically handles this automatically for IDs.
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '');
      headings.push({ id, text, level });
    }
    setTocItems(headings);
  }, []);

  const fetchDocumentation = useCallback(async () => {
    if (!documentationContent && !isDocLoading) {
      setIsDocLoading(true);
      setDocError(null);
      setTocItems([]); // Clear TOC when starting new fetch
      try {
        const response = await fetch('/README.md');
        if (!response.ok) {
          throw new Error(
            `Failed to fetch documentation: ${response.statusText} (Status: ${response.status}). Ensure README.md is in the public directory or project root.`,
          );
        }
        const markdown = await response.text();
        setDocumentationContent(markdown);
        extractHeadings(markdown); // Extract headings after content is set
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setDocError(`Error loading documentation: ${errorMessage}`);
        setDocumentationContent('');
        setTocItems([]); // Clear TOC on error
        console.error(err);
      } finally {
        setIsDocLoading(false);
      }
    }
  }, [documentationContent, isDocLoading, extractHeadings]);

  useEffect(() => {
    fetchDocumentation();
  }, [fetchDocumentation]);

  const markdownComponents: Components = {
    // @ts-ignore due to mismatch in react-markdown types for node
    pre: PreWithCopyButton,
  };

  const getFeedbackTitle = () => 'Application Documentation (README):';
  const getLoadingMessage = () => 'Loading documentation...';

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
        {getFeedbackTitle()}
      </h2>

      {/* Table of Contents */}
      {!isDocLoading && !docError && tocItems.length > 0 && (
        <nav className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Table of Contents</h3>
          <ul className="list-none p-0 m-0">
            {tocItems.map((item) => (
              <li key={item.id} className={`${item.level === 3 ? 'ml-4' : ''}`}>
                <a
                  href={`#${item.id}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm py-1 block"
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="bg-gray-50 dark:bg-gray-700 p-4 md:p-6 rounded-lg shadow-inner">
        {isDocLoading && (
          <div className="flex flex-col items-center justify-center p-6">
            <LoadingSpinner />
            <p className="mt-2 text-gray-600 dark:text-gray-300">{getLoadingMessage()}</p>
          </div>
        )}
        {!isDocLoading && docError && documentationContent === '' && (
          <div className="text-red-700 dark:text-red-300 p-4 bg-red-100 dark:bg-red-700/20 rounded-md">
            <strong className="font-semibold">Error:</strong> Could not load documentation.
            {docError.includes('Failed to fetch documentation')
              ? " Please ensure README.md is in your project's public directory or root folder for Vite to serve it correctly."
              : docError}
          </div>
        )}
        {!isDocLoading && !docError && documentationContent && (
          <div
            className="prose prose-sm sm:prose-base max-w-none dark:prose-invert overflow-y-auto max-h-[70vh]
                       prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-slate-800 dark:prose-headings:text-slate-200
                       prose-h1:text-2xl sm:prose-h1:text-3xl prose-h1:mb-4
                       prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3 prose-h2:border-b prose-h2:pb-2 prose-h2:border-slate-200 dark:prose-h2:border-slate-700
                       prose-h3:text-lg sm:prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-2
                       prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed
                       prose-li:text-slate-700 dark:prose-li:text-slate-300 prose-li:my-1
                       prose-strong:text-slate-900 dark:prose-strong:text-slate-100
                       prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:underline prose-a:font-medium
                       prose-blockquote:border-l-4 prose-blockquote:border-blue-500 dark:prose-blockquote:border-blue-400
                       prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-600 dark:prose-blockquote:text-slate-400 prose-blockquote:my-4
                       prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-normal
                       prose-pre:p-4 prose-pre:rounded-lg prose-pre:shadow-sm"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {documentationContent || ''}
            </ReactMarkdown>
          </div>
        )}
        {!isDocLoading && !documentationContent && !docError && (
          <p className="text-gray-500 dark:text-gray-400">
            No documentation content loaded or available.
          </p>
        )}
      </div>
    </div>
  );
};
