import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore.js";
import ChatHeader from "./ChatHeader.jsx";
import MessageBubble from "./MessageBubble.jsx";
import MessageInput from "./MessageInput.jsx";

const getDateLabel = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
};

const ChatContainer = () => {
  const {
    messages, isMessagesLoading, selectedUser,
    subscribeToMessages, unsubscribeFromMessages,
  } = useChatStore();
  const bottomRef = useRef(null);

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <ChatHeader />

      <div className="chat-bg-pattern" style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
        {isMessagesLoading ? (
          <div style={{ padding: "12px 0" }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: i % 2 === 0 ? "flex-start" : "flex-end",
                marginBottom: "8px",
              }}>
                <div style={{
                  width: `${120 + (i * 30) % 120}px`, height: "40px",
                  background: "var(--wa-bg-secondary)",
                  borderRadius: i % 2 === 0 ? "0 8px 8px 8px" : "8px 0 8px 8px",
                  animation: "pulse 1.5s ease-in-out infinite",
                  animationDelay: `${i * 0.15}s`,
                }} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: "20px" }}>
            <div style={{
              background: "var(--wa-bg-secondary)", borderRadius: "12px",
              padding: "12px 20px", color: "var(--wa-text-muted)",
              fontSize: "13px", textAlign: "center",
            }}>
              🔒 Messages are end-to-end encrypted.<br />
              Say hi to <strong style={{ color: "var(--wa-text-secondary)" }}>{selectedUser?.username}</strong>!
            </div>
          </div>
        ) : (
          messages.map((msg, i) => {
            const prevMsg = messages[i - 1];
            const showDate = !prevMsg || getDateLabel(msg.createdAt) !== getDateLabel(prevMsg.createdAt);
            return (
              <MessageBubble
                key={msg._id}
                message={msg}
                showDate={showDate}
                dateLabel={getDateLabel(msg.createdAt)}
              />
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;