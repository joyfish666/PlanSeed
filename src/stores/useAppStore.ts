import { create } from 'zustand';
import { generateId } from '../utils';
import { aiService } from '../services/ai';
import type { Message, ProjectContext, ConversationStep } from '../types';

interface AppState {
  messages: Message[];
  currentStep: ConversationStep;
  isTyping: boolean;
  context: ProjectContext;
  document: string;
  isGenerating: boolean;
  apiKey: string;
  apiEndpoint: string;
  model: string;
  addMessage: (role: 'user' | 'assistant', content: string, type?: Message['type']) => void;
  setCurrentStep: (step: ConversationStep) => void;
  updateContext: (updates: Partial<ProjectContext>) => void;
  sendMessage: (content: string) => Promise<void>;
  selectOption: (dimension: string, value: string | string[]) => void;
  generateDocument: () => Promise<void>;
  setApiKey: (key: string) => void;
  setApiEndpoint: (endpoint: string) => void;
  setModel: (model: string) => void;
  loadConfig: () => void;
}

const defaultContext: ProjectContext = {
  projectType: '',
  coreFeatures: [],
  usageScenario: { devices: [], offlineSupport: false },
  techPreference: { mode: 'recommend' },
  projectScale: 'mvp',
  deliveryRhythm: 'iterative',
  additionalRequirements: '',
};

export const useAppStore = create<AppState>((set, get) => ({
  messages: [],
  currentStep: 'welcome',
  isTyping: false,
  context: { ...defaultContext },
  document: '',
  isGenerating: false,
  apiKey: '',
  apiEndpoint: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',

  addMessage: (role, content, type = 'text') => {
    const message: Message = {
      id: generateId(),
      role,
      content,
      timestamp: Date.now(),
      type,
    };
    set((state) => ({ messages: [...state.messages, message] }));
  },

  setCurrentStep: (step) => set({ currentStep: step }),

  updateContext: (updates) =>
    set((state) => ({
      context: { ...state.context, ...updates },
    })),

  sendMessage: async (content: string) => {
    const { addMessage, context, apiKey, apiEndpoint, model } = get();
    if (!apiKey) return;

    addMessage('user', content);
    set({ isTyping: true });

    try {
      const messages = get().messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      let fullResponse = '';
      for await (const chunk of aiService.sendMessage(messages, {
        apiKey,
        apiEndpoint,
        model,
        context,
      })) {
        fullResponse += chunk;
      }

      addMessage('assistant', fullResponse);
    } catch (error) {
      addMessage('assistant', '抱歉，发生了错误。请检查 API 配置后重试。');
    } finally {
      set({ isTyping: false });
    }
  },

  selectOption: (dimension, value) => {
    const { updateContext, addMessage, sendMessage } = get();

    switch (dimension) {
      case 'projectType':
        updateContext({ projectType: value as string });
        addMessage('user', value as string, 'selection');
        break;
      case 'coreFeatures':
        updateContext({ coreFeatures: value as string[] });
        addMessage('user', (value as string[]).join('、'), 'selection');
        break;
      case 'devices':
        updateContext({
          usageScenario: {
            ...get().context.usageScenario,
            devices: value as ('desktop' | 'mobile' | 'tablet')[],
          },
        });
        addMessage('user', (value as string[]).join('、'), 'selection');
        break;
      case 'offlineSupport':
        updateContext({
          usageScenario: {
            ...get().context.usageScenario,
            offlineSupport: value === 'true',
          },
        });
        addMessage('user', value === 'true' ? '需要' : '不需要', 'selection');
        break;
      case 'techPreference':
        updateContext({ techPreference: { mode: value as 'recommend' | 'custom' | 'team' } });
        addMessage('user', value as string, 'selection');
        break;
      case 'projectScale':
        updateContext({ projectScale: value as 'mvp' | 'full' });
        addMessage('user', value === 'mvp' ? '快速验证 MVP' : '完整产品', 'selection');
        break;
      case 'deliveryRhythm':
        updateContext({ deliveryRhythm: value as 'once' | 'iterative' });
        addMessage('user', value === 'once' ? '一次性完成' : '迭代式开发', 'selection');
        break;
    }
  },

  generateDocument: async () => {
    const { context, apiKey, apiEndpoint, model, addMessage } = get();
    if (!apiKey) return;

    set({ isGenerating: true, currentStep: 'generating' });
    addMessage('assistant', '正在为你生成项目规划文档...');

    try {
      const doc = await aiService.generateDocument(context, {
        apiKey,
        apiEndpoint,
        model,
      });
      set({ document: doc, currentStep: 'complete' });
      addMessage('assistant', '文档已生成！你可以在右侧预览区域查看，也可以导出为 Markdown 或 AI Prompt。');
    } catch {
      addMessage('assistant', '生成文档时出错，请重试。');
    } finally {
      set({ isGenerating: false });
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
    const apiEndpoint = localStorage.getItem('planseed_api_endpoint') || 'https://api.openai.com/v1';
    const model = localStorage.getItem('planseed_model') || 'gpt-4o-mini';
    set({ apiKey, apiEndpoint, model });
  },
}));
