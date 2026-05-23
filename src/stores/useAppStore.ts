import { create } from 'zustand';
import { generateId, parseAIMessage } from '../utils';
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
  reviewStage: 'none' | 'completeness_passed' | 'feasibility_passed';
  addMessage: (role: 'user' | 'assistant', content: string, type?: Message['type']) => void;
  setCurrentStep: (step: ConversationStep) => void;
  updateContext: (updates: Partial<ProjectContext>) => void;
  sendMessage: (content: string) => Promise<void>;
  selectOption: (dimension: string, value: string | string[]) => void;
  generateDocument: () => Promise<void>;
  refreshPreview: () => Promise<void>;
  startWithConnectionTest: () => Promise<boolean>;
  resetAll: () => void;
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
  apiEndpoint: 'https://api.deepseek.com',
  model: 'deepseek-v4-flash',
  reviewStage: 'none',

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
    const { addMessage, apiKey, apiEndpoint, model } = get();
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
      })) {
        fullResponse += chunk;
      }

      addMessage('assistant', fullResponse);

      // Detect review pass markers in AI response
      const parsed = parseAIMessage(fullResponse);
      if (parsed.reviewPass) {
        set({ reviewStage: parsed.reviewPass === 'completeness' ? 'completeness_passed' : 'feasibility_passed' });
      }

      // Update preview after each AI response
      const { messages: updatedMessages } = get();
      if (updatedMessages.length >= 2) {
        try {
          const preview = await aiService.generatePreview(
            updatedMessages.map((m) => ({ role: m.role, content: m.content })),
            { apiKey, apiEndpoint, model },
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
    const { messages, apiKey, apiEndpoint, model, addMessage } = get();
    if (!apiKey) return;

    set({ isGenerating: true, currentStep: 'generating' });
    addMessage('assistant', '正在为你生成项目规划文档...');

    try {
      const doc = await aiService.generateDocument(
        messages.map((m) => ({ role: m.role, content: m.content })),
        { apiKey, apiEndpoint, model },
      );
      set({ document: doc, currentStep: 'complete' });
      addMessage('assistant', '文档已生成！你可以在右侧预览区域查看，也可以导出为 Markdown 或 AI Prompt。\n\n你可以选择接下来的操作：\n\n[OPTIONS:请求 AI 审视完整性|请求 AI 审视可行性及复杂度|修改方案|就此结束]');
    } catch {
      addMessage('assistant', '生成文档时出错，请重试。');
    } finally {
      set({ isGenerating: false });
    }
  },

  refreshPreview: async () => {
    const { messages, apiKey, apiEndpoint, model } = get();
    if (!apiKey || messages.length < 2) return;

    set({ isGenerating: true });
    try {
      const preview = await aiService.generatePreview(
        messages.map((m) => ({ role: m.role, content: m.content })),
        { apiKey, apiEndpoint, model },
      );
      if (preview) set({ document: preview });
    } catch {
      // non-critical
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
      const hiddenPrompt = '用户已确认模型连接正常，现在开始规划项目。请直接询问用户想做一个什么样的项目，用具体项目实例引导用户（比如：日历应用、待办事项、博客、商城、聊天室等），不要停留在抽象的类型层面。';
      const messages = get().messages.map((m) => ({ role: m.role, content: m.content }));
      messages.push({ role: 'user', content: hiddenPrompt });

      let fullResponse = '';
      for await (const chunk of aiService.sendMessage(messages, { apiKey, apiEndpoint, model })) {
        fullResponse += chunk;
      }

      get().addMessage('assistant', fullResponse);
      set({ isTyping: false });
      return true;
    } catch (err) {
      set({ isTyping: false });
      const msg = err instanceof Error ? err.message : String(err);
      get().addMessage('assistant', `模型连接失败：${msg}\n\n请检查设置中的 API Key、API Endpoint 和模型名称是否正确，修改后重新检测。`);
      return false;
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
    const { apiKey } = get();
    set({
      messages: [],
      currentStep: 'welcome',
      isTyping: false,
      context: { ...defaultContext },
      document: '',
      isGenerating: false,
      reviewStage: 'none',
    });
    // Re-trigger welcome message
    if (apiKey) {
      set({ currentStep: 'project_type' });
      const addMessage = get().addMessage;
      addMessage(
        'assistant',
        '你好！我是 PlanSeed，你的项目规划向导。\n\n我会通过几个简单的问题，帮你把脑海中的想法整理成一份清晰的项目规划文档。整个过程大概需要 5-10 分钟。\n\n请先在右上角「设置」中进行模型参数填写，确认无误后再继续。\n\n[OPTIONS:已测试模型连接正常，开始规划]',
      );
    }
  },
}));
