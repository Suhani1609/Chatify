import { useState } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axiosInstance.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("Reset link sent if email exists!");
    } catch {
      toast.error("Something went wrong");
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
          <div style={{ fontSize: "44px", marginBottom: "6px" }}>🔑</div>
          <h1 style={{ fontSize: "22px", fontWeight: "600", color: "#fff", margin: "0 0 4px" }}>
            Forgot password?
          </h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", margin: 0 }}>
            We'll send you a reset link
          </p>
        </div>

        <div style={{ padding: "24px" }}>
          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📧</div>
              <p style={{ color: "var(--wa-text-primary)", marginBottom: "8px", fontWeight: "500" }}>
                Check your inbox
              </p>
              <p style={{ color: "var(--wa-text-muted)", fontSize: "13px", marginBottom: "20px" }}>
                If an account with <strong>{email}</strong> exists, we sent a reset link. It expires in 1 hour.
              </p>
              <Link to="/login" style={{ color: "var(--wa-accent)", textDecoration: "none", fontSize: "14px" }}>
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "var(--wa-accent)", fontWeight: "500", marginBottom: "6px" }}>
                  Email address
                </label>
                <input
                  type="email" value={email} required
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{
                    width: "100%", background: "var(--wa-bg-tertiary)",
                    border: "none", borderBottom: "2px solid var(--wa-border)",
                    borderRadius: "8px 8px 0 0", padding: "12px 14px",
                    color: "var(--wa-text-primary)", fontSize: "15px", outline: "none",
                  }}
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
                  marginBottom: "16px",
                }}
              >
                {isLoading ? "Sending..." : "Send reset link"}
              </button>
              <p style={{ textAlign: "center", fontSize: "13px", color: "var(--wa-text-muted)" }}>
                Remember your password?{" "}
                <Link to="/login" style={{ color: "var(--wa-accent)", textDecoration: "none" }}>Sign in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;