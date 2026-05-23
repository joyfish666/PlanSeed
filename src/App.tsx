import { useEffect, useState } from 'react';
import { ChatContainer } from './components/chat/ChatContainer';
import { PreviewPanel } from './components/preview/PreviewPanel';
import { SettingsModal } from './components/common/SettingsModal';
import { useAppStore } from './stores/useAppStore';

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'chat' | 'preview'>('chat');
  const loadConfig = useAppStore((s) => s.loadConfig);
  const apiKey = useAppStore((s) => s.apiKey);
  const setCurrentStep = useAppStore((s) => s.setCurrentStep);
  const addMessage = useAppStore((s) => s.addMessage);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    if (apiKey) {
      setCurrentStep('project_type');
      addMessage(
        'assistant',
        '你好！我是 PlanSeed，你的项目规划向导。\n\n我会通过几个简单的问题，帮你把脑海中的想法整理成一份清晰的项目规划文档。整个过程大概需要 5-10 分钟。\n\n首先，你想做什么类型的应用？\n\n1. **日历应用** — 日程管理与提醒\n2. **博客平台** — 内容创作与发布\n3. **电商商城** — 在线购物与交易\n4. **待办事项** — 任务管理与追踪\n5. **自定义** — 描述你的想法',
      );
    }
  }, [apiKey]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌱</span>
          <h1 className="text-lg font-semibold text-gray-800">PlanSeed</h1>
        </div>
        <button
          onClick={() => setSettingsOpen(true)}
          className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          设置
        </button>
      </header>

      {/* Mobile Tab */}
      <div className="flex md:hidden border-b border-gray-200 bg-white">
        <button
          onClick={() => setMobileTab('chat')}
          className={`flex-1 py-2 text-sm font-medium transition-colors cursor-pointer ${
            mobileTab === 'chat' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
          }`}
        >
          对话
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2 text-sm font-medium transition-colors cursor-pointer ${
            mobileTab === 'preview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
          }`}
        >
          预览
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        <div className={`w-full md:w-3/5 h-full ${mobileTab === 'chat' ? 'block' : 'hidden'} md:block`}>
          <ChatContainer />
        </div>
        <div className={`w-full md:w-2/5 h-full ${mobileTab === 'preview' ? 'block' : 'hidden'} md:block`}>
          <PreviewPanel />
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-2 text-center text-xs text-gray-400 bg-white border-t border-gray-200 shrink-0">
        PlanSeed v1.0.0 · 再简单的想法，也值得被认真对待
      </footer>

      {/* Settings Modal */}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

export default App;
