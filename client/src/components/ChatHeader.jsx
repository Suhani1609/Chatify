import { useChatStore } from "../store/useChatStore.js";

const COLORS = ["#00a884","#7f77dd","#d85a30","#ba7517","#993556","#0f6e56","#185fa5"];

const getLastSeen = (lastSeen) => {
  if (!lastSeen) return "last seen recently";
  const diff = Date.now() - new Date(lastSeen).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "last seen just now";
  if (mins < 60) return `last seen ${mins} min ago`;
  if (hours < 24) return `last seen ${hours}h ago`;
  if (days === 1) return "last seen yesterday";
  return `last seen ${new Date(lastSeen).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
};

const ChatHeader = () => {
  const { selectedUser, onlineUsers, isTyping, setSelectedUser } = useChatStore();
  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(selectedUser._id);
  const color = COLORS[selectedUser.username.charCodeAt(0) % COLORS.length];

  return (
    <div style={{
      padding: "10px 16px", background: "var(--wa-bg-secondary)",
      display: "flex", alignItems: "center",
      gap: "12px", height: "60px",
      borderBottom: "0.5px solid var(--wa-border)", flexShrink: 0,
    }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%", background: color,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: "600", fontSize: 16, color: "#fff", overflow: "hidden",
        }}>
          {selectedUser.profilePic
            ? <img src={selectedUser.profilePic} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : selectedUser.username[0].toUpperCase()
          }
        </div>
        {isOnline && (
          <div style={{
            position: "absolute", bottom: 1, right: 1,
            width: 10, height: 10, background: "#00a884",
            borderRadius: "50%", border: "2px solid var(--wa-bg-secondary)",
          }} />
        )}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "15px", fontWeight: "500", color: "var(--wa-text-primary)" }}>
          {selectedUser.username}
        </div>
        {isTyping ? (
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "12px", color: "#00a884" }}>typing</span>
            <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: 4, height: 4, background: "#00a884", borderRadius: "50%",
                  animation: `bounce 1.2s infinite ${i * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: "12px", color: isOnline ? "#00a884" : "var(--wa-text-muted)" }}>
            {isOnline ? "online" : getLastSeen(selectedUser.lastSeen)}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "4px" }}>
        <button
          onClick={() => setSelectedUser(null)}
          style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "none", border: "none", cursor: "pointer",
            color: "var(--wa-icon)", fontSize: "18px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >✕</button>
      </div>
    </div>
  );
};

export default ChatHeader;