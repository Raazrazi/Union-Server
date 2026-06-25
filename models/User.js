import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'wing_admin', 'viewer'], default: 'viewer' },
  wing: { type: String, default: null } // Name of the wing if wing_admin, e.g. "Arabic Wing"
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
