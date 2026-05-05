import Sidebar from "../components/Sidebar.jsx";
import ChatContainer from "../components/ChatContainer.jsx";
import NoChatSelected from "../components/NoChatSelected.jsx";
import { useChatStore } from "../store/useChatStore.js";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--wa-bg-primary)", overflow: "hidden" }}>
      <Sidebar />
      {selectedUser ? <ChatContainer /> : <NoChatSelected />}
    </div>
  );
};

export default HomePage;