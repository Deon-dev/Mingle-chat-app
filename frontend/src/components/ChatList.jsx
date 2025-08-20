import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useStore } from '../stores/useStore';
import toast from 'react-hot-toast';

export default function ChatList() {
  const { chats, setChats, setActiveChat, activeChatId, user } = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    api.get('/chats')
      .then(({ data }) => setChats(Array.isArray(data) ? data : []))
      .catch(() => setChats([]));
  }, [setChats]);

  async function search() {
    if (!query.trim()) return;
    try {
      const { data } = await api.get('/users/search?q=' + encodeURIComponent(query));
      setResults(data);
    } catch {
      toast.error('Search failed');
    }
  }

  async function startChat(userId) {
    try {
      const { data } = await api.post('/chats/private', { userId });
      setChats(chats => [data, ...chats]);
      setActiveChat(data._id);
      setModalOpen(false);
    } catch {
      toast.error('Could not start chat');
    }
  }

  // Defensive: ensure chats is always an array
  const safeChats = Array.isArray(chats) ? chats : [];

  return (
    <div className="overflow-y-auto h-[calc(100vh-56px)]">
      {safeChats.map(c => {
        const other = !c.isGroup
          ? c.members.find(m => m._id !== user?._id)
          : null;
        return (
          <button
            key={c._id}
            onClick={() => setActiveChat(c._id)}
            className={`w-full text-left px-3 py-2 border-b hover:bg-gray-50 flex items-center gap-3 ${activeChatId===c._id?'bg-gray-100':''}`}
          >
            {c.isGroup ? (
              <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center font-bold text-lg">
                {c.name[0]}
              </div>
            ) : (
              <img
                src={other?.avatarUrl || '/default-avatar.png'}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover border"
              />
            )}
            <div className="flex-1">
              <div className="font-medium flex items-center gap-2">
                {c.isGroup ? c.name : (other?.name || 'Chat')}
                {!c.isGroup && other?.online && (
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full" title="Online"></span>
                )}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {c.lastMessage?.sender?.name ? `${c.lastMessage.sender.name}: ` : ''}
                {c.lastMessage?.content || (c.lastMessage?.type === 'image' ? '[Image]' : '')}
              </div>
            </div>
          </button>
        );
      })}
      <button
        onClick={() => setModalOpen(true)}
        className="btn btn-primary rounded-full w-12 h-12 fixed bottom-4 right-4 flex items-center justify-center shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
      {modalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
            <h2 className="font-bold text-lg mb-2">Start New Chat</h2>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Search users"
                className="input input-bordered flex-1"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <button className="btn btn-sm btn-primary" onClick={search}>Search</button>
            </div>
            <div className="max-h-32 overflow-y-auto mb-2">
              {results.map(u => (
                <button
                  key={u._id}
                  className="block w-full text-left px-2 py-1 rounded hover:bg-blue-100"
                  onClick={() => startChat(u._id)}
                >
                  {u.name} <span className="text-xs text-gray-500">{u.email}</span>
                </button>
              ))}
            </div>
            <button className="btn w-full" onClick={() => setModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
