import mongoose from 'mongoose';

const WingSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  logo: { type: String, default: '' },
  storageQuota: { type: Number, default: 2147483648 }, // 2GB default in bytes (2 * 1024 * 1024 * 1024)
  storageUsed: { type: Number, default: 0 } // in bytes
}, { timestamps: true });

export default mongoose.models.Wing || mongoose.model('Wing', WingSchema);
