import { useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { getRooms } from '../services/room.service';
import { getAllUsers } from '../services/user.service';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';

export default function ChatLayout() {
  const { setOnlineUsers, setRooms, activeChat, selectChat } = useChat();

  useEffect(() => {
    Promise.all([getRooms(), getAllUsers()])
      .then(([roomsData, usersData]) => {
        setRooms(roomsData);
        setOnlineUsers(usersData);
        // 默认选中第一个房间
        if (!activeChat && roomsData.length > 0) {
          selectChat({ type: 'room', roomId: roomsData[0].id });
        }
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-screen flex bg-white">
      <Sidebar />
      <ChatArea />
    </div>
  );
}
