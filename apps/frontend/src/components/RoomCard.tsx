import type { Room } from '@campus-im/shared';

interface Props {
  room: Room;
  isActive: boolean;
  onClick: () => void;
}

export default function RoomCard({ room, isActive, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 transition text-left ${
        isActive ? 'bg-blue-50 border-r-2 border-blue-500' : 'hover:bg-gray-100'
      }`}
    >
      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold shrink-0">
        {room.isGroup ? '#' : '@'}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
          {room.name}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {room.memberCount != null ? `${room.memberCount} 名成员` : ''}
        </p>
      </div>
    </button>
  );
}
