import { useChat } from '../contexts/ChatContext';
import RoomCard from './RoomCard';

export default function RoomList() {
  const { rooms, activeChat, selectChat } = useChat();

  return (
    <div className="py-2">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          isActive={activeChat?.type === 'room' && activeChat.roomId === room.id}
          onClick={() => selectChat({ type: 'room', roomId: room.id })}
        />
      ))}
      {rooms.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-8">暂无聊天室</p>
      )}
    </div>
  );
}
