import { create } from 'zustand';
import { generateId } from '../utils';
import { aiService } from '../services/ai';
import { START_PLANNING_HINT } from '../prompts';
import { messages as i18nMessages, format, getDefaultLanguage, LANG_KEY, buildWelcomePrompt } from '../i18n';
import type { Language } from '../i18n';
import type { Message } from '../types';

interface AppState {
  messages: Message[];
  isTyping: boolean;
  document: string;
  isGenerating: boolean;
  apiKey: string;
  apiEndpoint: string;
  model: string;
  language: Language;
  /** id of the injected welcome message (for re-translation on language switch) */
  welcomeMessageId: string | null;
  addMessage: (role: Message['role'], content: string) => void;
  addWelcomeMessage: (lang: Language) => void;
  sendMessage: (content: string) => Promise<void>;
  refreshPreview: () => Promise<void>;
  startWithConnectionTest: () => Promise<boolean>;
  resetAll: () => void;
  setApiKey: (key: string) => void;
  setApiEndpoint: (endpoint: string) => void;
  setModel: (model: string) => void;
  setLanguage: (lang: Language) => void;
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
  language: getDefaultLanguage(),
  welcomeMessageId: null,

  addMessage: (role, content) => {
    const message: Message = {
      id: generateId(),
      role,
      content,
      timestamp: Date.now(),
    };
    set((state) => ({ messages: [...state.messages, message] }));
  },

  addWelcomeMessage: (lang) => {
    const id = generateId();
    const message: Message = {
      id,
      role: 'assistant',
      content: buildWelcomePrompt(lang),
      timestamp: Date.now(),
    };
    set((state) => ({
      welcomeMessageId: id,
      messages: [...state.messages, message],
    }));
  },

  sendMessage: async (content: string) => {
    const { addMessage, apiKey, apiEndpoint, model, language } = get();
    if (!apiKey) return;

    addMessage('user', content);
    set({ isTyping: true });

    try {
      const messages = get().messages.map((m) => ({ role: m.role, content: m.content }));

      let fullResponse = '';
      for await (const chunk of aiService.sendMessage(messages, { apiKey, apiEndpoint, model, language })) {
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
            { apiKey, apiEndpoint, model, language },
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
      addMessage('assistant', format(i18nMessages[language].errors.sendFailed, { detail }));
    } finally {
      set({ isTyping: false });
    }
  },

  refreshPreview: async () => {
    const { messages: msgs, apiKey, apiEndpoint, model, language } = get();
    if (!apiKey || msgs.length < 2) return;

    set({ isGenerating: true });
    try {
      const preview = await aiService.generateDocument(
        msgs.map((m) => ({ role: m.role, content: m.content })),
        { apiKey, apiEndpoint, model, language },
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
    const { apiKey, apiEndpoint, model, language } = get();
    if (!apiKey) return false;

    set({ isTyping: true });
    try {
      await aiService.testConnection({ apiKey, apiEndpoint, model, language });

      // Send hidden system instruction to AI without showing it in UI
      const messages = get().messages.map((m) => ({ role: m.role, content: m.content }));
      messages.push({ role: 'user', content: START_PLANNING_HINT });

      let fullResponse = '';
      for await (const chunk of aiService.sendMessage(messages, { apiKey, apiEndpoint, model, language })) {
        fullResponse += chunk;
      }

      get().addMessage('assistant', fullResponse);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      get().addMessage(
        'assistant',
        format(i18nMessages[get().language].errors.connectionFailed, { msg }),
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

  setLanguage: (lang) => {
    localStorage.setItem(LANG_KEY, lang);
    set({ language: lang });

    // Re-translate the pending welcome message so a fresh arrival always sees
    // an actionable welcome in the current language (before the conversation starts).
    const { welcomeMessageId, messages: msgs } = get();
    if (welcomeMessageId && msgs.length === 1) {
      const content = buildWelcomePrompt(lang);
      set((state) => ({
        messages: state.messages.map((m) => (m.id === welcomeMessageId ? { ...m, content } : m)),
      }));
    }
  },

  loadConfig: () => {
    const apiKey = localStorage.getItem('planseed_api_key') || '';
    const apiEndpoint = localStorage.getItem('planseed_api_endpoint') || 'https://api.deepseek.com';
    const model = localStorage.getItem('planseed_model') || 'deepseek-v4-flash';
    const storedLang = localStorage.getItem(LANG_KEY);
    const language: Language = storedLang === 'en' || storedLang === 'zh' ? storedLang : getDefaultLanguage();
    set({ apiKey, apiEndpoint, model, language });
  },

  resetAll: () => {
    set({
      messages: [],
      welcomeMessageId: null,
      isTyping: false,
      document: '',
      isGenerating: false,
    });
    // The welcome message is re-added by App's useEffect once messages are empty.
  },
}));
