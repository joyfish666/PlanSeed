import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { OptionCards } from './OptionCards';
import type { Message } from '../../types';
import { useAppStore } from '../../stores/useAppStore';
import { WELCOME_PROMPT, PROJECT_TYPE_PROMPT } from '../../prompts';

const PROJECT_TYPES = [
  { label: '日历应用', value: 'calendar', description: '日程管理与提醒' },
  { label: '博客平台', value: 'blog', description: '内容创作与发布' },
  { label: '电商商城', value: 'ecommerce', description: '在线购物与交易' },
  { label: '待办事项', value: 'todo', description: '任务管理与追踪' },
  { label: '自定义', value: 'custom', description: '描述你的想法' },
];

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
}

export function MessageList({ messages, isTyping }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentStep = useAppStore((s) => s.currentStep);
  const selectOption = useAppStore((s) => s.selectOption);

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
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {currentStep === 'project_type' && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
        <div className="ml-2 mt-2">
          <OptionCards options={PROJECT_TYPES} onSelect={(v) => selectOption('projectType', v as string)} />
        </div>
      )}
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
