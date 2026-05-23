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

export interface ParsedOption {
  label: string;
  value: string;
}

/**
 * Parse options from AI response text.
 * Detects patterns like:
 *   1. **选项名** — 描述
 *   1. 选项名：描述
 *   - **选项名** — 描述
 *   - 选项名：描述
 */
export function extractOptions(text: string): ParsedOption[] {
  const lines = text.split('\n');
  const options: ParsedOption[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Pattern: numbered list with bold label — "1. **Label**" or "1. **Label** — desc"
    const numberedBold = trimmed.match(/^\d+\.\s*\*\*(.+?)\*\*(?:\s*[—\-:：]\s*(.+))?$/);
    if (numberedBold) {
      options.push({ label: numberedBold[1].trim(), value: numberedBold[1].trim() });
      continue;
    }

    // Pattern: numbered list without bold — "1. Label：desc" or "1. Label — desc"
    const numberedPlain = trimmed.match(/^\d+\.\s*(.+?)(?:[：:—\-]\s*.+)?$/);
    if (numberedPlain && !trimmed.match(/^\d+\.\s*\[/)) {
      const label = numberedPlain[1].trim();
      if (label.length < 30 && !label.includes('。')) {
        options.push({ label, value: label });
      }
      continue;
    }

    // Pattern: bullet list with bold — "- **Label**" or "- **Label** — desc"
    const bulletBold = trimmed.match(/^[-*]\s*\*\*(.+?)\*\*(?:\s*[—\-:：]\s*(.+))?$/);
    if (bulletBold) {
      options.push({ label: bulletBold[1].trim(), value: bulletBold[1].trim() });
      continue;
    }
  }

  // Only return options if we found enough to be meaningful (2+)
  return options.length >= 2 ? options : [];
}

/**
 * Remove option list lines from AI text so they don't appear twice
 * (once as text, once as cards).
 */
export function removeOptionLines(text: string): string {
  const lines = text.split('\n');
  const filtered = lines.filter((line) => {
    const trimmed = line.trim();
    if (/^\d+\.\s*\*\*(.+?)\*\*/.test(trimmed)) return false;
    if (/^\d+\.\s*(.+?)(?:[：:—\-]\s*.+)?$/.test(trimmed)) {
      const match = trimmed.match(/^\d+\.\s*(.+?)(?:[：:—\-]\s*.+)?$/);
      if (match && match[1].trim().length < 30 && !match[1].includes('。')) return false;
    }
    if (/^[-*]\s*\*\*(.+?)\*\*/.test(trimmed)) return false;
    return true;
  });
  return filtered.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
