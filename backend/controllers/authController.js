import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import User from '../models/User.js';

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(60).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export async function register(req, res, next) {
  try {
    console.log('Registration request received:', req.body);
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      return next({ status: 400, message: error.details[0].message });
    }

    const email = value.email.toLowerCase();
    console.log('Checking if user exists with email:', email);
    const exists = await User.findOne({ email });
    if (exists) {
      console.log('Email already in use:', email);
      return next({ status: 400, message: 'Email already in use' });
    }

    console.log('Hashing password for user:', email);
    const hashed = await bcrypt.hash(value.password, 10);
    console.log('Creating user with name:', value.name, 'email:', email);
    const user = await User.create({ name: value.name, email, password: hashed });

    console.log('User created successfully:', user._id);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl } });
  } catch (e) {
    console.error('Registration error:', e);
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return next({ status: 400, message: error.details[0].message });

    const email = value.email.toLowerCase();
    const user = await User.findOne({ email });
    if (!user) return next({ status: 401, message: 'Invalid credentials' });

    const ok = await bcrypt.compare(value.password, user.password);
    if (!ok) return next({ status: 401, message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl } });
  } catch (e) { next(e); }
}
