import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async (email, username) => {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "placeholder_add_real_key_later") {
      console.log("⚠️ Resend key not set — skipping welcome email");
      return;
    }
    await resend.emails.send({
      from: "Chatify <onboarding@resend.dev>",
      to: email,
      subject: "Welcome to Chatify!",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h1 style="color:#00a884">Welcome to Chatify! 🎉</h1>
          <p>Hey <strong>${username}</strong>, your account is ready.</p>
          <p>You can now log in and start chatting with your friends in real time.</p>
          <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/login"
            style="display:inline-block;margin-top:16px;padding:12px 24px;background:#00a884;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">
            Start Chatting
          </a>
          <p style="margin-top:32px;font-size:12px;color:#999">— The Chatify Team</p>
        </div>
      `,
    });
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
  }
};