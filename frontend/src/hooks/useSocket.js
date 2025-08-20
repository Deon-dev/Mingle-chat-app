import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useStore } from '../stores/useStore';
import { notify } from '../utils/notifications';

let socketRef;

export default function useSocket() {
  const { token, activeChatId, addMessage, addTyping, removeTyping, markRead, messages, user } = useStore();
  const lastActiveChat = useRef(activeChatId);

  useEffect(() => {
    if (!token) return;
    socketRef = io(import.meta.env.VITE_API_URL, { auth: { token } });

    socketRef.on('connect', () => { /* connected */ });

    socketRef.on('message:new', (message) => {
      addMessage(message.chat, message);
      // Notify if message not in active chat or tab not focused
      if (lastActiveChat.current !== message.chat || document.hidden) {
        const title = message.sender?.name || 'New message';
        notify(title, message.type === 'image' ? 'Sent an image' : message.content);
      }
    });

    socketRef.on('typing:start', ({ chatId, userId }) => {
      addTyping(chatId, userId);
    });
    socketRef.on('typing:stop', ({ chatId, userId }) => {
      removeTyping(chatId, userId);
    });

    socketRef.on('message:read', ({ chatId, messageId, userId }) => {
      markRead(chatId, messageId, userId);
    });

    return () => { socketRef?.disconnect(); };
  }, [token, addMessage, addTyping, markRead, removeTyping]);

  useEffect(() => { lastActiveChat.current = activeChatId; }, [activeChatId]);

  const chatMessages = messages[activeChatId] || [];
  return (
    <div>
      {chatMessages.map(msg => (
        <MessageItem key={msg._id} message={msg} meId={user._id} />
      ))}
    </div>
  );
}
