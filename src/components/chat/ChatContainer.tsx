import { MessageList } from './MessageList';
import { TextInput } from './TextInput';
import { useAppStore } from '../../stores/useAppStore';

export function ChatContainer() {
  const messages = useAppStore((s) => s.messages);
  const isTyping = useAppStore((s) => s.isTyping);
  const sendMessage = useAppStore((s) => s.sendMessage);
  const apiKey = useAppStore((s) => s.apiKey);

  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} isTyping={isTyping} />
      <TextInput
        onSend={sendMessage}
        disabled={isTyping || !apiKey}
        placeholder={!apiKey ? '请先在设置中配置 API Key...' : '输入你的回答...'}
      />
    </div>
  );
}
