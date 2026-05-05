import { useState, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { useNavigate } from "react-router-dom";

const COLORS = ["#00a884","#7f77dd","#d85a30","#ba7517","#993556","#0f6e56","#185fa5"];

const ProfilePage = () => {
  const { authUser, updateProfile } = useAuthStore();
  const navigate = useNavigate();
  const [username, setUsername] = useState(authUser?.username || "");
  const [preview, setPreview] = useState(authUser?.profilePic || "");
  const [imageData, setImageData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileRef = useRef(null);

  const color = COLORS[(authUser?.username || "").charCodeAt(0) % COLORS.length];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Image must be under 5MB"); return; }
    const reader = new FileReader();
    reader.onload = () => { setPreview(reader.result); setImageData(reader.result); };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        username: username !== authUser.username ? username : undefined,
        profilePic: imageData || undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--wa-bg-primary)", display: "flex", flexDirection: "column" }}>
      <div style={{
        background: "var(--wa-accent)", padding: "16px 20px",
        display: "flex", alignItems: "center", gap: "16px",
      }}>
        <button
          onClick={() => navigate("/")}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", fontSize: "20px" }}
        >←</button>
        <h1 style={{ fontSize: "18px", fontWeight: "600", color: "#fff", margin: 0 }}>Profile</h1>
      </div>

      <div style={{ flex: 1, padding: "32px 20px", maxWidth: "500px", margin: "0 auto", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
          <div style={{ position: "relative" }}>
            <div style={{
              width: 120, height: 120, borderRadius: "50%",
              background: color, overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 48, fontWeight: "700", color: "#fff",
              border: "3px solid var(--wa-accent)",
            }}>
              {preview
                ? <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : authUser?.username[0].toUpperCase()
              }
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                position: "absolute", bottom: 4, right: 4,
                width: 36, height: 36, borderRadius: "50%",
                background: "var(--wa-accent)", border: "2px solid var(--wa-bg-primary)",
                cursor: "pointer", color: "#fff", fontSize: "16px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >📷</button>
            <input type="file" ref={fileRef} accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
          </div>
        </div>

        <div style={{
          background: "var(--wa-bg-secondary)", borderRadius: "12px",
          overflow: "hidden", border: "0.5px solid var(--wa-border)", marginBottom: "16px",
        }}>
          <div style={{ padding: "12px 16px", borderBottom: "0.5px solid var(--wa-border)" }}>
            <div style={{ fontSize: "12px", color: "var(--wa-accent)", marginBottom: "4px" }}>Your name</div>
            <input
              type="text" value={username} minLength={3} maxLength={20}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: "100%", background: "transparent", border: "none",
                color: "var(--wa-text-primary)", fontSize: "15px", outline: "none", padding: "4px 0",
              }}
            />
          </div>
          <div style={{ padding: "12px 16px" }}>
            <div style={{ fontSize: "12px", color: "var(--wa-accent)", marginBottom: "4px" }}>Email</div>
            <div style={{ fontSize: "15px", color: "var(--wa-text-secondary)" }}>{authUser?.email}</div>
          </div>
        </div>

        <div style={{
          background: "var(--wa-bg-secondary)", borderRadius: "12px",
          padding: "16px", border: "0.5px solid var(--wa-border)",
          marginBottom: "24px", display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: "16px", textAlign: "center",
        }}>
          <div>
            <div style={{ fontSize: "18px", fontWeight: "600", color: "var(--wa-accent)" }}>
              {new Date(authUser?.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
            </div>
            <div style={{ fontSize: "11px", color: "var(--wa-text-muted)", marginTop: "2px" }}>Member since</div>
          </div>
          <div>
            <div style={{ fontSize: "18px", fontWeight: "600", color: authUser?.isOnline ? "#00a884" : "var(--wa-text-muted)" }}>
              {authUser?.isOnline ? "🟢 Online" : "⚫ Offline"}
            </div>
            <div style={{ fontSize: "11px", color: "var(--wa-text-muted)", marginTop: "2px" }}>Current status</div>
          </div>
        </div>

        <button
          onClick={handleSave} disabled={isLoading}
          style={{
            width: "100%",
            background: isLoading ? "var(--wa-bg-tertiary)" : "var(--wa-accent)",
            color: isLoading ? "var(--wa-text-muted)" : "#fff",
            border: "none", borderRadius: "24px", padding: "14px",
            fontSize: "15px", fontWeight: "600",
            cursor: isLoading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          }}
        >
          {isLoading ? (
            <div style={{
              width: 16, height: 16,
              border: "2px solid var(--wa-text-muted)",
              borderTop: "2px solid var(--wa-text-primary)",
              borderRadius: "50%", animation: "spin 0.8s linear infinite",
            }} />
          ) : "Save changes"}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;