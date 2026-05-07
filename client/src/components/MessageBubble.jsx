import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { useChatStore } from "../store/useChatStore.js";
import ImageLightbox from "./ImageLightbox.jsx";

const MessageBubble = ({ message, showDate, dateLabel }) => {
  const { authUser } = useAuthStore();
  const { deleteMessage, setReplyingTo } = useChatStore();
  const [hovered, setHovered] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const isMine = message.senderId === authUser._id;

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <>
      {/* Date divider */}
      {showDate && (
        <div style={{
          display: "flex", justifyContent: "center", margin: "12px 0",
        }}>
          <span style={{
            background: "var(--wa-bg-secondary)",
            color: "var(--wa-text-secondary)",
            fontSize: "11px", padding: "4px 12px", borderRadius: "8px",
          }}>
            {dateLabel}
          </span>
        </div>
      )}

      {/* ── Single hover zone wrapping bubble + buttons together ── */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          justifyContent: isMine ? "flex-end" : "flex-start",
          alignItems: "center",
          gap: "6px",
          marginBottom: "3px",
          paddingLeft: "4px",
          paddingRight: "4px",
        }}
      >
        {/* Action buttons LEFT side (received messages) */}
        {!isMine && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            opacity: hovered ? 1 : 0,
            pointerEvents: hovered ? "auto" : "none",
            transition: "opacity 0.15s",
            flexShrink: 0,
          }}>
            <button
              onClick={() => {
                setReplyingTo({
                  ...message,
                  senderUsername: "them",
                });
                setHovered(false);
              }}
              title="Reply"
              style={btnStyle}
            >↩</button>
          </div>
        )}

        {/* ── Bubble ── */}
        <div style={{
          position: "relative",
          maxWidth: "min(320px, 58vw)",
          flexShrink: 0,
        }}>
          <div style={{
            background: isMine ? "var(--wa-bubble-out)" : "var(--wa-bubble-in)",
            borderRadius: isMine ? "8px 0 8px 8px" : "0 8px 8px 8px",
            padding: "6px 10px 5px",
            position: "relative",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
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
                background: "rgba(0,0,0,0.18)",
                borderLeft: "3px solid #00a884",
                borderRadius: "4px",
                padding: "5px 8px", marginBottom: "5px",
              }}>
                <div style={{
                  fontSize: "11px", color: "#00a884",
                  fontWeight: "600", marginBottom: "2px",
                }}>
                  {message.replyTo.senderUsername}
                </div>
                <div style={{
                  fontSize: "12px", color: "var(--wa-text-secondary)",
                  whiteSpace: "nowrap", overflow: "hidden",
                  textOverflow: "ellipsis", maxWidth: "220px",
                }}>
                  {message.replyTo.text}
                </div>
              </div>
            )}

            {/* Image */}
            {message.image && (
              <img
                src={message.image}
                alt="attachment"
                onClick={() => setLightboxSrc(message.image)}
                style={{
                  display: "block",
                  maxWidth: "260px", width: "100%",
                  maxHeight: "240px", objectFit: "cover",
                  borderRadius: "6px",
                  marginBottom: message.text ? "5px" : "3px",
                  cursor: "pointer",
                }}
              />
            )}

            {/* Text */}
            {message.text && (
              <span style={{
                fontSize: "14px",
                color: "var(--wa-text-primary)",
                lineHeight: "1.45",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                overflowWrap: "anywhere",
                display: "block",
              }}>
                {message.text}
                <span style={{
                  display: "inline-block",
                  width: isMine ? "76px" : "46px",
                  height: "1px",
                }} />
              </span>
            )}

            {/* Time + ticks */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "3px",
              marginTop: message.text ? "-14px" : "3px",
              marginBottom: "1px",
            }}>
              <span style={{
                fontSize: "11px",
                color: "var(--wa-text-muted)",
                whiteSpace: "nowrap",
              }}>
                {formatTime(message.createdAt)}
              </span>
              {isMine && (
                <span style={{
                  fontSize: "13px",
                  color: message.seen ? "#53bdeb" : "var(--wa-text-muted)",
                  lineHeight: 1,
                }}>
                  {message.seen ? "✓✓" : "✓"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons RIGHT side (my messages) */}
        {isMine && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            opacity: hovered ? 1 : 0,
            pointerEvents: hovered ? "auto" : "none",
            transition: "opacity 0.15s",
            flexShrink: 0,
          }}>
            {/* Reply */}
            <button
              onClick={() => {
                setReplyingTo({
                  ...message,
                  senderUsername: authUser.username,
                });
                setHovered(false);
              }}
              title="Reply"
              style={btnStyle}
            >↩</button>

            {/* Delete */}
            <button
              onClick={() => {
                deleteMessage(message._id);
                setHovered(false);
              }}
              title="Delete"
              style={{ ...btnStyle, color: "#e24b4a" }}
            >✕</button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          onClose={() => setLightboxSrc(null)}
        />
      )}
    </>
  );
};

const btnStyle = {
  width: "30px",
  height: "30px",
  borderRadius: "50%",
  background: "#202c33",
  border: "0.5px solid #3d4e58",
  cursor: "pointer",
  fontSize: "15px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#aebac1",
  flexShrink: 0,
  boxShadow: "0 1px 6px rgba(0,0,0,0.35)",
};

export default MessageBubble;