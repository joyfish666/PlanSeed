import { SYSTEM_PROMPT } from '../prompts';
import type { ProjectContext, Message } from '../types';

interface AIConfig {
  apiKey: string;
  apiEndpoint: string;
  model: string;
  context?: ProjectContext;
}

async function* streamResponse(response: Response): AsyncGenerator<string> {
  const reader = response.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') return;

      try {
        const json = JSON.parse(data);
        const content = json.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        // skip malformed JSON
      }
    }
  }
}

export const aiService = {
  async *sendMessage(
    messages: { role: string; content: string }[],
    config: AIConfig,
  ): AsyncGenerator<string> {
    const response = await fetch(`${config.apiEndpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    yield* streamResponse(response);
  },

  async generateDocument(
    context: ProjectContext,
    config: AIConfig,
  ): Promise<string> {
    const prompt = `基于以下项目信息，生成一份完整的项目规划文档。

项目类型：${context.projectType}
核心功能：${context.coreFeatures.join('、')}
使用场景：设备 - ${context.usageScenario.devices.join('、')}，离线需求 - ${context.usageScenario.offlineSupport ? '是' : '否'}
技术偏好：${context.techPreference.mode}
项目规模：${context.projectScale === 'mvp' ? 'MVP 快速验证' : '完整产品'}
交付节奏：${context.deliveryRhythm === 'once' ? '一次性完成' : '迭代式开发'}
补充说明：${context.additionalRequirements || '无'}

请按以下结构生成 Markdown 文档：
1. 项目基本原则与约束
2. 功能规范（含用户故事和验收标准）
3. 技术栈推荐（含版本备注）`;

    const response = await fetch(`${config.apiEndpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  },
};
