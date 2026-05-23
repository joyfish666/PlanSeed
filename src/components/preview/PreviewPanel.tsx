import { MarkdownRenderer } from './MarkdownRenderer';
import { ExportBar } from '../export/ExportBar';
import { useAppStore } from '../../stores/useAppStore';

export function PreviewPanel() {
  const document = useAppStore((s) => s.document);
  const isGenerating = useAppStore((s) => s.isGenerating);
  const messages = useAppStore((s) => s.messages);
  const currentStep = useAppStore((s) => s.currentStep);
  const generateDocument = useAppStore((s) => s.generateDocument);
  const refreshPreview = useAppStore((s) => s.refreshPreview);
  const resetAll = useAppStore((s) => s.resetAll);

  const hasConversation = messages.length >= 2;
  const isComplete = currentStep === 'complete';

  return (
    <div className="flex flex-col h-full border-l border-gray-200 bg-white">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">文档预览</h2>
        <div className="flex items-center gap-2">
          {isGenerating && (
            <span className="text-xs text-blue-500 animate-pulse">生成中...</span>
          )}
          {hasConversation && (
            <button
              onClick={refreshPreview}
              disabled={isGenerating}
              className="px-2 py-1 text-xs text-gray-500 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
            >
              刷新预览
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {document ? (
          <MarkdownRenderer content={document} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            <div className="text-center space-y-4">
              <div className="text-3xl">📄</div>
              {hasConversation ? (
                <>
                  <p>对话进行中，预览将自动更新</p>
                  <button
                    onClick={generateDocument}
                    disabled={isGenerating}
                    className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors cursor-pointer"
                  >
                    生成完整文档
                  </button>
                </>
              ) : (
                <p>开始对话后，文档将在此处预览</p>
              )}
            </div>
          </div>
        )}
      </div>
      {document && (
        <div className="border-t border-gray-200 p-3 space-y-2">
          {!isComplete && (
            <button
              onClick={generateDocument}
              disabled={isGenerating}
              className="w-full px-3 py-1.5 text-xs text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-colors cursor-pointer"
            >
              重新生成完整文档
            </button>
          )}
          {isComplete && (
            <button
              onClick={resetAll}
              className="w-full px-3 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
            >
              开启下一个项目
            </button>
          )}
          <ExportBar />
        </div>
      )}
    </div>
  );
}
