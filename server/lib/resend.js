import { Resend } from "resend";

const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(process.env.RESEND_API_KEY);
};

export const sendWelcomeEmail = async (email, username) => {
  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: "Chatify <onboarding@resend.dev>",
      to: email,
      subject: "Welcome to Chatify! 🎉",
      html: `
        <body style="margin:0;padding:0;background:#0b141a;font-family:'Segoe UI',Arial,sans-serif">
          <div style="max-width:600px;margin:40px auto;background:#111b21;border-radius:16px;overflow:hidden;border:1px solid #2a3942">
            <div style="background:#00a884;padding:40px 32px;text-align:center">
              <div style="font-size:48px;margin-bottom:12px">💬</div>
              <h1 style="color:#fff;margin:0;font-size:28px;font-weight:600">Welcome to Chatify!</h1>
              <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:15px">Your account is ready</p>
            </div>
            <div style="padding:32px">
              <p style="color:#e9edef;font-size:16px;margin:0 0 16px">Hey <strong style="color:#00a884">${username}</strong> 👋</p>
              <p style="color:#aebac1;font-size:14px;line-height:1.7;margin:0 0 24px">
                You're all set! Start chatting with friends in real time. Send messages, share images, create groups and stay connected.
              </p>
              <div style="text-align:center;margin-bottom:28px">
                <a href="${process.env.CLIENT_URL}" style="display:inline-block;background:#00a884;color:#fff;text-decoration:none;padding:14px 36px;border-radius:32px;font-size:15px;font-weight:600">
                  Open Chatify →
                </a>
              </div>
              <div style="border-top:1px solid #2a3942;padding-top:20px;text-align:center">
                <p style="color:#667781;font-size:12px;margin:0">
                  You received this because you created a Chatify account. If this wasn't you, ignore this email.
                </p>
              </div>
            </div>
          </div>
        </body>
      `,
    });
    if (error) { console.error("❌ Welcome email failed:", error); return; }
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (error) {
    console.error("❌ Welcome email error:", error.message);
  }
};

export const sendPasswordResetEmail = async (email, username, resetUrl) => {
  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: "Chatify <onboarding@resend.dev>",
      to: email,
      subject: "Reset your Chatify password 🔑",
      html: `
        <body style="margin:0;padding:0;background:#0b141a;font-family:'Segoe UI',Arial,sans-serif">
          <div style="max-width:600px;margin:40px auto;background:#111b21;border-radius:16px;overflow:hidden;border:1px solid #2a3942">
            <div style="background:#00a884;padding:40px 32px;text-align:center">
              <div style="font-size:48px;margin-bottom:12px">🔑</div>
              <h1 style="color:#fff;margin:0;font-size:26px;font-weight:600">Reset your password</h1>
            </div>
            <div style="padding:32px">
              <p style="color:#e9edef;font-size:16px;margin:0 0 16px">Hi <strong style="color:#00a884">${username}</strong>,</p>
              <p style="color:#aebac1;font-size:14px;line-height:1.7;margin:0 0 20px">
                Click the button below to reset your password. This link expires in 1 hour.
              </p>
              <div style="text-align:center;margin-bottom:24px">
                <a href="${resetUrl}" style="display:inline-block;background:#00a884;color:#fff;text-decoration:none;padding:14px 36px;border-radius:32px;font-size:15px;font-weight:600">
                  Reset Password →
                </a>
              </div>
              <div style="background:#202c33;border-radius:8px;padding:16px;margin-bottom:24px">
                <p style="color:#667781;font-size:12px;margin:0 0 6px">Button not working? Copy this link:</p>
                <p style="color:#00a884;font-size:12px;margin:0;word-break:break-all">${resetUrl}</p>
              </div>
              <div style="border-top:1px solid #2a3942;padding-top:20px;text-align:center">
                <p style="color:#667781;font-size:12px;margin:0">If you didn't request this, no action is needed.</p>
              </div>
            </div>
          </div>
        </body>
      `,
    });
    if (error) { console.error("❌ Reset email failed:", error); return; }
    console.log(`✅ Reset email sent to ${email}`);
  } catch (error) {
    console.error("❌ Reset email error:", error.message);
  }
};