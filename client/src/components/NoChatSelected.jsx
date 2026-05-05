const NoChatSelected = () => (
  <div style={{
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    background: "#222e35",
  }}>
    <div style={{ textAlign: "center", maxWidth: "340px" }}>
      <div style={{ fontSize: "80px", marginBottom: "24px" }}>💬</div>
      <h2 style={{ fontSize: "28px", fontWeight: "300", color: "var(--wa-text-primary)", marginBottom: "12px" }}>
        Chatify Web
      </h2>
      <p style={{ fontSize: "14px", color: "var(--wa-text-muted)", lineHeight: "1.6", marginBottom: "20px" }}>
        Send and receive messages without keeping your phone online.
        Use Chatify on up to 4 linked devices.
      </p>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        padding: "8px 16px", border: "0.5px solid var(--wa-border)",
        borderRadius: "24px", fontSize: "12px", color: "var(--wa-text-muted)",
      }}>
        🔒 End-to-end encrypted
      </div>
    </div>
  </div>
);

export default NoChatSelected;