import { useState, useRef, useEffect } from 'react';
import type { Message } from '../../types';
import { parseAIMessage } from '../../utils';

interface MessageBubbleProps {
  message: Message;
  isStartMessage?: boolean;
  onOptionSelect?: (value: string) => void;
  onStart?: () => Promise<boolean>;
}

export function MessageBubble({ message, isStartMessage, onOptionSelect, onStart }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const parsed = isUser ? null : parseAIMessage(message.content);

  const [selected, setSelected] = useState<string | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [testing, setTesting] = useState(false);
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

  const handleStart = async () => {
    if (selected || testing) return;
    setTesting(true);
    try {
      const ok = await onStart?.();
      if (ok) setSelected('已测试模型连接正常，开始规划');
    } finally {
      setTesting(false);
    }
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

  // Hide generic "自定义输入..." if options already contain a custom-type option
  const hasCustomOption = options.some(
    (opt) => opt.label.includes('自定义') || opt.label.includes('其他'),
  );

  // Detect if this is the start message with the connection test button
  const isStartFlow = isStartMessage && options.some(
    (opt) => opt.value === '已测试模型连接正常，开始规划',
  );

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

        {/* Start flow: single connection-test button */}
        {isStartFlow && !selected && (
          <div className="mt-3 ml-1">
            <button
              onClick={handleStart}
              disabled={testing}
              className="px-6 py-2.5 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300 transition-colors cursor-pointer flex items-center gap-2"
            >
              {testing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  正在检测连接...
                </>
              ) : (
                '测试模型连接正常，开始规划'
              )}
            </button>
          </div>
        )}

        {/* Mode 1: Select options (not start flow) */}
        {mode === 'select' && !isStartFlow && !selected && (
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
              {!hasCustomOption && (
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="px-4 py-2 rounded-lg border text-sm border-dashed border-gray-400 text-gray-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  自定义输入...
                </button>
              )}
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
