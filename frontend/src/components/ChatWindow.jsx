import { useEffect, useRef, useState } from 'react';
import { useStore } from '../stores/useStore';
import api from '../utils/api';
import MessageItem from './MessageItem';
import toast from 'react-hot-toast';

export default function ChatWindow() {
  const { user, activeChatId, messages, setMessages, chats, setChats } = useStore();
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const viewRef = useRef(null);

  // Load messages for active chat
  useEffect(() => {
    if (!activeChatId) return;
    api.get(`/messages/${activeChatId}`)
      .then(({ data }) => setMessages(msgs => ({ ...msgs, [activeChatId]: data })))
      .catch(() => setMessages(msgs => ({ ...msgs, [activeChatId]: [] })));
  }, [activeChatId, setMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.scrollTop = viewRef.current.scrollHeight;
    }
  }, [messages, activeChatId]);

  const safeChats = Array.isArray(chats) ? chats : [];
  const chat = safeChats.find(c => c._id === activeChatId);

  async function sendMessage(e) {
    e.preventDefault();
    if (!activeChatId) {
      toast.error('No chat selected');
      return;
    }
    if (!text.trim() && !file) return;

    let attachments = [];
    let tempMsg = null;

    try {
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await api.post('/messages/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        attachments = [data.url];
      }

      // Optimistically add message
      tempMsg = {
        _id: 'temp-' + Date.now(),
        content: file ? '' : text,
        sender: user,
        createdAt: new Date().toISOString(),
        type: file ? 'image' : 'text',
        attachments,
        readBy: [user],
      };
      setMessages(msgs => ({
        ...msgs,
        [activeChatId]: [...(msgs[activeChatId] || []), tempMsg],
      }));

      setText('');
      setFile(null);

      // Send to server
      const { data: savedMessage } = await api.post('/messages', {
        chatId: activeChatId,
        content: file ? '' : text,
        type: file ? 'image' : 'text',
        attachments,
      });

      // Replace temp message with real one
      setMessages(msgs => ({
        ...msgs,
        [activeChatId]: (msgs[activeChatId] || []).map(m =>
          m._id === tempMsg._id ? savedMessage : m
        ),
      }));

      // Update chat list with latest message
      setChats(chats =>
        chats.map(c =>
          c._id === activeChatId
            ? { ...c, lastMessage: savedMessage }
            : c
        )
      );
    } catch (err) {
      toast.error('Failed to send message');
      // Remove temp message if failed
      if (tempMsg) {
        setMessages(msgs => ({
          ...msgs,
          [activeChatId]: (msgs[activeChatId] || []).filter(m => m._id !== tempMsg._id),
        }));
      }
      console.error(err);
    }
  }

  const chatMessages = messages[activeChatId] || [];
  return (
    <div className="flex flex-col h-full">
      {chat && (
        <div className="border-b px-4 py-2 flex items-center gap-3">
          {chat.isGroup ? (
            <>
              <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center font-bold text-lg">{chat.name[0]}</div>
              <div>
                <div className="font-bold">{chat.name}</div>
                <div className="text-xs text-gray-500">
                  Members: {chat.members.map(m => m.name).join(', ')}
                </div>
              </div>
            </>
          ) : (
            <>
              <img src={chat.members.find(m => m._id !== user?._id)?.avatarUrl || '/default-avatar.png'} alt="avatar" className="w-10 h-10 rounded-full object-cover border" />
              <div>
                <div className="font-bold">{chat.members.find(m => m._id !== user?._id)?.name}</div>
                <div className="text-xs text-gray-500">
                  {chat.members.find(m => m._id !== user?._id)?.online ? 'Online' : 'Offline'}
                </div>
              </div>
            </>
          )}
        </div>
      )}
      <div ref={viewRef} className="flex-1 overflow-y-auto px-4 py-2 bg-gray-50">
        {chatMessages.map(msg => (
          <MessageItem key={msg._id} message={msg} meId={user._id} />
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2 p-2 border-t bg-white">
        <input
          type="text"
          className="input input-bordered flex-1"
          placeholder="Type a message..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          id="file-upload"
          onChange={e => setFile(e.target.files[0])}
        />
        <label htmlFor="file-upload" className="btn btn-sm">
          📎
        </label>
        <button type="submit" className="btn btn-primary btn-sm">
          Send
        </button>
      </form>
    </div>
  );
}

