import jwt from 'jsonwebtoken';
import Joi from 'joi';
import Chat from './models/Chat.js';
import Message from './models/Message.js';
import User from './models/User.js';

const onlineMap = new Map();

export default function socketHandler(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token provided'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('Invalid token'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();

    // Track presence
    if (!onlineMap.has(userId)) onlineMap.set(userId, new Set());
    onlineMap.get(userId).add(socket.id);
    await User.findByIdAndUpdate(userId, { online: true });
    socket.broadcast.emit('user:online', { userId });

    // Join all rooms for this user
    const chats = await Chat.find({ members: userId }).select('_id');
    chats.forEach(c => socket.join(c._id.toString()));

    // Typing
    socket.on('typing:start', (chatId) => socket.to(chatId).emit('typing:start', { chatId, userId, name: socket.user.name }));
    socket.on('typing:stop', (chatId) => socket.to(chatId).emit('typing:stop', { chatId, userId }));

    // Create message (with Joi validation)
    const msgSchema = Joi.object({
      chatId: Joi.string().required(),
      content: Joi.string().allow(''),
      type: Joi.string().valid('text', 'image').required(),
      attachments: Joi.array().items(Joi.string()).default([])
    });

    socket.on('message:create', async (payload, ack) => {
      try {
        const { error, value } = msgSchema.validate(payload);
        if (error) return ack?.({ status: 'error', error: error.details[0].message });

        const chat = await Chat.findOne({ _id: value.chatId, members: socket.user._id });
        if (!chat) return ack?.({ status: 'error', error: 'Not a member of this chat' });

        const created = await Message.create({
          chat: value.chatId,
          sender: socket.user._id,
          content: value.content,
          type: value.type,
          attachments: value.attachments,
          readBy: [socket.user._id]
        });
        chat.lastMessage = created._id;
        await chat.save();

        const populated = await Message.findById(created._id).populate('sender', '_id name avatarUrl');

        io.to(value.chatId).emit('message:new', populated);
        ack?.({ status: 'ok', messageId: populated._id });
      } catch (e) {
        console.error('message:create error', e);
        ack?.({ status: 'error', error: 'Failed to send message' });
      }
    });

    // Mark read
    socket.on('message:read', async ({ chatId, messageId }) => {
      try {
        const m = await Message.findById(messageId);
        if (!m) return;
        if (!m.readBy.find(u => u.toString() === userId)) {
          m.readBy.push(userId);
          await m.save();
        }
        io.to(chatId).emit('message:read', { chatId, messageId, userId });
      } catch (e) { console.error('message:read error', e); }
    });

    socket.on('message', (msg) => {
      setMessages(msgs => ({
        ...msgs,
        [msg.chatId]: [...(msgs[msg.chatId] || []), msg]
      }));
    });

    socket.on('disconnect', async () => {
      onlineMap.get(userId)?.delete(socket.id);
      if (!onlineMap.get(userId)?.size) {
        onlineMap.delete(userId);
        await User.findByIdAndUpdate(userId, { online: false, lastSeen: new Date() });
        socket.broadcast.emit('user:offline', { userId });
      }
    });
  });
}
