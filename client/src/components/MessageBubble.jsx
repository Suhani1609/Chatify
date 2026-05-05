import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { useChatStore } from "../store/useChatStore.js";
import ImageLightbox from "./ImageLightbox.jsx";

const QUICK_REACTIONS = ["❤️", "😂", "😮", "😢", "👍", "🙏"];

const MessageBubble = ({ message, showDate, dateLabel }) => {
  const { authUser } = useAuthStore();
  const { deleteMessage, setReplyingTo, reactToMessage } = useChatStore();
  const [showActions, setShowActions] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const isMine = message.senderId === authUser._id;

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const groupedReactions = message.reactions?.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      {showDate && (
        <div style={{ display: "flex", justifyContent: "center", margin: "12px 0" }}>
          <span style={{
            background: "var(--wa-bg-secondary)", color: "var(--wa-text-secondary)",
            fontSize: "11px", padding: "4px 12px", borderRadius: "8px",
          }}>{dateLabel}</span>
        </div>
      )}

      <div
        style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start", marginBottom: "2px" }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => { setShowActions(false); setShowReactionPicker(false); }}
      >
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "4px" }}>
          {/* Action buttons */}
          {showActions && (
            <div style={{
              display: "flex", gap: "4px",
              order: isMine ? 0 : 1,
            }}>
              <button
                onClick={() => setShowReactionPicker(!showReactionPicker)}
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "var(--wa-bg-secondary)",
                  border: "0.5px solid var(--wa-border)",
                  cursor: "pointer", fontSize: "13px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >😊</button>
              <button
                onClick={() => setReplyingTo({
                  ...message,
                  senderUsername: isMine ? authUser.username : "them",
                })}
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "var(--wa-bg-secondary)",
                  border: "0.5px solid var(--wa-border)",
                  cursor: "pointer", color: "var(--wa-text-secondary)", fontSize: "13px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >↩</button>
              {isMine && (
                <button
                  onClick={() => deleteMessage(message._id)}
                  style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: "var(--wa-bg-secondary)",
                    border: "0.5px solid var(--wa-border)",
                    cursor: "pointer", color: "#e24b4a", fontSize: "12px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >✕</button>
              )}
            </div>
          )}

          {/* Bubble */}
          <div style={{
            maxWidth: "65%", order: isMine ? 1 : 0,
            background: isMine ? "var(--wa-bubble-out)" : "var(--wa-bubble-in)",
            borderRadius: isMine ? "8px 0 8px 8px" : "0 8px 8px 8px",
            padding: "6px 10px 4px", position: "relative",
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

            {/* Reply preview */}
            {message.replyTo?.messageId && (
              <div style={{
                background: "rgba(0,0,0,0.2)", borderLeft: "3px solid #00a884",
                borderRadius: "4px", padding: "6px 8px", marginBottom: "6px",
              }}>
                <div style={{ fontSize: "11px", color: "#00a884", fontWeight: "600", marginBottom: "2px" }}>
                  {message.replyTo.senderUsername}
                </div>
                <div style={{
                  fontSize: "12px", color: "var(--wa-text-secondary)",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px",
                }}>
                  {message.replyTo.text}
                </div>
              </div>
            )}

            {/* Image */}
            {message.image && (
              <img
                src={message.image} alt="attachment"
                onClick={() => setLightboxSrc(message.image)}
                style={{
                  maxWidth: "100%", borderRadius: "6px", display: "block",
                  marginBottom: message.text ? "6px" : "2px",
                  cursor: "pointer", maxHeight: "260px", objectFit: "cover",
                }}
              />
            )}

            {/* Text */}
            {message.text && (
              <span style={{
                fontSize: "14px", color: "var(--wa-text-primary)",
                lineHeight: "1.4", wordBreak: "break-word",
              }}>
                {message.text}
              </span>
            )}

            {/* Meta */}
            <div style={{
              display: "flex", alignItems: "center", gap: "3px",
              justifyContent: "flex-end", marginTop: "2px",
            }}>
              <span style={{ fontSize: "11px", color: "var(--wa-text-muted)" }}>
                {formatTime(message.createdAt)}
              </span>
              {isMine && (
                <span style={{ fontSize: "12px", color: message.seen ? "#53bdeb" : "var(--wa-text-muted)" }}>
                  {message.seen ? "✓✓" : "✓"}
                </span>
              )}
            </div>
          </div>

          {/* Reaction picker */}
          {showReactionPicker && (
            <div style={{
              position: "absolute", bottom: "calc(100% + 4px)",
              ...(isMine ? { right: 0 } : { left: 0 }),
              background: "var(--wa-bg-secondary)",
              border: "0.5px solid var(--wa-border)",
              borderRadius: "24px", padding: "6px 10px",
              display: "flex", gap: "6px", zIndex: 100,
            }}>
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => { reactToMessage(message._id, emoji); setShowReactionPicker(false); }}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: "20px", borderRadius: "50%", padding: "2px",
                    transition: "transform .1s",
                  }}
                  onMouseEnter={(e) => e.target.style.transform = "scale(1.3)"}
                  onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                >{emoji}</button>
              ))}
            </div>
          )}
        </div>

        {/* Reactions display */}
        {groupedReactions && Object.keys(groupedReactions).length > 0 && (
          <div style={{
            display: "flex", flexWrap: "wrap", gap: "4px",
            marginTop: "3px",
          }}>
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => reactToMessage(message._id, emoji)}
                style={{
                  background: "var(--wa-bg-secondary)",
                  border: "0.5px solid var(--wa-border)",
                  borderRadius: "12px", padding: "2px 6px",
                  cursor: "pointer", fontSize: "12px",
                  display: "flex", alignItems: "center", gap: "3px",
                  color: "var(--wa-text-primary)",
                }}
              >
                <span>{emoji}</span>
                {count > 1 && <span style={{ fontSize: "11px" }}>{count}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
    </>
  );
};

export default MessageBubble;