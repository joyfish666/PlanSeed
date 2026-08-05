import { useEffect, useState } from 'react';
import { ChatContainer } from './components/chat/ChatContainer';
import { PreviewPanel } from './components/preview/PreviewPanel';
import { SettingsModal } from './components/common/SettingsModal';
import { useAppStore } from './stores/useAppStore';
import { buildWelcomePrompt, useT } from './i18n';

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'chat' | 'preview'>('chat');
  const loadConfig = useAppStore((s) => s.loadConfig);
  const apiKey = useAppStore((s) => s.apiKey);
  const messages = useAppStore((s) => s.messages);
  const addMessage = useAppStore((s) => s.addMessage);
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const t = useT();

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    if (apiKey && messages.length === 0) {
      addMessage('assistant', buildWelcomePrompt(language));
    }
  }, [apiKey, messages.length, addMessage, language]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌱</span>
          <h1 className="text-lg font-semibold text-gray-800">PlanSeed</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
            title={language === 'zh' ? 'Switch to English' : '切换到中文'}
            className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {language === 'zh' ? 'EN' : '中文'}
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {t.app.settings}
          </button>
        </div>
      </header>

      {/* Mobile Tab */}
      <div className="flex md:hidden border-b border-gray-200 bg-white">
        <button
          onClick={() => setMobileTab('chat')}
          className={`flex-1 py-2 text-sm font-medium transition-colors cursor-pointer ${
            mobileTab === 'chat' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
          }`}
        >
          {t.app.tabChat}
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2 text-sm font-medium transition-colors cursor-pointer ${
            mobileTab === 'preview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
          }`}
        >
          {t.app.tabPreview}
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
        {t.app.footer}
      </footer>

      {/* Settings Modal */}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

export default App;
