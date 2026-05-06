import Sidebar from "../components/Sidebar.jsx";
import ChatContainer from "../components/ChatContainer.jsx";
import GroupChatContainer from "../components/GroupChatContainer.jsx";
import NoChatSelected from "../components/NoChatSelected.jsx";
import { useChatStore } from "../store/useChatStore.js";
import { useGroupStore } from "../store/useGroupStore.js";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const { selectedGroup } = useGroupStore();

  return (
    <div style={{
      display: "flex", height: "100vh",
      background: "var(--wa-bg-primary)", overflow: "hidden",
    }}>
      <Sidebar />
      {selectedUser
        ? <ChatContainer />
        : selectedGroup
          ? <GroupChatContainer />
          : <NoChatSelected />
      }
    </div>
  );
};

export default HomePage;