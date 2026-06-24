import { useEffect, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import MessageBubble from './MessageBubble';

export default function MessageList() {
  const { messages } = useChat();
  const { user: me } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 scrollbar-thin bg-gray-50">
      {messages.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          <p>暂无消息，发送第一条消息开始聊天吧</p>
        </div>
      )}
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} isMine={msg.senderId === me?.id} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
