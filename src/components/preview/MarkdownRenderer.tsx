import Markdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    padding: '24px 28px',
    overflowY: 'auto',
    height: '100%',
    fontSize: '14px',
    lineHeight: '1.75',
    color: '#1f2937',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  h1: {
    fontSize: '22px',
    fontWeight: 700,
    marginTop: '32px',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '2px solid #e5e7eb',
    color: '#111827',
  },
  h2: {
    fontSize: '18px',
    fontWeight: 600,
    marginTop: '28px',
    marginBottom: '12px',
    paddingBottom: '6px',
    borderBottom: '1px solid #f3f4f6',
    color: '#111827',
  },
  h3: {
    fontSize: '15px',
    fontWeight: 600,
    marginTop: '24px',
    marginBottom: '8px',
    color: '#374151',
  },
  p: {
    marginBottom: '12px',
    textIndent: '2em',
  },
  ul: {
    paddingLeft: '2em',
    marginBottom: '12px',
    listStyleType: 'disc',
  },
  ol: {
    paddingLeft: '2em',
    marginBottom: '12px',
    listStyleType: 'decimal',
  },
  li: {
    marginBottom: '6px',
  },
  strong: {
    fontWeight: 600,
    color: '#111827',
  },
  em: {
    fontStyle: 'italic',
    color: '#4b5563',
  },
  code: {
    background: '#f3f4f6',
    borderRadius: '4px',
    padding: '2px 6px',
    fontSize: '13px',
    fontFamily: 'ui-monospace, Consolas, monospace',
    color: '#dc2626',
  },
  pre: {
    background: '#1f2937',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
    overflowX: 'auto' as const,
  },
  preCode: {
    background: 'transparent',
    padding: 0,
    color: '#e5e7eb',
    fontSize: '13px',
    fontFamily: 'ui-monospace, Consolas, monospace',
    lineHeight: '1.6',
  },
  blockquote: {
    borderLeft: '4px solid #3b82f6',
    paddingLeft: '16px',
    marginLeft: '0',
    marginBottom: '12px',
    color: '#4b5563',
    fontStyle: 'italic',
    background: '#eff6ff',
    borderRadius: '0 8px 8px 0',
    paddingTop: '8px',
    paddingBottom: '8px',
  },
  hr: {
    border: 'none',
    borderTop: '1px solid #e5e7eb',
    margin: '24px 0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginBottom: '16px',
    fontSize: '13px',
  },
  th: {
    background: '#f9fafb',
    fontWeight: 600,
    textAlign: 'left' as const,
    padding: '8px 12px',
    border: '1px solid #e5e7eb',
  },
  td: {
    padding: '8px 12px',
    border: '1px solid #e5e7eb',
  },
};

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div style={styles.wrapper}>
      <Markdown
        components={{
          h1: ({ children }) => <h1 style={styles.h1}>{children}</h1>,
          h2: ({ children }) => <h2 style={styles.h2}>{children}</h2>,
          h3: ({ children }) => <h3 style={styles.h3}>{children}</h3>,
          p: ({ children }) => <p style={styles.p}>{children}</p>,
          ul: ({ children }) => <ul style={styles.ul}>{children}</ul>,
          ol: ({ children }) => <ol style={styles.ol}>{children}</ol>,
          li: ({ children }) => <li style={styles.li}>{children}</li>,
          strong: ({ children }) => <strong style={styles.strong}>{children}</strong>,
          em: ({ children }) => <em style={styles.em}>{children}</em>,
          code: ({ children, className }) => {
            const isBlock = className?.includes('language-');
            if (isBlock) {
              return <code style={styles.preCode}>{children}</code>;
            }
            return <code style={styles.code}>{children}</code>;
          },
          pre: ({ children }) => <pre style={styles.pre}>{children}</pre>,
          blockquote: ({ children }) => <blockquote style={styles.blockquote}>{children}</blockquote>,
          hr: () => <hr style={styles.hr} />,
          table: ({ children }) => <table style={styles.table}>{children}</table>,
          th: ({ children }) => <th style={styles.th}>{children}</th>,
          td: ({ children }) => <td style={styles.td}>{children}</td>,
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
