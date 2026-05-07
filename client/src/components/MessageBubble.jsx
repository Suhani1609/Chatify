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
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const groupedReactions = message.reactions?.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

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

      {/* Outer row */}
      <div style={{
        display: "flex",
        justifyContent: isMine ? "flex-end" : "flex-start",
        alignItems: "flex-end",
        gap: "4px",
        marginBottom: "3px",
        position: "relative",
      }}>

        {/* ── Action buttons (shown on hover, OUTSIDE the bubble) ── */}
        {showActions && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "4px",
              alignItems: "center",
              order: isMine ? 0 : 1,
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              title="React"
              style={{
                width: 26, height: 26, borderRadius: "50%",
                background: "var(--wa-bg-tertiary)",
                border: "0.5px solid var(--wa-border)",
                cursor: "pointer", fontSize: "13px",
                display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0,
              }}
            >😊</button>

            <button
              onClick={() => setReplyingTo({
                ...message,
                senderUsername: isMine ? authUser.username : "them",
              })}
              title="Reply"
              style={{
                width: 26, height: 26, borderRadius: "50%",
                background: "var(--wa-bg-tertiary)",
                border: "0.5px solid var(--wa-border)",
                cursor: "pointer",
                color: "var(--wa-text-secondary)",
                fontSize: "13px",
                display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0,
              }}
            >↩</button>

            {isMine && (
              <button
                onClick={() => deleteMessage(message._id)}
                title="Delete"
                style={{
                  width: 26, height: 26, borderRadius: "50%",
                  background: "var(--wa-bg-tertiary)",
                  border: "0.5px solid var(--wa-border)",
                  cursor: "pointer", color: "#e24b4a",
                  fontSize: "12px",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0,
                }}
              >✕</button>
            )}
          </div>
        )}

        {/* ── Bubble wrapper — handles hover WITHOUT blur ── */}
        <div
          style={{ order: isMine ? 1 : 0, position: "relative" }}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => {
            setShowActions(false);
            setShowReactionPicker(false);
          }}
        >
          <div style={{
            display: "inline-block",        /* shrink to content width */
            maxWidth: "min(320px, 60vw)",   /* never wider than 320px */
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

            {/* Text line — uses flex so time sits inline at the end */}
            {message.text && (
              <span style={{
                fontSize: "14px",
                color: "var(--wa-text-primary)",
                lineHeight: "1.45",
                whiteSpace: "pre-wrap",   /* respect newlines, wrap normally */
                wordBreak: "break-word",
                overflowWrap: "anywhere",
              }}>
                {message.text}
                {/* Invisible spacer so the time never overlaps the last word */}
                <span style={{
                  display: "inline-block",
                  width: isMine ? "72px" : "44px", /* space for time + ticks */
                  height: "1px",
                }} />
              </span>
            )}

            {/* Time + ticks — float bottom-right inside bubble */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "3px",
              marginTop: "-14px",   /* pull up next to last text line */
              marginBottom: "1px",
              paddingLeft: "8px",
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

            {/* Time below image (image-only messages) */}
            {!message.text && message.image && (
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "flex-end", gap: "3px",
                marginTop: "-14px",
              }}>
                <span style={{ fontSize: "11px", color: "var(--wa-text-muted)" }}>
                  {formatTime(message.createdAt)}
                </span>
                {isMine && (
                  <span style={{
                    fontSize: "13px",
                    color: message.seen ? "#53bdeb" : "var(--wa-text-muted)",
                  }}>
                    {message.seen ? "✓✓" : "✓"}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Reaction picker popup */}
          {showReactionPicker && (
            <div style={{
              position: "absolute",
              bottom: "calc(100% + 6px)",
              ...(isMine ? { right: 0 } : { left: 0 }),
              background: "var(--wa-bg-secondary)",
              border: "0.5px solid var(--wa-border)",
              borderRadius: "24px", padding: "6px 10px",
              display: "flex", gap: "6px", zIndex: 200,
              boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
            }}>
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    reactToMessage(message._id, emoji);
                    setShowReactionPicker(false);
                  }}
                  style={{
                    background: "none", border: "none",
                    cursor: "pointer", fontSize: "20px",
                    borderRadius: "50%", padding: "2px",
                    transition: "transform .1s",
                    lineHeight: 1,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.3)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reactions row */}
      {groupedReactions && Object.keys(groupedReactions).length > 0 && (
        <div style={{
          display: "flex",
          justifyContent: isMine ? "flex-end" : "flex-start",
          flexWrap: "wrap", gap: "4px",
          marginBottom: "4px",
          paddingRight: isMine ? "8px" : "0",
          paddingLeft: isMine ? "0" : "8px",
        }}>
          {Object.entries(groupedReactions).map(([emoji, count]) => (
            <button
              key={emoji}
              onClick={() => reactToMessage(message._id, emoji)}
              style={{
                background: "var(--wa-bg-secondary)",
                border: "0.5px solid var(--wa-border)",
                borderRadius: "12px", padding: "2px 7px",
                cursor: "pointer", fontSize: "13px",
                display: "flex", alignItems: "center", gap: "3px",
                color: "var(--wa-text-primary)",
              }}
            >
              <span>{emoji}</span>
              {count > 1 && (
                <span style={{ fontSize: "11px" }}>{count}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          onClose={() => setLightboxSrc(null)}
        />
      )}
    </>
  );
};

export default MessageBubble;