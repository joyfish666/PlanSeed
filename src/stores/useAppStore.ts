import { create } from 'zustand';
import { generateId } from '../utils';
import { aiService } from '../services/ai';
import { START_PLANNING_HINT } from '../prompts';
import type { Message } from '../types';

interface AppState {
  messages: Message[];
  isTyping: boolean;
  document: string;
  isGenerating: boolean;
  apiKey: string;
  apiEndpoint: string;
  model: string;
  addMessage: (role: Message['role'], content: string) => void;
  sendMessage: (content: string) => Promise<void>;
  refreshPreview: () => Promise<void>;
  startWithConnectionTest: () => Promise<boolean>;
  resetAll: () => void;
  setApiKey: (key: string) => void;
  setApiEndpoint: (endpoint: string) => void;
  setModel: (model: string) => void;
  loadConfig: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  messages: [],
  isTyping: false,
  document: '',
  isGenerating: false,
  apiKey: '',
  apiEndpoint: 'https://api.deepseek.com',
  model: 'deepseek-v4-flash',

  addMessage: (role, content) => {
    const message: Message = {
      id: generateId(),
      role,
      content,
      timestamp: Date.now(),
    };
    set((state) => ({ messages: [...state.messages, message] }));
  },

  sendMessage: async (content: string) => {
    const { addMessage, apiKey, apiEndpoint, model } = get();
    if (!apiKey) return;

    addMessage('user', content);
    set({ isTyping: true });

    try {
      const messages = get().messages.map((m) => ({ role: m.role, content: m.content }));

      let fullResponse = '';
      for await (const chunk of aiService.sendMessage(messages, { apiKey, apiEndpoint, model })) {
        fullResponse += chunk;
      }
      addMessage('assistant', fullResponse);

      // Auto-update the live document preview after each AI response so the
      // user can see how their latest choice / modification affects the document.
      const { messages: updatedMessages } = get();
      if (updatedMessages.length >= 2) {
        try {
          const preview = await aiService.generateDocument(
            updatedMessages.map((m) => ({ role: m.role, content: m.content })),
            { apiKey, apiEndpoint, model },
            'preview',
          );
          if (preview) set({ document: preview });
        } catch (error) {
          console.error('[PlanSeed] preview generation failed:', error);
        }
      }
    } catch (error) {
      console.error('[PlanSeed] sendMessage failed:', error);
      const detail = error instanceof Error ? error.message : String(error);
      addMessage(
        'assistant',
        `抱歉，与模型通信时出错：${detail}\n\n请检查设置中的 API Key、Endpoint 和模型名称是否正确，修改后重试。`,
      );
    } finally {
      set({ isTyping: false });
    }
  },

  refreshPreview: async () => {
    const { messages, apiKey, apiEndpoint, model } = get();
    if (!apiKey || messages.length < 2) return;

    set({ isGenerating: true });
    try {
      const preview = await aiService.generateDocument(
        messages.map((m) => ({ role: m.role, content: m.content })),
        { apiKey, apiEndpoint, model },
        'preview',
      );
      if (preview) set({ document: preview });
    } catch (error) {
      console.error('[PlanSeed] refreshPreview failed:', error);
    } finally {
      set({ isGenerating: false });
    }
  },

  startWithConnectionTest: async () => {
    const { apiKey, apiEndpoint, model } = get();
    if (!apiKey) return false;

    set({ isTyping: true });
    try {
      await aiService.testConnection({ apiKey, apiEndpoint, model });

      // Send hidden system instruction to AI without showing it in UI
      const messages = get().messages.map((m) => ({ role: m.role, content: m.content }));
      messages.push({ role: 'user', content: START_PLANNING_HINT });

      let fullResponse = '';
      for await (const chunk of aiService.sendMessage(messages, { apiKey, apiEndpoint, model })) {
        fullResponse += chunk;
      }

      get().addMessage('assistant', fullResponse);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      get().addMessage(
        'assistant',
        `模型连接失败：${msg}\n\n请检查设置中的 API Key、API Endpoint 和模型名称是否正确，修改后重新检测。`,
      );
      return false;
    } finally {
      set({ isTyping: false });
    }
  },

  setApiKey: (key) => {
    localStorage.setItem('planseed_api_key', key);
    set({ apiKey: key });
  },

  setApiEndpoint: (endpoint) => {
    localStorage.setItem('planseed_api_endpoint', endpoint);
    set({ apiEndpoint: endpoint });
  },

  setModel: (model) => {
    localStorage.setItem('planseed_model', model);
    set({ model });
  },

  loadConfig: () => {
    const apiKey = localStorage.getItem('planseed_api_key') || '';
    const apiEndpoint = localStorage.getItem('planseed_api_endpoint') || 'https://api.deepseek.com';
    const model = localStorage.getItem('planseed_model') || 'deepseek-v4-flash';
    set({ apiKey, apiEndpoint, model });
  },

  resetAll: () => {
    set({
      messages: [],
      isTyping: false,
      document: '',
      isGenerating: false,
    });
    // The welcome message is re-added by App's useEffect once messages are empty.
  },
}));
