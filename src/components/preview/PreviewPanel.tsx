import { MarkdownRenderer } from './MarkdownRenderer';
import { ExportBar } from '../export/ExportBar';
import { useAppStore } from '../../stores/useAppStore';
import { useT } from '../../i18n';

export function PreviewPanel() {
  const document = useAppStore((s) => s.document);
  const isGenerating = useAppStore((s) => s.isGenerating);
  const messages = useAppStore((s) => s.messages);
  const refreshPreview = useAppStore((s) => s.refreshPreview);
  const resetAll = useAppStore((s) => s.resetAll);
  const t = useT();

  const hasConversation = messages.length >= 2;

  return (
    <div className="flex flex-col h-full border-l border-gray-200 bg-white">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">{t.preview.title}</h2>
        <div className="flex items-center gap-2">
          {isGenerating && (
            <span className="text-xs text-blue-500 animate-pulse">{t.preview.generating}</span>
          )}
          {hasConversation && (
            <button
              onClick={refreshPreview}
              disabled={isGenerating}
              className="px-2 py-1 text-xs text-gray-500 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {t.preview.refresh}
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {document ? (
          <MarkdownRenderer content={document} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            <div className="text-center space-y-2">
              <div className="text-3xl">📄</div>
              <p>{t.preview.empty}</p>
            </div>
          </div>
        )}
      </div>
      {document && (
        <div className="border-t border-gray-200 p-3 space-y-2">
          <ExportBar />
          <button
            onClick={resetAll}
            className="w-full px-3 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
          >
            {t.preview.nextProject}
          </button>
        </div>
      )}
    </div>
  );
}
