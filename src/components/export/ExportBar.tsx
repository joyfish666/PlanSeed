import { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { copyToClipboard } from '../../utils';

export function ExportBar() {
  const document = useAppStore((s) => s.document);
  const [copied, setCopied] = useState<'md' | 'prompt' | null>(null);

  const handleCopyMarkdown = async () => {
    await copyToClipboard(document);
    setCopied('md');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyPrompt = async () => {
    const prompt = `请以本规范为依据进行后续工作。\n\n${document}`;
    await copyToClipboard(prompt);
    setCopied('prompt');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex gap-2 p-3 border-t border-gray-200 bg-gray-50">
      <button
        onClick={handleCopyMarkdown}
        className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
      >
        {copied === 'md' ? '已复制 ✓' : '复制 Markdown'}
      </button>
      <button
        onClick={handleCopyPrompt}
        className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
      >
        {copied === 'prompt' ? '已复制 ✓' : '复制 AI Prompt'}
      </button>
    </div>
  );
}
