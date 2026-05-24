import type { ParsedMessage } from "./types.js";

/**
 * Parse AI response for mode markers:
 * - [OPTIONS:A|B|C] → select mode with options
 * - [Q&A] → Q&A mode
 * - [REVIEW_PASS:completeness|feasibility] → review passed signal
 * - neither → plain text (none mode)
 */
export function parseAIMessage(text: string): ParsedMessage {
  let cleaned = text;
  let reviewPass: 'completeness' | 'feasibility' | undefined;

  // Extract [REVIEW_PASS:...] marker
  const reviewMatch = cleaned.match(/\[REVIEW_PASS:(completeness|feasibility)\]/);
  if (reviewMatch) {
    reviewPass = reviewMatch[1] as 'completeness' | 'feasibility';
    cleaned = cleaned.replace(/\[REVIEW_PASS:(?:completeness|feasibility)\]/, '').trim();
  }

  // Check for [OPTIONS:...] marker
  const optionsMatch = cleaned.match(/\[OPTIONS:(.+?)\]/);
  if (optionsMatch) {
    const labels = optionsMatch[1].split('|').map((s) => s.trim()).filter(Boolean);
    const options = labels.map((label) => ({ label, value: label }));
    const displayText = cleaned.replace(/\[OPTIONS:.+?\]/, '').trim();
    return { mode: 'select', options, displayText, reviewPass };
  }

  // Check for [Q&A] marker
  if (cleaned.includes('[Q&A]')) {
    const displayText = cleaned.replace('[Q&A]', '').trim();
    return { mode: 'qa', options: [], displayText, reviewPass };
  }

  return { mode: 'none', options: [], displayText: cleaned, reviewPass };
}
