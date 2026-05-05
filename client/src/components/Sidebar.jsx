import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore.js";
import { useAuthStore } from "../store/useAuthStore.js";
import { getSocket } from "../lib/socket.js";

const COLORS = ["#00a884","#7f77dd","#d85a30","#ba7517","#993556","#0f6e56","#185fa5"];

export const Avatar = ({ user, size = 40, showOnline = false, onlineUsers = [] }) => {
  const isOnline = onlineUsers.includes(user._id);
  const color = COLORS[user.username.charCodeAt(0) % COLORS.length];
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%", background: color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: "600", fontSize: size * 0.38, color: "#fff", overflow: "hidden",
      }}>
        {user.profilePic
          ? <img src={user.profilePic} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : user.username[0].toUpperCase()
        }
      </div>
      {showOnline && isOnline && (
        <div style={{
          position: "absolute", bottom: 1, right: 1,
          width: 11, height: 11, background: "#00a884",
          borderRadius: "50%", border: "2px solid var(--wa-bg-primary)",
        }} />
      )}
    </div>
  );
};

const Sidebar = () => {
  const {
    users, getUsers, selectedUser, setSelectedUser,
    isUsersLoading, onlineUsers, setOnlineUsers,
  } = useChatStore();
  const { authUser, logout } = useAuthStore();
  const [search, setSearch] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getUsers();
    const socket = getSocket();
    if (socket) socket.on("getOnlineUsers", setOnlineUsers);
    return () => { getSocket()?.off("getOnlineUsers"); };
  }, [getUsers, setOnlineUsers]);

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const menuItems = [
    { label: "👤 Profile", action: () => { navigate("/profile"); setShowMenu(false); } },
    { label: "🚪 Log out", action: () => { logout(); setShowMenu(false); } },
  ];

  return (
    <div style={{
      width: "360px", flexShrink: 0,
      background: "var(--wa-bg-primary)",
      borderRight: "0.5px solid var(--wa-border)",
      display: "flex", flexDirection: "column", height: "100vh",
    }}>
      {/* Header */}
      <div style={{
        padding: "10px 16px", background: "var(--wa-bg-secondary)",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", height: "60px", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {authUser && <Avatar user={authUser} size={40} showOnline onlineUsers={[authUser._id]} />}
          <span style={{ fontSize: "18px", fontWeight: "600", color: "var(--wa-text-primary)" }}>
            Chatify
          </span>
        </div>
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "none", border: "none", cursor: "pointer",
              color: "var(--wa-icon)", fontSize: "20px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >⋮</button>
          {showMenu && (
            <div style={{
              position: "absolute", top: "40px", right: 0,
              background: "var(--wa-bg-secondary)",
              border: "0.5px solid var(--wa-border)",
              borderRadius: "8px", minWidth: "160px",
              zIndex: 100, overflow: "hidden",
            }}>
              {menuItems.map((item) => (
                <button
                  key={item.label} onClick={item.action}
                  style={{
                    width: "100%", padding: "12px 16px",
                    background: "none", border: "none",
                    color: "var(--wa-text-primary)", fontSize: "14px",
                    textAlign: "left", cursor: "pointer", display: "block",
                  }}
                  onMouseEnter={(e) => e.target.style.background = "var(--wa-bg-tertiary)"}
                  onMouseLeave={(e) => e.target.style.background = "none"}
                >{item.label}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: "8px 12px", background: "var(--wa-bg-primary)", flexShrink: 0 }}>
        <div style={{ position: "relative" }}>
          <span style={{
            position: "absolute", left: "12px", top: "50%",
            transform: "translateY(-50%)", fontSize: "14px", color: "var(--wa-text-muted)",
          }}>🔍</span>
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search or start new chat"
            style={{
              width: "100%", background: "var(--wa-bg-secondary)",
              border: "none", borderRadius: "8px",
              padding: "8px 12px 8px 36px",
              color: "var(--wa-text-primary)", fontSize: "13px", outline: "none",
            }}
          />
        </div>
      </div>

      {/* Online count */}
      <div style={{
        padding: "6px 16px", flexShrink: 0,
        display: "flex", alignItems: "center", gap: "6px",
      }}>
        <div style={{ width: 8, height: 8, background: "#00a884", borderRadius: "50%" }} />
        <span style={{ fontSize: "11px", color: "var(--wa-text-muted)" }}>
          {onlineUsers.length} online
        </span>
      </div>

      {/* User list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {isUsersLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "12px 16px", borderBottom: "0.5px solid var(--wa-border)",
            }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--wa-bg-tertiary)", animation: "pulse 1.5s ease-in-out infinite" }} />
              <div style={{ flex: 1 }}>
                <div style={{ width: "60%", height: 14, background: "var(--wa-bg-tertiary)", borderRadius: 4, marginBottom: 8, animation: "pulse 1.5s ease-in-out infinite" }} />
                <div style={{ width: "40%", height: 12, background: "var(--wa-bg-tertiary)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--wa-text-muted)", fontSize: "13px" }}>
            No users found
          </div>
        ) : (
          filtered.map((user) => {
            const isOnline = onlineUsers.includes(user._id);
            const isSelected = selectedUser?._id === user._id;
            return (
              <div
                key={user._id}
                onClick={() => setSelectedUser(user)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "10px 16px", cursor: "pointer",
                  background: isSelected ? "var(--wa-bg-tertiary)" : "transparent",
                  borderBottom: "0.5px solid var(--wa-border)",
                  transition: "background .1s",
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "var(--wa-bg-secondary)"; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
              >
                <Avatar user={user} size={48} showOnline onlineUsers={onlineUsers} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", marginBottom: "3px",
                  }}>
                    <span style={{
                      fontSize: "15px", fontWeight: "500",
                      color: "var(--wa-text-primary)",
                      whiteSpace: "nowrap", overflow: "hidden",
                      textOverflow: "ellipsis", flex: 1,
                    }}>
                      {user.username}
                    </span>
                    {user.unreadCount > 0 && (
                      <span style={{
                        background: "#00a884", color: "#111b21",
                        fontSize: "11px", fontWeight: "700",
                        borderRadius: "50%", minWidth: "18px", height: "18px",
                        display: "flex", alignItems: "center",
                        justifyContent: "center", padding: "0 4px",
                        marginLeft: "8px", flexShrink: 0,
                      }}>
                        {user.unreadCount > 99 ? "99+" : user.unreadCount}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: "13px", color: isOnline ? "#00a884" : "var(--wa-text-muted)" }}>
                    {isOnline ? "online" : "offline"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;