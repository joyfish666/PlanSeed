import { SYSTEM_PROMPT, START_PLANNING_HINT } from '../prompts';
import { parseAIMessage } from '../utils';

interface AIConfig {
  apiKey: string;
  apiEndpoint: string;
  model: string;
}

interface AIMessage {
  role: string;
  content: string;
}

export type DocumentKind = 'preview' | 'final';

function authHeaders(config: AIConfig): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey}`,
  };
}

async function throwIfNotOk(response: Response): Promise<void> {
  if (response.ok) return;
  const body = await response.text().catch(() => '');
  throw new Error(`API error ${response.status}: ${body.slice(0, 300) || response.statusText}`);
}

async function* streamResponse(response: Response): AsyncGenerator<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Response body is empty');
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

/**
 * Build a clean conversation transcript for document generation:
 * strips UI markers ([OPTIONS:...], [Q&A], [REVIEW_PASS:...]) and internal
 * instructions (START_PLANNING_HINT) so they never leak into the document.
 */
function buildConversationForDocument(messages: AIMessage[]): string {
  return messages
    .filter((m) => m.content !== START_PLANNING_HINT)
    .map((m) => {
      const content = m.role === 'assistant' ? parseAIMessage(m.content).displayText : m.content;
      return `${m.role === 'user' ? '用户' : 'AI'}：${content}`;
    })
    .join('\n\n');
}

const DOC_FORMAT_RULES = `严格格式要求（违反即失败）：
- 第一个字符必须是 # 标题，不要以任何文字开头
- 最后一个字符必须是文档内容，不要以任何总结或告别语结尾
- 禁止出现"好的"、"以下是"、"以上是"、"希望"、"如果需要"等任何对话性文字
- 输出纯 Markdown 文档，不要包含任何元说明`;

function buildDocumentPrompt(messages: AIMessage[], kind: DocumentKind): string {
  const conversation = buildConversationForDocument(messages);

  const header =
    kind === 'preview'
      ? `以下是用户与 AI 的对话记录，请根据已收集到的信息，生成一份 Markdown 格式的项目规划文档预览。

要求：
- 仅包含已经明确的信息，不要编造未讨论的内容
- 按以下结构组织：项目基本原则与约束、功能规范、技术栈推荐
- 如果某个板块信息不足，写"（待补充）"`
      : `以下是用户与 AI 的完整对话记录，请从中提取所有已确认的项目信息，生成一份完整的项目规划文档。

要求：
- 从对话中提取所有明确的信息，不要遗漏任何用户确认过的内容
- 按以下结构生成 Markdown 文档：
  1. 项目基本原则与约束
  2. 功能规范（含用户故事和验收标准）
  3. 技术栈推荐（含版本备注）`;

  return `${header}

${DOC_FORMAT_RULES}

对话记录：
${conversation}`;
}

/**
 * Strip AI-generated preamble and postamble from document content.
 * Removes common patterns like "好的，这是..." at the start
 * and "以上是..." / "希望..." at the end.
 */
function stripDocumentNoise(text: string): string {
  let result = text.trim();

  // Remove leading non-markdown preamble (lines before the first # heading)
  const firstHeading = result.match(/^#\s/m);
  if (firstHeading && firstHeading.index && firstHeading.index > 0) {
    result = result.slice(firstHeading.index);
  }

  // Remove trailing non-markdown postamble (lines after the last markdown content)
  const lines = result.split('\n');
  let lastContentIdx = lines.length - 1;
  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    if (trimmed === '') continue;
    // If it starts with markdown syntax, it's content
    if (/^(#|[-*|>]|\d+\.|\||```)/.test(trimmed) || trimmed.startsWith('**') || trimmed.startsWith('- ')) {
      lastContentIdx = i;
      break;
    }
    // If it looks like a conversational closing, skip it
    if (/^(以上|希望|如果|如需|如有|请注意|备注|注[:：])/.test(trimmed)) {
      lastContentIdx = i - 1;
      continue;
    }
    lastContentIdx = i;
    break;
  }
  result = lines.slice(0, lastContentIdx + 1).join('\n').trim();

  return result;
}

export const aiService = {
  async testConnection(config: AIConfig): Promise<string> {
    const response = await fetch(`${config.apiEndpoint}/chat/completions`, {
      method: 'POST',
      headers: authHeaders(config),
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'user', content: '用一句话简短地介绍你自己。' },
        ],
        stream: false,
      }),
    });

    await throwIfNotOk(response);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '（模型未返回内容）';
  },

  async *sendMessage(messages: AIMessage[], config: AIConfig): AsyncGenerator<string> {
    const response = await fetch(`${config.apiEndpoint}/chat/completions`, {
      method: 'POST',
      headers: authHeaders(config),
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    await throwIfNotOk(response);
    yield* streamResponse(response);
  },

  async generateDocument(messages: AIMessage[], config: AIConfig, kind: DocumentKind = 'final'): Promise<string> {
    const response = await fetch(`${config.apiEndpoint}/chat/completions`, {
      method: 'POST',
      headers: authHeaders(config),
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildDocumentPrompt(messages, kind) },
        ],
      }),
    });

    await throwIfNotOk(response);
    const data = await response.json();
    return stripDocumentNoise(data.choices?.[0]?.message?.content || '');
  },
};
