import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import UserCard from './UserCard';

export default function UserList({ onSelect }: { onSelect: (userId: number) => void }) {
  const { onlineUsers } = useChat();
  const { user: me } = useAuth();

  const others = (onlineUsers || []).filter((u) => u.id !== me?.id);
  const online = others.filter((u) => u.status === 'online');
  const offline = others.filter((u) => u.status !== 'online');

  return (
    <div className="py-2">
      {online.length > 0 && (
        <div className="px-4 py-1 text-xs text-gray-400 font-medium uppercase">在线 — {online.length}</div>
      )}
      {online.map((u) => (
        <UserCard key={u.id} user={u} onClick={() => onSelect(u.id)} />
      ))}
      {offline.length > 0 && (
        <>
          <div className="px-4 py-1 mt-2 text-xs text-gray-400 font-medium uppercase">离线 — {offline.length}</div>
          {offline.map((u) => (
            <UserCard key={u.id} user={u} onClick={() => onSelect(u.id)} />
          ))}
        </>
      )}
      {others.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-8">暂无其他用户</p>
      )}
    </div>
  );
}
