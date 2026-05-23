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

  const handleDownload = () => {
    const blob = new Blob([document], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = '项目规划文档.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleCopyMarkdown}
        className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
      >
        {copied === 'md' ? '已复制 ✓' : '复制 Markdown'}
      </button>
      <button
        onClick={handleCopyPrompt}
        className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
      >
        {copied === 'prompt' ? '已复制 ✓' : '复制 AI Prompt'}
      </button>
      <button
        onClick={handleDownload}
        className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
      >
        下载 Markdown
      </button>
    </div>
  );
}
