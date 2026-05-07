import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore.js";
import { useAuthStore } from "../store/useAuthStore.js";
import { useGroupStore } from "../store/useGroupStore.js";
import { getSocket } from "../lib/socket.js";
import CreateGroupModal from "./CreateGroupModal.jsx";

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
  const {
    groups, getGroups, selectedGroup, setSelectedGroup,
    subscribeToGroupMessages, unsubscribeFromGroupMessages,
  } = useGroupStore();

  const [search, setSearch] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [activeTab, setActiveTab] = useState("chats"); // "chats" | "groups"
  const navigate = useNavigate();

  useEffect(() => {
    getUsers();
    getGroups();
    subscribeToGroupMessages();
    const socket = getSocket();
    if (socket) socket.on("getOnlineUsers", setOnlineUsers);
    return () => {
      getSocket()?.off("getOnlineUsers");
      unsubscribeFromGroupMessages();
    };
  }, [getUsers, getGroups, setOnlineUsers, subscribeToGroupMessages, unsubscribeFromGroupMessages]);

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  const tabStyle = (tab) => ({
    flex: 1, padding: "10px 0",
    background: "none", border: "none",
    borderBottom: activeTab === tab
      ? "2px solid #00a884"
      : "2px solid transparent",
    color: activeTab === tab ? "#00a884" : "var(--wa-text-muted)",
    fontSize: "13px", fontWeight: "500",
    cursor: "pointer", transition: "all .15s",
  });

  return (
    <>
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
          <div style={{ display: "flex", gap: "4px", position: "relative" }}>
            {/* New group button */}
            <button
              onClick={() => setShowCreateGroup(true)}
              title="New group"
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "none", border: "none", cursor: "pointer",
                color: "var(--wa-icon)", fontSize: "18px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >👥</button>

            {/* Menu */}
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
                {[
                  { label: "👤 Profile", action: () => { navigate("/profile"); setShowMenu(false); } },
                  { label: "👥 New group", action: () => { setShowCreateGroup(true); setShowMenu(false); } },
                  { label: "🚪 Log out", action: () => { logout(); setShowMenu(false); } },
                ].map((item) => (
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

        {/* Tabs */}
        <div style={{
          display: "flex", background: "var(--wa-bg-secondary)",
          borderBottom: "0.5px solid var(--wa-border)", flexShrink: 0,
        }}>
          <button style={tabStyle("chats")} onClick={() => setActiveTab("chats")}>
            Chats {onlineUsers.length > 0 && (
              <span style={{
                background: "#00a884", color: "#111b21",
                fontSize: "10px", fontWeight: "700",
                borderRadius: "10px", padding: "1px 5px", marginLeft: "4px",
              }}>{onlineUsers.length}</span>
            )}
          </button>
          <button style={tabStyle("groups")} onClick={() => setActiveTab("groups")}>
            Groups {groups.length > 0 && (
              <span style={{
                background: "var(--wa-bg-tertiary)", color: "var(--wa-text-secondary)",
                fontSize: "10px", fontWeight: "700",
                borderRadius: "10px", padding: "1px 5px", marginLeft: "4px",
              }}>{groups.length}</span>
            )}
          </button>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {activeTab === "chats" ? (
            isUsersLoading ? (
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
            ) : filteredUsers.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--wa-text-muted)", fontSize: "13px" }}>
                No users found
              </div>
            ) : (
              filteredUsers.map((user) => {
                const isOnline = onlineUsers.includes(user._id);
                const isSelected = selectedUser?._id === user._id;
                return (
                  <div
                    key={user._id}
                    onClick={() => { setSelectedUser(user); setSelectedGroup(null); }}
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
            )
          ) : (
            // Groups tab
            filteredGroups.length === 0 ? (
              <div style={{
                padding: "40px 20px", textAlign: "center",
                color: "var(--wa-text-muted)", fontSize: "13px",
              }}>
                <div style={{ fontSize: "48px", marginBottom: "12px", opacity: 0.5 }}>👥</div>
                <p style={{ marginBottom: "4px", color: "var(--wa-text-secondary)", fontWeight: "500" }}>
                  No groups yet
                </p>
                <p style={{ fontSize: "12px", marginBottom: "16px" }}>
                  Create a group to chat with multiple people at once
                </p>
                <button
                  onClick={() => setShowCreateGroup(true)}
                  style={{
                    background: "none",
                    border: "1.5px solid #00a884",
                    borderRadius: "20px", padding: "8px 20px",
                    color: "#00a884", fontSize: "13px",
                    fontWeight: "500", cursor: "pointer",
                  }}
                >
                  + Create group
                </button>
              </div>
            ) : (
              filteredGroups.map((group) => {
                const isSelected = selectedGroup?._id === group._id;
                const color = COLORS[group.name.charCodeAt(0) % COLORS.length];
                const memberNames = group.members
                  .slice(0, 3)
                  .map((m) => m.username || "")
                  .join(", ");

                return (
                  <div
                    key={group._id}
                    onClick={() => { setSelectedGroup(group); setSelectedUser(null); }}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "10px 16px", cursor: "pointer",
                      background: isSelected ? "var(--wa-bg-tertiary)" : "transparent",
                      borderBottom: "0.5px solid var(--wa-border)",
                      transition: "background .1s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "var(--wa-bg-secondary)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {/* Group avatar — stacked initials style */}
                    <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: "50%",
                        background: color,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: "700", fontSize: 20, color: "#fff", overflow: "hidden",
                      }}>
                        {group.avatar
                          ? <img src={group.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : group.name[0].toUpperCase()
                        }
                      </div>
                      {/* Admin crown badge */}
                      <div style={{
                        position: "absolute", bottom: -1, right: -1,
                        background: "var(--wa-bg-primary)", borderRadius: "50%",
                        width: 16, height: 16,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "9px",
                      }}>
                        👥
                      </div>
                    </div>

                    {/* Info */}
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
                          {group.name}
                        </span>
                        <span style={{
                          fontSize: "11px", color: "var(--wa-text-muted)",
                          flexShrink: 0, marginLeft: "6px",
                        }}>
                          {group.members.length} 👤
                        </span>
                      </div>
                      <span style={{
                        fontSize: "12px", color: "var(--wa-text-muted)",
                        whiteSpace: "nowrap", overflow: "hidden",
                        textOverflow: "ellipsis", display: "block",
                      }}>
                        {group.description || memberNames}
                      </span>
                    </div>
                  </div>
                );
              })
            )
          )}
        </div>
      </div>

      {showCreateGroup && <CreateGroupModal onClose={() => setShowCreateGroup(false)} />}
    </>
  );
};

export default Sidebar;