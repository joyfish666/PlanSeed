import { useState } from 'react';
import type { Message } from '../../types';
import { extractOptions, removeOptionLines, type ParsedOption } from '../../utils';

interface MessageBubbleProps {
  message: Message;
  onOptionSelect?: (value: string) => void;
}

export function MessageBubble({ message, onOptionSelect }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [selected, setSelected] = useState<string | null>(null);

  const options = isUser ? [] : extractOptions(message.content);
  const displayContent = options.length > 0 ? removeOptionLines(message.content) : message.content;

  const handleSelect = (value: string) => {
    if (selected) return;
    setSelected(value);
    onOptionSelect?.(value);
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className="max-w-[80%]">
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? 'bg-blue-500 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-800 rounded-bl-md'
          }`}
        >
          <div className="whitespace-pre-wrap">{displayContent}</div>
        </div>
        {options.length > 0 && !selected && (
          <div className="flex flex-wrap gap-2 mt-2 ml-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className="px-4 py-2 rounded-lg border text-sm bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
        {selected && (
          <div className="flex justify-end mt-1">
            <span className="text-xs text-gray-400">已选择：{selected}</span>
          </div>
        )}
      </div>
    </div>
  );
}
