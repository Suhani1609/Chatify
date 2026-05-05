import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore.js";

const SignupPage = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { signup, isSigningUp } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signup(formData);
  };

  const inputStyle = {
    width: "100%", background: "var(--wa-bg-tertiary)",
    border: "none", borderBottom: "2px solid var(--wa-border)",
    borderRadius: "8px 8px 0 0", padding: "12px 14px",
    color: "var(--wa-text-primary)", fontSize: "15px", outline: "none",
    transition: "border-color .2s",
  };

  const labelStyle = {
    display: "block", fontSize: "12px",
    color: "var(--wa-accent)", fontWeight: "500", marginBottom: "6px",
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--wa-bg-primary)",
      display: "flex", alignItems: "center",
      justifyContent: "center", padding: "16px",
    }}>
      <div style={{
        width: "100%", maxWidth: "420px",
        background: "var(--wa-bg-secondary)",
        borderRadius: "16px", border: "0.5px solid var(--wa-border)",
        overflow: "hidden",
      }}>
        <div style={{
          background: "var(--wa-accent)", padding: "28px 24px 20px", textAlign: "center",
        }}>
          <div style={{ fontSize: "44px", marginBottom: "6px" }}>💬</div>
          <h1 style={{ fontSize: "22px", fontWeight: "600", color: "#fff", margin: "0 0 4px" }}>
            Create Account
          </h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", margin: 0 }}>
            Join Chatify today — it's free
          </p>
        </div>

        <div style={{ padding: "24px" }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Username</label>
              <input
                type="text" value={formData.username} required
                minLength={3} maxLength={20}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="yourname (3–20 characters)" style={inputStyle}
                onFocus={(e) => e.target.style.borderBottomColor = "var(--wa-accent)"}
                onBlur={(e) => e.target.style.borderBottomColor = "var(--wa-border)"}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Email address</label>
              <input
                type="email" value={formData.email} required
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com" style={inputStyle}
                onFocus={(e) => e.target.style.borderBottomColor = "var(--wa-accent)"}
                onBlur={(e) => e.target.style.borderBottomColor = "var(--wa-border)"}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password} required minLength={6}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 6 characters"
                  style={{ ...inputStyle, paddingRight: "44px" }}
                  onFocus={(e) => e.target.style.borderBottomColor = "var(--wa-accent)"}
                  onBlur={(e) => e.target.style.borderBottomColor = "var(--wa-border)"}
                />
                <button
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: "12px", top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: "16px", color: "var(--wa-text-muted)",
                  }}
                >{showPassword ? "🙈" : "👁️"}</button>
              </div>
            </div>

            <button
              type="submit" disabled={isSigningUp}
              style={{
                width: "100%",
                background: isSigningUp ? "var(--wa-bg-tertiary)" : "var(--wa-accent)",
                color: isSigningUp ? "var(--wa-text-muted)" : "#fff",
                border: "none", borderRadius: "24px", padding: "14px",
                fontSize: "15px", fontWeight: "600",
                cursor: isSigningUp ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
            >
              {isSigningUp ? (
                <div style={{
                  width: 16, height: 16,
                  border: "2px solid var(--wa-text-muted)",
                  borderTop: "2px solid var(--wa-text-primary)",
                  borderRadius: "50%", animation: "spin 0.8s linear infinite",
                }} />
              ) : "Create Account"}
            </button>
          </form>

          <p style={{
            textAlign: "center", fontSize: "13px",
            color: "var(--wa-text-secondary)", marginTop: "20px",
          }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--wa-accent)", textDecoration: "none", fontWeight: "500" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;