export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function formatDate(date: Date = new Date()): string {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export type MessageMode = 'select' | 'qa' | 'none';

export interface ParsedMessage {
  mode: MessageMode;
  options: { label: string; value: string }[];
  displayText: string;
}

/**
 * Parse AI response for mode markers:
 * - [OPTIONS:A|B|C] → select mode with options
 * - [Q&A] → Q&A mode
 * - neither → plain text (none mode)
 */
export function parseAIMessage(text: string): ParsedMessage {
  // Check for [OPTIONS:...] marker
  const optionsMatch = text.match(/\[OPTIONS:(.+?)\]/);
  if (optionsMatch) {
    const labels = optionsMatch[1].split('|').map((s) => s.trim()).filter(Boolean);
    const options = labels.map((label) => ({ label, value: label }));
    const displayText = text.replace(/\[OPTIONS:.+?\]/, '').trim();
    return { mode: 'select', options, displayText };
  }

  // Check for [Q&A] marker
  if (text.includes('[Q&A]')) {
    const displayText = text.replace('[Q&A]', '').trim();
    return { mode: 'qa', options: [], displayText };
  }

  return { mode: 'none', options: [], displayText: text };
}
