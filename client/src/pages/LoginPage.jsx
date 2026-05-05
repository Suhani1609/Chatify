import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore.js";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(formData);
  };

  const inputStyle = {
    width: "100%", background: "var(--wa-bg-tertiary)",
    border: "none", borderBottom: "2px solid var(--wa-border)",
    borderRadius: "8px 8px 0 0", padding: "12px 14px",
    color: "var(--wa-text-primary)", fontSize: "15px", outline: "none",
    transition: "border-color .2s",
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
          background: "var(--wa-accent)",
          padding: "32px 24px 24px", textAlign: "center",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "8px" }}>💬</div>
          <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#fff", margin: "0 0 4px" }}>
            Chatify
          </h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", margin: 0 }}>
            Connect with anyone, anywhere
          </p>
        </div>

        <div style={{ padding: "28px 24px" }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "var(--wa-accent)", fontWeight: "500", marginBottom: "6px" }}>
                Email address
              </label>
              <input
                type="email" value={formData.email} required
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com" style={inputStyle}
                onFocus={(e) => e.target.style.borderBottomColor = "var(--wa-accent)"}
                onBlur={(e) => e.target.style.borderBottomColor = "var(--wa-border)"}
              />
            </div>

            <div style={{ marginBottom: "8px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "var(--wa-accent)", fontWeight: "500", marginBottom: "6px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password} required
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
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

            <div style={{ textAlign: "right", marginBottom: "20px" }}>
              <Link to="/forgot-password" style={{
                fontSize: "12px", color: "var(--wa-accent)", textDecoration: "none",
              }}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit" disabled={isLoggingIn}
              style={{
                width: "100%",
                background: isLoggingIn ? "var(--wa-bg-tertiary)" : "var(--wa-accent)",
                color: isLoggingIn ? "var(--wa-text-muted)" : "#fff",
                border: "none", borderRadius: "24px", padding: "14px",
                fontSize: "15px", fontWeight: "600",
                cursor: isLoggingIn ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
            >
              {isLoggingIn ? (
                <div style={{
                  width: 16, height: 16,
                  border: "2px solid var(--wa-text-muted)",
                  borderTop: "2px solid var(--wa-text-primary)",
                  borderRadius: "50%", animation: "spin 0.8s linear infinite",
                }} />
              ) : "Sign In"}
            </button>
          </form>

          <p style={{
            textAlign: "center", fontSize: "13px",
            color: "var(--wa-text-secondary)", marginTop: "20px",
          }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "var(--wa-accent)", textDecoration: "none", fontWeight: "500" }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;