import type { User } from '@campus-im/shared';

interface Props {
  user: User;
  onClick: () => void;
}

export default function UserCard({ user, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition text-left"
    >
      <div className="relative shrink-0">
        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
          {user.displayName?.charAt(0) || 'U'}
        </div>
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
            user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm">{user.displayName}</p>
        <p className="text-xs text-gray-500 truncate">@{user.username}</p>
      </div>
    </button>
  );
}
