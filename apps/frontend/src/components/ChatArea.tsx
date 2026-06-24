import { useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

export default function ChatArea() {
  const { activeChat, loadHistory } = useChat();

  useEffect(() => {
    if (activeChat) {
      loadHistory(activeChat);
    }
  }, [activeChat, loadHistory]);

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">校园通信系统</h2>
          <p className="text-gray-500">选择一个聊天室或在线用户开始聊天</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <ChatHeader />
      <MessageList />
      <TypingIndicator />
      <MessageInput />
    </div>
  );
}
