import { useState, useRef, useEffect } from "react";
import { useChatStore } from "../store/useChatStore.js";
import { getSocket } from "../lib/socket.js";
import EmojiPicker from "emoji-picker-react";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const fileInputRef = useRef(null);
  const typingRef = useRef(null);
  const emojiRef = useRef(null);

  const { sendMessage, selectedUser, replyingTo, setReplyingTo } = useChatStore();
  const socket = getSocket();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (socket && selectedUser) {
      socket.emit("typing", { receiverId: selectedUser._id });
      clearTimeout(typingRef.current);
      typingRef.current = setTimeout(() => {
        socket.emit("stopTyping", { receiverId: selectedUser._id });
      }, 1500);
    }
  };

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
    setShowEmoji(false);
    try {
      await sendMessage({ text: text.trim(), image: imagePreview || "" });
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      socket?.emit("stopTyping", { receiverId: selectedUser._id });
    } finally {
      setIsSending(false);
    }
  };

  const canSend = (text.trim() || imagePreview) && !isSending;

  const btnStyle = {
    width: 36, height: 36, borderRadius: "50%",
    background: "none", border: "none", cursor: "pointer",
    color: "var(--wa-icon)", fontSize: "20px",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  };

  return (
    <div style={{
      background: "var(--wa-bg-secondary)",
      borderTop: "0.5px solid var(--wa-border)",
      padding: "8px 12px", flexShrink: 0, position: "relative",
    }}>
      {/* Emoji picker */}
      {showEmoji && (
        <div ref={emojiRef} style={{ position: "absolute", bottom: "64px", left: "12px", zIndex: 1000 }}>
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme="dark" skinTonesDisabled
            height={350} width={300}
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      {/* Reply bar */}
      {replyingTo && (
        <div style={{
          display: "flex", alignItems: "center",
          background: "var(--wa-bg-tertiary)", borderRadius: "8px",
          padding: "8px 12px", marginBottom: "8px", gap: "10px",
          borderLeft: "3px solid #00a884",
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "12px", color: "#00a884", fontWeight: "600", marginBottom: "2px" }}>
              Replying to {replyingTo.senderUsername}
            </div>
            <div style={{
              fontSize: "12px", color: "var(--wa-text-secondary)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {replyingTo.text || "📷 Image"}
            </div>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--wa-text-muted)", fontSize: "16px", flexShrink: 0,
            }}
          >✕</button>
        </div>
      )}

      {/* Image preview */}
      {imagePreview && (
        <div style={{ marginBottom: "8px", position: "relative", display: "inline-block" }}>
          <img src={imagePreview} alt="preview" style={{
            height: "80px", borderRadius: "8px", objectFit: "cover",
            border: "0.5px solid var(--wa-border)",
          }} />
          <button
            onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
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
          style={{ ...btnStyle, color: showEmoji ? "#00a884" : "var(--wa-icon)" }}
          onClick={() => setShowEmoji(!showEmoji)}
        >😊</button>

        <button style={btnStyle} onClick={() => fileInputRef.current?.click()}>📎</button>
        <input
          type="file" ref={fileInputRef} accept="image/*"
          onChange={handleImage} style={{ display: "none" }}
        />

        <input
          type="text" value={text} onChange={handleTyping}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) handleSend(e); }}
          placeholder="Type a message"
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
  );
};

export default MessageInput;