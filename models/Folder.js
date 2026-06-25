import mongoose from 'mongoose';

const FolderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  parentFolder: { type: String, default: null }, // ID of parent folder, or null for root
  wing: { type: String, required: true }, // Associated wing name, e.g., 'Arabic Wing'
  createdBy: { type: String, default: 'System' }
}, { timestamps: true });

// Prevent duplicate names in same path
FolderSchema.index({ name: 1, parentFolder: 1, wing: 1 }, { unique: true });

export default mongoose.models.Folder || mongoose.model('Folder', FolderSchema);
