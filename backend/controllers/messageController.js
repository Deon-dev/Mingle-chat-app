import Joi from 'joi';
import Message from '../models/Message.js';
import Chat from '../models/Chat.js';

const sendSchema = Joi.object({
  chatId: Joi.string().required(),
  content: Joi.string().allow(''),
  type: Joi.string().valid('text', 'image').required(),
  attachments: Joi.array().items(Joi.string()).default([])
});

export async function getMessages(req, res, next) {
  try {
    const { chatId } = req.params;
    const member = await Chat.findOne({ _id: chatId, members: req.user._id });
    if (!member) return next({ status: 403, message: 'Not a member of this chat' });

    const messages = await Message.find({ chat: chatId })
      .populate('sender', '_id name avatarUrl')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (e) { next(e); }
}

export async function sendMessage(req, res, next) {
  try {
    const { error, value } = sendSchema.validate(req.body);
    if (error) return next({ status: 400, message: error.details[0].message });

    const chat = await Chat.findOne({ _id: value.chatId, members: req.user._id });
    if (!chat) return next({ status: 403, message: 'Not a member of this chat' });

    const msg = await Message.create({
      chat: value.chatId,
      sender: req.user._id,
      content: value.content,
      type: value.type,
      attachments: value.attachments,
      readBy: [req.user._id]
    });

    chat.lastMessage = msg._id;
    await chat.save();

    const populated = await Message.findById(msg._id).populate('sender', '_id name avatarUrl');
    res.json(populated);
  } catch (e) { next(e); }
}
