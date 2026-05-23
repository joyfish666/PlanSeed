import { SYSTEM_PROMPT } from '../prompts';

interface AIConfig {
  apiKey: string;
  apiEndpoint: string;
  model: string;
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

  async generatePreview(
    messages: { role: string; content: string }[],
    config: AIConfig,
  ): Promise<string> {
    const conversation = messages.map((m) => `${m.role === 'user' ? '用户' : 'AI'}：${m.content}`).join('\n\n');

    const prompt = `以下是用户与 AI 的对话记录，请根据已收集到的信息，生成一份 Markdown 格式的项目规划文档预览。

要求：
- 仅包含已经明确的信息，不要编造未讨论的内容
- 按以下结构组织：项目基本原则与约束、功能规范、技术栈推荐
- 如果某个板块信息不足，写"（待补充）"
- 不需要额外的说明文字，直接输出 Markdown

对话记录：
${conversation}`;

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

  async generateDocument(
    messages: { role: string; content: string }[],
    config: AIConfig,
  ): Promise<string> {
    const conversation = messages.map((m) => `${m.role === 'user' ? '用户' : 'AI'}：${m.content}`).join('\n\n');

    const prompt = `以下是用户与 AI 的完整对话记录，请从中提取所有已确认的项目信息，生成一份完整的项目规划文档。

要求：
- 从对话中提取所有明确的信息，不要遗漏任何用户确认过的内容
- 按以下结构生成 Markdown 文档：
  1. 项目基本原则与约束
  2. 功能规范（含用户故事和验收标准）
  3. 技术栈推荐（含版本备注）
- 不需要额外的说明文字，直接输出 Markdown 文档

对话记录：
${conversation}`;

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
