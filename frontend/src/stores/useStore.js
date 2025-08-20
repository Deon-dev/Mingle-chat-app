import { create } from 'zustand';

export const useStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  chats: [], // <-- always start as []
  messages: {}, // { chatId: [message, ...] }
  activeChatId: null,
  typingByChat: {}, // { chatId: Set(userId) }

  setAuth: ({ user, token }) => {
    if (token) localStorage.setItem('token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, chats: [], messages: {}, activeChatId: null });
  },

  setChats: (chats) => set({ chats }),
  setActiveChat: (chatId) => set({ activeChatId: chatId }),
  addMessage: (chatId, message) => {
    const msgs = get().messages[chatId] || [];
    set({ messages: { ...get().messages, [chatId]: [...msgs, message] } });
  },
  setMessages: (chatId, list) => set({ messages: { ...get().messages, [chatId]: list } }),

  addTyping: (chatId, userId) => {
    const tb = { ...get().typingByChat };
    tb[chatId] = tb[chatId] || new Set();
    tb[chatId].add(userId);
    set({ typingByChat: tb });
  },
  removeTyping: (chatId, userId) => {
    const tb = { ...get().typingByChat };
    tb[chatId]?.delete(userId);
    set({ typingByChat: tb });
  },
  markRead: (chatId, messageId, userId) => {
    const list = (get().messages[chatId] || []).map(m =>
      m._id === messageId ? { ...m, readBy: [...new Set([...(m.readBy || []), userId])] } : m
    );
    set({ messages: { ...get().messages, [chatId]: list } });
  }
}));
