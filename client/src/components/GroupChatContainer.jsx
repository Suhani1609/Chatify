import { useEffect, useRef, useState } from "react";
import { useGroupStore } from "../store/useGroupStore.js";
import { useAuthStore } from "../store/useAuthStore.js";
import { getSocket } from "../lib/socket.js";
import ImageLightbox from "./ImageLightbox.jsx";
import EmojiPicker from "emoji-picker-react";

const COLORS = ["#00a884","#7f77dd","#d85a30","#ba7517","#993556","#0f6e56","#185fa5"];

const GroupChatContainer = () => {
  const {
    selectedGroup, groupMessages, isGroupMessagesLoading,
    sendGroupMessage, setSelectedGroup,
  } = useGroupStore();
  const { authUser } = useAuthStore();

  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const emojiRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [groupMessages]);

  useEffect(() => {
    const handleClick = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) setShowEmoji(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) { alert("Image must be under 5MB"); return; }
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!text.trim() && !imagePreview) return;
    setIsSending(true);
    try {
      await sendGroupMessage(selectedGroup._id, {
        text: text.trim(), image: imagePreview || "",
      });
      setText(""); setImagePreview(null);
      if (fileRef.current) fileRef.current.value = "";
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const getDateLabel = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  };

  const canSend = (text.trim() || imagePreview) && !isSending;

  const groupColor = COLORS[selectedGroup.name.charCodeAt(0) % COLORS.length];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>

      {/* Header */}
      <div style={{
        padding: "10px 16px", background: "var(--wa-bg-secondary)",
        display: "flex", alignItems: "center",
        gap: "12px", height: "60px",
        borderBottom: "0.5px solid var(--wa-border)", flexShrink: 0,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: groupColor, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: "700", fontSize: 16, color: "#fff", overflow: "hidden",
        }}>
          {selectedGroup.avatar
            ? <img src={selectedGroup.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : selectedGroup.name[0].toUpperCase()
          }
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "15px", fontWeight: "500", color: "var(--wa-text-primary)" }}>
            {selectedGroup.name}
          </div>
          <div style={{ fontSize: "12px", color: "var(--wa-text-muted)" }}>
            {selectedGroup.members.length} members
          </div>
        </div>
        <button
          onClick={() => setSelectedGroup(null)}
          style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "none", border: "none", cursor: "pointer",
            color: "var(--wa-icon)", fontSize: "18px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >✕</button>
      </div>

      {/* Messages */}
      <div className="chat-bg-pattern" style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
        {isGroupMessagesLoading ? (
          <div style={{ padding: "12px 0" }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: i % 2 === 0 ? "flex-start" : "flex-end",
                marginBottom: "8px",
              }}>
                <div style={{
                  width: `${100 + (i * 40) % 100}px`, height: "40px",
                  background: "var(--wa-bg-secondary)", borderRadius: "8px",
                  animation: "pulse 1.5s ease-in-out infinite",
                }} />
              </div>
            ))}
          </div>
        ) : groupMessages.length === 0 ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: "20px" }}>
            <div style={{
              background: "var(--wa-bg-secondary)", borderRadius: "12px",
              padding: "12px 20px", color: "var(--wa-text-muted)",
              fontSize: "13px", textAlign: "center",
            }}>
              🔒 This is the beginning of <strong style={{ color: "var(--wa-text-secondary)" }}>{selectedGroup.name}</strong>
            </div>
          </div>
        ) : (
          groupMessages.map((msg, i) => {
            const isMine = msg.senderId._id === authUser._id || msg.senderId === authUser._id;
            const senderName = msg.senderId.username || "Unknown";
            const senderColor = COLORS[senderName.charCodeAt(0) % COLORS.length];
            const prevMsg = groupMessages[i - 1];
            const showDate = !prevMsg || getDateLabel(msg.createdAt) !== getDateLabel(prevMsg.createdAt);
            const showSender = !isMine && (!prevMsg || prevMsg.senderId._id !== msg.senderId._id);

            return (
              <div key={msg._id}>
                {showDate && (
                  <div style={{ display: "flex", justifyContent: "center", margin: "12px 0" }}>
                    <span style={{
                      background: "var(--wa-bg-secondary)",
                      color: "var(--wa-text-secondary)",
                      fontSize: "11px", padding: "4px 12px", borderRadius: "8px",
                    }}>{getDateLabel(msg.createdAt)}</span>
                  </div>
                )}

                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isMine ? "flex-end" : "flex-start",
                  marginBottom: "2px",
                }}>
                  <div style={{
                    maxWidth: "min(65%, 420px)",
                    width: "fit-content",
                    background: isMine ? "var(--wa-bubble-out)" : "var(--wa-bubble-in)",
                    borderRadius: isMine ? "8px 0 8px 8px" : "0 8px 8px 8px",
                    padding: "6px 10px 4px",
                    position: "relative",
                  }}>
                    {/* Tail */}
                    <div style={{
                      position: "absolute", top: 0,
                      ...(isMine ? { right: -8 } : { left: -8 }),
                      width: 0, height: 0, borderStyle: "solid",
                      borderWidth: isMine ? "0 0 8px 8px" : "0 8px 8px 0",
                      borderColor: isMine
                        ? "transparent transparent transparent var(--wa-bubble-out)"
                        : "transparent var(--wa-bubble-in) transparent transparent",
                    }} />

                    {/* Sender name (group messages) */}
                    {showSender && (
                      <div style={{ fontSize: "12px", fontWeight: "600", color: senderColor, marginBottom: "3px" }}>
                        {senderName}
                      </div>
                    )}

                    {/* Image */}
                    {msg.image && (
                      <img
                        src={msg.image} alt="attachment"
                        onClick={() => setLightboxSrc(msg.image)}
                        style={{
                          maxWidth: "240px", width: "100%",
                          borderRadius: "6px", display: "block",
                          marginBottom: msg.text ? "5px" : "0",
                          cursor: "pointer", maxHeight: "240px", objectFit: "cover",
                        }}
                      />
                    )}

                    {/* Text */}
                    {msg.text && (
                      <div style={{ display: "flex", alignItems: "flex-end", gap: "6px" }}>
                        <span style={{
                          fontSize: "14px", color: "var(--wa-text-primary)",
                          lineHeight: "1.4", wordBreak: "break-word", flex: 1,
                        }}>
                          {msg.text}
                        </span>
                        <span style={{
                          fontSize: "11px", color: "var(--wa-text-muted)",
                          whiteSpace: "nowrap", flexShrink: 0, alignSelf: "flex-end",
                          marginBottom: "1px",
                        }}>
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    )}

                    {!msg.text && msg.image && (
                      <div style={{
                        display: "flex", justifyContent: "flex-end",
                        alignItems: "center", marginTop: "3px",
                      }}>
                        <span style={{ fontSize: "11px", color: "var(--wa-text-muted)" }}>
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        background: "var(--wa-bg-secondary)",
        borderTop: "0.5px solid var(--wa-border)",
        padding: "8px 12px", flexShrink: 0, position: "relative",
      }}>
        {showEmoji && (
          <div ref={emojiRef} style={{ position: "absolute", bottom: "64px", left: "12px", zIndex: 1000 }}>
            <EmojiPicker
              onEmojiClick={(e) => setText((p) => p + e.emoji)}
              theme="dark" skinTonesDisabled
              height={350} width={300}
              previewConfig={{ showPreview: false }}
            />
          </div>
        )}

        {imagePreview && (
          <div style={{ marginBottom: "8px", position: "relative", display: "inline-block" }}>
            <img src={imagePreview} alt="preview" style={{
              height: "80px", borderRadius: "8px", objectFit: "cover",
              border: "0.5px solid var(--wa-border)",
            }} />
            <button
              onClick={() => { setImagePreview(null); if (fileRef.current) fileRef.current.value = ""; }}
              style={{
                position: "absolute", top: -6, right: -6,
                width: 20, height: 20, borderRadius: "50%",
                background: "#e24b4a", border: "none", cursor: "pointer",
                color: "#fff", fontSize: "11px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >✕</button>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            style={{
              width: 36, height: 36, borderRadius: "50%", background: "none",
              border: "none", cursor: "pointer", fontSize: "20px",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: showEmoji ? "#00a884" : "var(--wa-icon)",
            }}
            onClick={() => setShowEmoji(!showEmoji)}
          >😊</button>

          <button
            style={{
              width: 36, height: 36, borderRadius: "50%", background: "none",
              border: "none", cursor: "pointer", color: "var(--wa-icon)", fontSize: "20px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onClick={() => fileRef.current?.click()}
          >📎</button>
          <input type="file" ref={fileRef} accept="image/*" onChange={handleImage} style={{ display: "none" }} />

          <input
            type="text" value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) handleSend(e); }}
            placeholder={`Message ${selectedGroup.name}`}
            style={{
              flex: 1, background: "var(--wa-bg-tertiary)",
              border: "none", borderRadius: "24px",
              padding: "10px 18px", color: "var(--wa-text-primary)",
              fontSize: "14px", outline: "none",
            }}
          />

          <button
            onClick={handleSend} disabled={!canSend}
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: canSend ? "#00a884" : "var(--wa-bg-tertiary)",
              border: "none", cursor: canSend ? "pointer" : "default",
              color: "#fff", fontSize: "16px",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "background .2s",
            }}
          >
            {isSending ? (
              <div style={{
                width: 16, height: 16,
                border: "2px solid rgba(255,255,255,0.3)",
                borderTop: "2px solid #fff",
                borderRadius: "50%", animation: "spin 0.8s linear infinite",
              }} />
            ) : "➤"}
          </button>
        </div>
      </div>

      {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
    </div>
  );
};

export default GroupChatContainer;