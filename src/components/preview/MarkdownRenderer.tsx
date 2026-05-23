import Markdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-sm max-w-none p-4 overflow-y-auto h-full">
      <Markdown>{content}</Markdown>
    </div>
  );
}
