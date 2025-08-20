import Joi from 'joi';
import Chat from '../models/Chat.js';
import User from '../models/User.js';

const privateSchema = Joi.object({ userId: Joi.string().required() });
const groupSchema = Joi.object({ name: Joi.string().min(2).required(), members: Joi.array().items(Joi.string()).min(2).required() });

export async function myChats(req, res, next) {
  try {
    const chats = await Chat.find({ members: req.user._id })
      .populate('members', '_id name email avatarUrl online')
      .populate({ path: 'lastMessage', populate: { path: 'sender', select: '_id name' } })
      .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (e) { next(e); }
}

export async function createPrivate(req, res, next) {
  try {
    const { error, value } = privateSchema.validate(req.body);
    if (error) return next({ status: 400, message: error.details[0].message });

    const other = await User.findById(value.userId);
    if (!other) return next({ status: 404, message: 'User not found' });

    let chat = await Chat.findOne({ isGroup: false, members: { $all: [req.user._id, other._id], $size: 2 } });
    if (!chat) chat = await Chat.create({ isGroup: false, members: [req.user._id, other._id] });

    const populated = await Chat.findById(chat._id)
      .populate('members', '_id name email avatarUrl online')
      .populate({ path: 'lastMessage', populate: { path: 'sender', select: '_id name' } });

    res.json(populated);
  } catch (e) { next(e); }
}

export async function createGroup(req, res, next) {
  try {
    const { error, value } = groupSchema.validate(req.body);
    if (error) return next({ status: 400, message: error.details[0].message });

    const uniq = Array.from(new Set([req.user._id.toString(), ...value.members]));
    const chat = await Chat.create({ name: value.name, isGroup: true, members: uniq, admins: [req.user._id] });

    const populated = await Chat.findById(chat._id)
      .populate('members', '_id name email avatarUrl online');

    res.json(populated);
  } catch (e) { next(e); }
}
