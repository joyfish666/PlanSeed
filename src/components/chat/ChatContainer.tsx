import { MessageList } from './MessageList';
import { TextInput } from './TextInput';
import { useAppStore } from '../../stores/useAppStore';
import { useT } from '../../i18n';

export function ChatContainer() {
  const messages = useAppStore((s) => s.messages);
  const isTyping = useAppStore((s) => s.isTyping);
  const sendMessage = useAppStore((s) => s.sendMessage);
  const startWithConnectionTest = useAppStore((s) => s.startWithConnectionTest);
  const apiKey = useAppStore((s) => s.apiKey);
  const t = useT();

  return (
    <div className="flex flex-col h-full">
      <MessageList
        messages={messages}
        isTyping={isTyping}
        onStart={startWithConnectionTest}
      />
      <TextInput
        onSend={sendMessage}
        disabled={isTyping || !apiKey}
        placeholder={!apiKey ? t.chat.placeholderNoKey : t.chat.placeholderInput}
      />
    </div>
  );
}
