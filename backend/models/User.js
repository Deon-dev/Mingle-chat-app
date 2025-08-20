import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, lowercase: true, required: true, trim: true },
  password: { type: String, required: true },
  avatarUrl: { type: String },
  online: { type: Boolean, default: false },
  lastSeen: { type: Date, default: null },
}, { timestamps: true });

// userSchema.index({ email: 1 });

export default mongoose.model('User', userSchema);
