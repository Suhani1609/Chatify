import { useState } from "react";
import { useGroupStore } from "../store/useGroupStore.js";
import { useChatStore } from "../store/useChatStore.js";

const CreateGroupModal = ({ onClose }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  const { createGroup, setSelectedGroup } = useGroupStore();
  const { users } = useChatStore();

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) { alert("Group name is required"); return; }
    if (selectedMembers.length === 0) { alert("Add at least one member"); return; }
    setIsCreating(true);
    const group = await createGroup(name.trim(), description.trim(), selectedMembers);
    setIsCreating(false);
    if (group) {
      setSelectedGroup(group);
      onClose();
    }
  };

  const COLORS = ["#00a884","#7f77dd","#d85a30","#ba7517","#993556","#0f6e56","#185fa5"];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--wa-bg-secondary)",
          border: "0.5px solid var(--wa-border)",
          borderRadius: "16px", width: "100%", maxWidth: "420px",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          background: "var(--wa-accent)", padding: "16px 20px",
          display: "flex", alignItems: "center", gap: "12px",
        }}>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none",
              cursor: "pointer", color: "#fff", fontSize: "18px",
            }}
          >←</button>
          <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#fff", margin: 0 }}>
            New group
          </h2>
        </div>

        <div style={{ padding: "20px" }}>
          {/* Group name */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "12px", color: "var(--wa-accent)", marginBottom: "6px", fontWeight: "500" }}>
              Group name
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              maxLength={50}
              style={{
                width: "100%", background: "var(--wa-bg-tertiary)",
                border: "none", borderBottom: "2px solid var(--wa-accent)",
                borderRadius: "8px 8px 0 0", padding: "10px 12px",
                color: "var(--wa-text-primary)", fontSize: "14px", outline: "none",
              }}
            />
            <div style={{ fontSize: "11px", color: "var(--wa-text-muted)", textAlign: "right", marginTop: "3px" }}>
              {name.length}/50
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "12px", color: "var(--wa-accent)", marginBottom: "6px", fontWeight: "500" }}>
              Description (optional)
            </div>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this group about?"
              maxLength={200}
              style={{
                width: "100%", background: "var(--wa-bg-tertiary)",
                border: "none", borderBottom: "2px solid var(--wa-border)",
                borderRadius: "8px 8px 0 0", padding: "10px 12px",
                color: "var(--wa-text-primary)", fontSize: "14px", outline: "none",
              }}
            />
          </div>

          {/* Member selector */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "12px", color: "var(--wa-accent)", marginBottom: "8px", fontWeight: "500" }}>
              Add members ({selectedMembers.length} selected)
            </div>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {users.map((user) => {
                const isSelected = selectedMembers.includes(user._id);
                const color = COLORS[user.username.charCodeAt(0) % COLORS.length];
                return (
                  <div
                    key={user._id}
                    onClick={() => toggleMember(user._id)}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "8px", borderRadius: "8px", cursor: "pointer",
                      background: isSelected ? "rgba(0,168,132,0.1)" : "transparent",
                      transition: "background .1s",
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "var(--wa-bg-tertiary)"; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{
                      width: 38, height: 38, borderRadius: "50%",
                      background: color, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: "600", fontSize: 15, color: "#fff", overflow: "hidden",
                    }}>
                      {user.profilePic
                        ? <img src={user.profilePic} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : user.username[0].toUpperCase()
                      }
                    </div>
                    <span style={{ flex: 1, fontSize: "14px", color: "var(--wa-text-primary)" }}>
                      {user.username}
                    </span>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%",
                      border: `2px solid ${isSelected ? "#00a884" : "var(--wa-text-muted)"}`,
                      background: isSelected ? "#00a884" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "all .15s",
                    }}>
                      {isSelected && <span style={{ color: "#fff", fontSize: "12px" }}>✓</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Create button */}
          <button
            onClick={handleCreate}
            disabled={isCreating || !name.trim() || selectedMembers.length === 0}
            style={{
              width: "100%",
              background: (!name.trim() || selectedMembers.length === 0 || isCreating)
                ? "var(--wa-bg-tertiary)" : "var(--wa-accent)",
              color: (!name.trim() || selectedMembers.length === 0 || isCreating)
                ? "var(--wa-text-muted)" : "#fff",
              border: "none", borderRadius: "24px", padding: "13px",
              fontSize: "15px", fontWeight: "600",
              cursor: (!name.trim() || selectedMembers.length === 0) ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}
          >
            {isCreating ? (
              <div style={{
                width: 16, height: 16,
                border: "2px solid var(--wa-text-muted)",
                borderTop: "2px solid var(--wa-text-primary)",
                borderRadius: "50%", animation: "spin 0.8s linear infinite",
              }} />
            ) : `Create group${selectedMembers.length > 0 ? ` (${selectedMembers.length + 1})` : ""}`}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default CreateGroupModal;