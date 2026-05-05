import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/useAuthStore.js";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => { checkAuth(); }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: "var(--wa-bg-primary)",
        flexDirection: "column", gap: "16px",
      }}>
        <div style={{ fontSize: "48px" }}>💬</div>
        <div style={{
          width: 40, height: 40,
          border: "3px solid var(--wa-bg-tertiary)",
          borderTop: "3px solid var(--wa-accent)",
          borderRadius: "50%", animation: "spin 0.8s linear infinite",
        }} />
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "var(--wa-bg-secondary)",
            color: "var(--wa-text-primary)",
            border: "0.5px solid var(--wa-border)",
            fontSize: "13px",
          },
        }}
      />
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/signup" element={!authUser ? <SignupPage /> : <Navigate to="/" />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/forgot-password" element={!authUser ? <ForgotPasswordPage /> : <Navigate to="/" />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Routes>
    </>
  );
};

export default App;