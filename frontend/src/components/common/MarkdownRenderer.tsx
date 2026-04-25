import React from 'react';
import MarkdownToJsx from 'markdown-to-jsx';

interface MarkdownRendererProps {
  children: string | null | undefined;
  className?: string;
  /**
   * Force `markdown-to-jsx` to wrap the root in a block element (`<p>`)
   * even when the input is a single inline run of text. Without this,
   * a bare string like `"quote text"` is emitted as a `<span>`, which
   * causes any consumer styling `.foo p {}` to miss entirely — the
   * text then falls through to the wrapper `<div>`'s inherited styles
   * (sans-serif font, wrong color, etc.). Default false to preserve
   * existing behavior in call sites that want inline rendering.
   */
  forceBlock?: boolean;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  children,
  className = '',
  forceBlock = false,
}) => {
  if (!children) {
    return null;
  }

  return (
    <div className={className}>
      <MarkdownToJsx
        options={{
          forceBlock,
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