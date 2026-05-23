import { useState, useRef, useEffect } from 'react';
import type { Message } from '../../types';
import { parseAIMessage } from '../../utils';

interface MessageBubbleProps {
  message: Message;
  onOptionSelect?: (value: string) => void;
}

export function MessageBubble({ message, onOptionSelect }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const parsed = isUser ? null : parseAIMessage(message.content);

  const [selected, setSelected] = useState<string | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (showCustomInput) inputRef.current?.focus();
  }, [showCustomInput]);

  const handleSelect = (value: string) => {
    if (selected) return;
    setSelected(value);
    onOptionSelect?.(value);
  };

  const handleCustomSubmit = () => {
    const trimmed = customValue.trim();
    if (!trimmed || selected) return;
    setSelected(trimmed);
    setShowCustomInput(false);
    onOptionSelect?.(trimmed);
  };

  const handleCustomKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCustomSubmit();
    }
  };

  const displayText = parsed ? parsed.displayText : message.content;
  const mode = parsed?.mode ?? 'none';
  const options = parsed?.options ?? [];

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className="max-w-[80%]">
        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? 'bg-blue-500 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-800 rounded-bl-md'
          }`}
        >
          <div className="whitespace-pre-wrap">{displayText}</div>
        </div>

        {/* Mode 1: Select options */}
        {mode === 'select' && !selected && (
          <div className="mt-2 ml-1 space-y-2">
            <div className="flex flex-wrap gap-2">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className="px-4 py-2 rounded-lg border text-sm bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  {opt.label}
                </button>
              ))}
              <button
                onClick={() => setShowCustomInput(true)}
                className="px-4 py-2 rounded-lg border text-sm border-dashed border-gray-400 text-gray-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                自定义输入...
              </button>
            </div>
            {showCustomInput && (
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  onKeyDown={handleCustomKeyDown}
                  placeholder="输入你的自定义回答..."
                  rows={1}
                  className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleCustomSubmit}
                  disabled={!customValue.trim()}
                  className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  发送
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mode 2: Q&A follow-up */}
        {mode === 'qa' && !selected && (
          <div className="mt-2 ml-1 space-y-2">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSelect('好的，我已了解，继续项目规划')}
                className="px-4 py-2 rounded-lg border text-sm bg-blue-500 text-white border-blue-500 hover:bg-blue-600 transition-colors cursor-pointer"
              >
                我已了解，继续项目规划
              </button>
              <button
                onClick={() => setShowCustomInput(true)}
                className="px-4 py-2 rounded-lg border text-sm border-gray-300 text-gray-600 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                我还想追问细节
              </button>
            </div>
            {showCustomInput && (
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  onKeyDown={handleCustomKeyDown}
                  placeholder="输入你想追问的问题..."
                  rows={1}
                  className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleCustomSubmit}
                  disabled={!customValue.trim()}
                  className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  提问
                </button>
              </div>
            )}
          </div>
        )}

        {/* Selected feedback */}
        {selected && (
          <div className="flex justify-end mt-1">
            <span className="text-xs text-gray-400">已选择：{selected}</span>
          </div>
        )}
      </div>
    </div>
  );
}
