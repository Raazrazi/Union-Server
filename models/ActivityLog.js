import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // UPLOAD_FILE, DELETE_FILE, CREATE_FOLDER, USER_LOGIN, etc.
  description: { type: String, required: true },
  details: { type: String, default: '' },
  user: { type: String, required: true }, // username
  wing: { type: String, default: null }, // wing name if applicable
  date: { type: Date, default: Date.now }
});

export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);
