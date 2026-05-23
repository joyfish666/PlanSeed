import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import type { Message } from '../../types';
import { useAppStore } from '../../stores/useAppStore';
import { WELCOME_PROMPT } from '../../prompts';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
}

export function MessageList({ messages, isTyping }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sendMessage = useAppStore((s) => s.sendMessage);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1">
      {messages.length === 0 && (
        <div className="text-center text-gray-500 mt-20 space-y-4">
          <div className="text-4xl">🌱</div>
          <p className="text-lg font-medium text-gray-700">PlanSeed</p>
          <p className="text-sm">{WELCOME_PROMPT}</p>
        </div>
      )}
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          onOptionSelect={(value) => sendMessage(value)}
        />
      ))}
      {isTyping && (
        <div className="flex justify-start mb-3">
          <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm text-gray-500">
            <span className="animate-pulse">正在思考...</span>
          </div>
        </div>
      )}
    </div>
  );
}
