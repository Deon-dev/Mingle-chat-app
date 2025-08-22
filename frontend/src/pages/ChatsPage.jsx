import { useEffect, useState } from 'react';
import { useStore } from '../stores/useStore';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import CreateGroupModal from '../components/CreateGroupModal';
import Header from '../components/Header';
// import api from '../utils/api';
// import toast from 'react-hot-toast';

export default function ChatsPage() {
  const { token, activeChatId } = useStore();
  const [openGroup, setOpenGroup] = useState(false);

  useEffect(() => {
    if (!token) return;
    // Optionally, fetch chats here if not done in ChatList
  }, [token]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 border-r bg-white flex flex-col relative">
          <div className="p-2 flex justify-between items-center border-b">
            <span className="font-bold text-lg">Chats</span>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => setOpenGroup(true)}
            >
              + Group
            </button>
          </div>
          <ChatList />
        </aside>
        <main className="flex-1 flex flex-col">
          {activeChatId ? (
            <ChatWindow />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a chat to start messaging
            </div>
          )}
        </main>
      </div>
      <CreateGroupModal open={openGroup} onClose={() => setOpenGroup(false)} />
    </div>
  );
}
