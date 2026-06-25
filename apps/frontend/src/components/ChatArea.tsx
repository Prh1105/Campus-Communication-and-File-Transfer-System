import { useEffect } from "react";
import { useChat } from "../contexts/ChatContext";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";

export default function ChatArea() {
  const { activeChat, loadHistory } = useChat();

  useEffect(() => {
    if (activeChat) {
      loadHistory(activeChat);
    }
  }, [activeChat, loadHistory]);

  if (!activeChat) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9fafb",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💬</div>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "#374151",
              marginBottom: "0.5rem",
            }}
          >
            校园通信系统
          </h2>
          <p style={{ color: "#6b7280" }}>
            选择一个聊天室或在线用户开始聊天
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f9fafb",
        border: "1px solid green", // 🔴 调试
      }}
    >
      <ChatHeader />
      <MessageList />
      <TypingIndicator />
      <MessageInput />
    </div>
  );
}
