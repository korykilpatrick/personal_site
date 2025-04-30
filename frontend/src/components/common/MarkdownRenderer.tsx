import React from 'react';
import MarkdownToJsx from 'markdown-to-jsx';

interface MarkdownRendererProps {
  children: string | null | undefined;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ children, className = '' }) => {
  if (!children) {
    return null;
  }

  return (
    <div className={className}>
      <MarkdownToJsx
        options={{
          overrides: {
            a: {
              // Force all <a> rendered via markdown to open in new tabs
              component: ({ children, ...props }) => {
                return (
                  <a
                    {...props}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                );
              },
            },
          },
        }}
      >
        {children}
      </MarkdownToJsx>
    </div>
  );
};

export default MarkdownRenderer;