import Joi from 'joi';
import User from '../models/User.js';

export async function me(req, res) {
  res.json(req.user);
}

const updateSchema = Joi.object({
  name: Joi.string().min(2).max(60),
  avatarUrl: Joi.string().uri().allow('')
});

export async function updateMe(req, res, next) {
  try {
    const { error, value } = updateSchema.validate(req.body);
    if (error) return next({ status: 400, message: error.details[0].message });
    const updated = await User.findByIdAndUpdate(req.user._id, value, { new: true }).select('-password');
    res.json(updated);
  } catch (e) { next(e); }
}

export async function searchUsers(req, res, next) {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);
    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    }).select('_id name email avatarUrl online lastSeen');
    res.json(users);
  } catch (e) { next(e); }
}
