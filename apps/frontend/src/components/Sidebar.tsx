import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import UserList from './UserList';
import RoomList from './RoomList';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { onlineUsers, selectChat } = useChat();
  const [tab, setTab] = useState<'rooms' | 'online'>('rooms');

  return (
    <div className="w-80 h-full flex flex-col bg-gray-50 border-r border-gray-200 shrink-0">
      {/* 当前用户信息 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
              {user?.displayName?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.displayName}</p>
              <p className="text-xs text-gray-500">@{user?.username}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-red-500 transition"
            title="退出登录"
          >
            退出
          </button>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setTab('rooms')}
          className={`flex-1 py-3 text-sm font-medium transition ${
            tab === 'rooms'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          聊天室
        </button>
        <button
          onClick={() => setTab('online')}
          className={`flex-1 py-3 text-sm font-medium transition ${
            tab === 'online'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          在线用户 ({onlineUsers.filter((u) => u.status === 'online').length})
        </button>
      </div>

      {/* 列表区域 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {tab === 'rooms' ? (
          <RoomList />
        ) : (
          <UserList onSelect={(userId) => selectChat({ type: 'private', userId })} />
        )}
      </div>
    </div>
  );
}
