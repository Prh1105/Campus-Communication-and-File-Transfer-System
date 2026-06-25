import { useChat } from '../contexts/ChatContext';

export default function TypingIndicator() {
  const { typingUsers, onlineUsers, activeChat } = useChat();

  if (!activeChat || (typingUsers || []).length === 0) return null;

  const names = typingUsers
    .map((id) => onlineUsers.find((u) => u.id === id)?.displayName)
    .filter(Boolean);

  if (names.length === 0) return null;

  return (
    <div className="px-6 py-1.5 text-xs text-gray-500 italic">
      {names.length === 1
        ? `${names[0]} 正在输入...`
        : `${names.join(', ')} 正在输入...`}
    </div>
  );
}
