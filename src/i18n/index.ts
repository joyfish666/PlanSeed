import { useAppStore } from '../stores/useAppStore';

export type Language = 'zh' | 'en';

export const LANG_KEY = 'planseed_language';

/** Resolve the initial language from the browser preference (persisted later). */
export function getDefaultLanguage(): Language {
  if (typeof navigator !== 'undefined') {
    const nav = (navigator.language || '').toLowerCase();
    if (nav.startsWith('zh')) return 'zh';
    if (nav.startsWith('en')) return 'en';
  }
  return 'zh';
}

export function format(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? `{${k}}`);
}

export interface AppMessages {
  app: {
    settings: string;
    tabChat: string;
    tabPreview: string;
    footer: string;
  };
  chat: {
    placeholderNoKey: string;
    placeholderInput: string;
    typing: string;
    customInput: string;
    customPlaceholder: string;
    send: string;
    understoodContinue: string;
    understoodValue: string;
    askMore: string;
    askPlaceholder: string;
    ask: string;
    selectedPrefix: string;
    testing: string;
    startButton: string;
  };
  preview: {
    title: string;
    generating: string;
    refresh: string;
    empty: string;
    nextProject: string;
  };
  export: {
    copyMarkdown: string;
    copied: string;
    copyPrompt: string;
    download: string;
    promptPreamble: string;
  };
  settings: {
    title: string;
    apiKeyLabel: string;
    keyPlaceholderCached: string;
    keyPlaceholderNew: string;
    keyCachedHint: string;
    endpointLabel: string;
    modelLabel: string;
    needKey: string;
    test: string;
    testing: string;
    testFailed: string;
    cancel: string;
    save: string;
  };
  errors: {
    connectionFailed: string;
    sendFailed: string;
  };
}

export const messages: Record<Language, AppMessages> = {
  zh: {
    app: {
      settings: '设置',
      tabChat: '对话',
      tabPreview: '预览',
      footer: 'PlanSeed v1.2.0 · 再简单的想法，也值得被认真对待',
    },
    chat: {
      placeholderNoKey: '请先在设置中配置 API Key...',
      placeholderInput: '输入你的回答...',
      typing: '正在思考...',
      customInput: '自定义输入...',
      customPlaceholder: '输入你的自定义回答...',
      send: '发送',
      understoodContinue: '我已了解，继续项目规划',
      understoodValue: '好的，我已了解，继续项目规划',
      askMore: '我还想追问细节',
      askPlaceholder: '输入你想追问的问题...',
      ask: '提问',
      selectedPrefix: '已选择：',
      testing: '正在检测连接...',
      startButton: '测试模型连接正常，开始规划',
    },
    preview: {
      title: '文档预览',
      generating: '生成中...',
      refresh: '刷新预览',
      empty: '开始对话后，文档将在此处预览',
      nextProject: '开启下一个项目',
    },
    export: {
      copyMarkdown: '复制 Markdown',
      copied: '已复制 ✓',
      copyPrompt: '复制 AI Prompt',
      download: '下载 Markdown',
      promptPreamble: '请以本规范为依据进行后续工作。\n\n',
    },
    settings: {
      title: 'API 设置',
      apiKeyLabel: 'API Key',
      keyPlaceholderCached: '已有缓存的 Key，点击输入框修改',
      keyPlaceholderNew: 'sk-...',
      keyCachedHint: '已有本地缓存的 API Key，点击输入框可修改',
      endpointLabel: 'API Endpoint',
      modelLabel: '模型',
      needKey: '请先填写 API Key',
      test: '检测模型连接',
      testing: '检测中...',
      testFailed: '连接失败：{msg}\n\n请检查：\n- API Key 是否正确\n- API Endpoint 是否可访问\n- 模型名称是否有效',
      cancel: '取消',
      save: '保存',
    },
    errors: {
      connectionFailed:
        '模型连接失败：{msg}\n\n请检查设置中的 API Key、API Endpoint 和模型名称是否正确，修改后重新检测。',
      sendFailed:
        '抱歉，与模型通信时出错：{detail}\n\n请检查设置中的 API Key、Endpoint 和模型名称是否正确，修改后重试。',
    },
  },
  en: {
    app: {
      settings: 'Settings',
      tabChat: 'Chat',
      tabPreview: 'Preview',
      footer: 'PlanSeed v1.2.0 · Every idea, no matter how simple, deserves to be taken seriously.',
    },
    chat: {
      placeholderNoKey: 'Configure an API Key in Settings first...',
      placeholderInput: 'Type your answer...',
      typing: 'Thinking...',
      customInput: 'Custom input...',
      customPlaceholder: 'Type your custom answer...',
      send: 'Send',
      understoodContinue: 'Got it, continue planning',
      understoodValue: 'Got it, continue planning',
      askMore: 'I have more questions',
      askPlaceholder: 'Type your follow-up question...',
      ask: 'Ask',
      selectedPrefix: 'Selected: ',
      testing: 'Testing connection...',
      startButton: 'Connection OK, start planning',
    },
    preview: {
      title: 'Document Preview',
      generating: 'Generating...',
      refresh: 'Refresh',
      empty: 'Start the conversation and the document will preview here',
      nextProject: 'Start a new project',
    },
    export: {
      copyMarkdown: 'Copy Markdown',
      copied: 'Copied ✓',
      copyPrompt: 'Copy AI Prompt',
      download: 'Download Markdown',
      promptPreamble: 'Please use this specification as the basis for your work.\n\n',
    },
    settings: {
      title: 'API Settings',
      apiKeyLabel: 'API Key',
      keyPlaceholderCached: 'A cached Key exists, click to edit',
      keyPlaceholderNew: 'sk-...',
      keyCachedHint: 'An API Key is stored locally, click the field to edit',
      endpointLabel: 'API Endpoint',
      modelLabel: 'Model',
      needKey: 'Please enter an API Key first',
      test: 'Test connection',
      testing: 'Testing...',
      testFailed:
        'Connection failed: {msg}\n\nPlease check:\n- API Key is correct\n- API Endpoint is reachable\n- Model name is valid',
      cancel: 'Cancel',
      save: 'Save',
    },
    errors: {
      connectionFailed:
        'Model connection failed: {msg}\n\nPlease check the API Key, API Endpoint and model name in Settings and try again.',
      sendFailed:
        'Sorry, communication with the model failed: {detail}\n\nPlease check the API Key, Endpoint and model name in Settings and retry.',
    },
  },
};

export function buildWelcomePrompt(lang: Language): string {
  return lang === 'en'
    ? `Hi! I'm PlanSeed, your project planning guide.

I'll help you turn the idea in your head into a clear project specification through a few simple questions. The whole process takes about 5-10 minutes.

[OPTIONS:Connection OK, start planning]`
    : `你好！我是 PlanSeed，你的项目规划向导。

我会通过几个简单的问题，帮你把脑海中的想法整理成一份清晰的项目规划文档。整个过程大概需要 5-10 分钟。

[OPTIONS:已测试模型连接正常，开始规划]`;
}

/** Hook that returns the localized strings for the current UI language. */
export function useT(): AppMessages {
  return messages[useAppStore((s) => s.language)];
}
