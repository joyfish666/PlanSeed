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
  refreshPreview: () => Promise<void>;
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
  apiEndpoint: 'https://api.deepseek.com/v1',
  model: 'deepseek-v4-flash',

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

      // Update preview after each AI response
      const { messages: updatedMessages, context: currentContext } = get();
      if (updatedMessages.length >= 2) {
        try {
          const preview = await aiService.generatePreview(
            updatedMessages.map((m) => ({ role: m.role, content: m.content })),
            { apiKey, apiEndpoint, model, context: currentContext },
          );
          if (preview) set({ document: preview });
        } catch {
          // preview update failure is non-critical
        }
      }
    } catch (error) {
      addMessage('assistant', '抱歉，发生了错误。请检查 API 配置后重试。');
    } finally {
      set({ isTyping: false });
    }
  },

  selectOption: (dimension, value) => {
    const { updateContext, sendMessage } = get();

    switch (dimension) {
      case 'projectType':
        updateContext({ projectType: value as string });
        break;
      case 'coreFeatures':
        updateContext({ coreFeatures: value as string[] });
        break;
      case 'devices':
        updateContext({
          usageScenario: {
            ...get().context.usageScenario,
            devices: value as ('desktop' | 'mobile' | 'tablet')[],
          },
        });
        break;
      case 'offlineSupport':
        updateContext({
          usageScenario: {
            ...get().context.usageScenario,
            offlineSupport: value === 'true',
          },
        });
        break;
      case 'techPreference':
        updateContext({ techPreference: { mode: value as 'recommend' | 'custom' | 'team' } });
        break;
      case 'projectScale':
        updateContext({ projectScale: value as 'mvp' | 'full' });
        break;
      case 'deliveryRhythm':
        updateContext({ deliveryRhythm: value as 'once' | 'iterative' });
        break;
    }

    // Send the selected value to AI and get the next question
    sendMessage(value as string);
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

  refreshPreview: async () => {
    const { messages, context, apiKey, apiEndpoint, model } = get();
    if (!apiKey || messages.length < 2) return;

    set({ isGenerating: true });
    try {
      const preview = await aiService.generatePreview(
        messages.map((m) => ({ role: m.role, content: m.content })),
        { apiKey, apiEndpoint, model, context },
      );
      if (preview) set({ document: preview });
    } catch {
      // non-critical
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
    const apiEndpoint = localStorage.getItem('planseed_api_endpoint') || 'https://api.deepseek.com/v1';
    const model = localStorage.getItem('planseed_model') || 'deepseek-v4-flash';
    set({ apiKey, apiEndpoint, model });
  },
}));
