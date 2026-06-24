import { useChat } from "../contexts/ChatContext";

export default function ChatHeader() {
  const { activeChat, onlineUsers, rooms } = useChat();

  if (!activeChat) return null;

  let title = "";
  let subtitle = "";

  if (activeChat.type === "private") {
    const target = onlineUsers.find((u) => u.id === activeChat.userId);
    title = target?.displayName || `用户 #${activeChat.userId}`;
    subtitle = target?.status === "online" ? "在线" : "离线";
  } else {
    const room = rooms.find((r) => r.id === activeChat.roomId);
    title = room?.name || `房间 #${activeChat.roomId}`;
    subtitle = room?.memberCount != null ? `${room.memberCount} 名成员` : "";
  }

  return (
    <div className="h-16 px-6 flex items-center border-b border-gray-200 bg-white shrink-0">
      <div>
        <h2 className="font-semibold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}
