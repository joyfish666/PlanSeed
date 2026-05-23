import { MarkdownRenderer } from './MarkdownRenderer';
import { ExportBar } from '../export/ExportBar';
import { useAppStore } from '../../stores/useAppStore';

export function PreviewPanel() {
  const document = useAppStore((s) => s.document);
  const isGenerating = useAppStore((s) => s.isGenerating);

  return (
    <div className="flex flex-col h-full border-l border-gray-200 bg-white">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">文档预览</h2>
        {isGenerating && (
          <span className="text-xs text-blue-500 animate-pulse">生成中...</span>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        {document ? (
          <MarkdownRenderer content={document} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            <div className="text-center space-y-2">
              <div className="text-3xl">📄</div>
              <p>完成对话后，文档将在此处预览</p>
            </div>
          </div>
        )}
      </div>
      {document && <ExportBar />}
    </div>
  );
}
