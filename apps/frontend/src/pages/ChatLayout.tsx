import { useEffect, useState } from "react";
import { useChat } from "../contexts/ChatContext";
import { getRooms } from "../services/room.service";
import { getAllUsers } from "../services/user.service";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";

export default function ChatLayout() {
  const { setOnlineUsers, setRooms, activeChat, selectChat } = useChat();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const [roomsData, usersData] = await Promise.all([
          getRooms(),
          getAllUsers(),
        ]);
        if (cancelled) return;

        if (roomsData && usersData) {
          setRooms(roomsData);
          setOnlineUsers(usersData);
          if (!activeChat && roomsData.length > 0) {
            selectChat({ type: "room", roomId: roomsData[0].id });
          }
        }
        setError("");
      } catch (err: any) {
        if (cancelled) return;
        setError(err.message || "加载失败，请刷新重试");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-lg">正在加载数据...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-100 gap-4">
        <p className="text-red-500 text-lg">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
        >
          刷新页面
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-white">
      <Sidebar />
      <ChatArea />
    </div>
  );
}
