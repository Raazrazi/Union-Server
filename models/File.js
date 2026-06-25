import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  originalName: { type: String, required: true },
  size: { type: Number, required: true }, // in bytes
  mimeType: { type: String, required: true },
  path: { type: String, required: true }, // relative local storage path or Cloudinary ID
  url: { type: String, required: true }, // download or preview URL
  folder: { type: String, default: null }, // ID of parent folder, or null for root
  wing: { type: String, required: true }, // associated wing name
  uploadedBy: { type: String, required: true }, // username of uploader
  description: { type: String, default: '' },
  tags: [{ type: String }],
  isPublic: { type: Boolean, default: true },
  reportUrl: { type: String, default: '' },
  reportPath: { type: String, default: '' },
  reportName: { type: String, default: '' },
  reportSize: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.File || mongoose.model('File', FileSchema);
