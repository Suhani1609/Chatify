import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const inputStyle = {
    width: "100%", background: "var(--wa-bg-tertiary)",
    border: "none", borderBottom: "2px solid var(--wa-border)",
    borderRadius: "8px 8px 0 0", padding: "12px 14px",
    color: "var(--wa-text-primary)", fontSize: "15px", outline: "none",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("Passwords don't match"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setIsLoading(true);
    try {
      await axiosInstance.post(`/auth/reset-password/${token}`, { password });
      setDone(true);
      toast.success("Password reset successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Reset failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--wa-bg-primary)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
    }}>
      <div style={{
        width: "100%", maxWidth: "420px",
        background: "var(--wa-bg-secondary)",
        borderRadius: "16px", border: "0.5px solid var(--wa-border)", overflow: "hidden",
      }}>
        <div style={{ background: "var(--wa-accent)", padding: "28px 24px 20px", textAlign: "center" }}>
          <div style={{ fontSize: "44px", marginBottom: "6px" }}>🔐</div>
          <h1 style={{ fontSize: "22px", fontWeight: "600", color: "#fff", margin: "0 0 4px" }}>
            {done ? "Password reset!" : "Create new password"}
          </h1>
        </div>

        <div style={{ padding: "24px" }}>
          {done ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
              <p style={{ color: "var(--wa-text-primary)", marginBottom: "16px" }}>
                Your password has been reset. Redirecting to login...
              </p>
              <Link to="/login" style={{ color: "var(--wa-accent)", textDecoration: "none" }}>
                Go to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "var(--wa-accent)", fontWeight: "500", marginBottom: "6px" }}>
                  New password
                </label>
                <input
                  type="password" value={password} required minLength={6}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters" style={inputStyle}
                  onFocus={(e) => e.target.style.borderBottomColor = "var(--wa-accent)"}
                  onBlur={(e) => e.target.style.borderBottomColor = "var(--wa-border)"}
                />
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "var(--wa-accent)", fontWeight: "500", marginBottom: "6px" }}>
                  Confirm password
                </label>
                <input
                  type="password" value={confirm} required minLength={6}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat password" style={inputStyle}
                  onFocus={(e) => e.target.style.borderBottomColor = "var(--wa-accent)"}
                  onBlur={(e) => e.target.style.borderBottomColor = "var(--wa-border)"}
                />
              </div>
              <button
                type="submit" disabled={isLoading}
                style={{
                  width: "100%",
                  background: isLoading ? "var(--wa-bg-tertiary)" : "var(--wa-accent)",
                  color: isLoading ? "var(--wa-text-muted)" : "#fff",
                  border: "none", borderRadius: "24px", padding: "14px",
                  fontSize: "15px", fontWeight: "600",
                  cursor: isLoading ? "not-allowed" : "pointer",
                }}
              >
                {isLoading ? "Resetting..." : "Reset password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;