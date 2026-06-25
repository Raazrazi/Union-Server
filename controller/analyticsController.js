import { localDb } from '../config/db.js';
import Wing from '../models/Wing.js';
import File from '../models/File.js';
import Folder from '../models/Folder.js';
import ActivityLog from '../models/ActivityLog.js';

export const getSystemOverview = async (req, res) => {
  try {
    const isLocal = process.env.USE_LOCAL_JSON_DB === 'true';
    let wings = [];
    let filesCount = 0;
    let foldersCount = 0;
    let logs = [];

    if (isLocal) {
      wings = localDb.find('wings');
      filesCount = localDb.find('files').length;
      foldersCount = localDb.find('folders').length;
      logs = localDb.find('activityLogs');
      // Sort logs by date descending
      logs.sort((a, b) => new Date(b.date) - new Date(a.date));
      logs = logs.slice(0, 30); // limit to 30
    } else {
      wings = await Wing.find({});
      filesCount = await File.countDocuments({});
      foldersCount = await Folder.countDocuments({});
      logs = await ActivityLog.find({}).sort({ date: -1 }).limit(30);
    }

    const platformStorageLimit = 25 * 1024 * 1024 * 1024; // 25 GB limit in bytes
    const totalStorageUsed = wings.reduce((sum, w) => sum + w.storageUsed, 0);

    // Mock Monthly growth statistics (uploads count & storage used) for charting
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const growthData = months.map((month, idx) => {
      // Calculate active items
      const multiplier = (idx + 1) / months.length;
      return {
        month,
        storageUsed: Math.round(totalStorageUsed * 0.4 + totalStorageUsed * 0.6 * multiplier),
        uploadsCount: Math.round(filesCount * 0.3 + filesCount * 0.7 * multiplier)
      };
    });

    res.status(200).json({
      storage: {
        totalLimit: platformStorageLimit,
        used: totalStorageUsed,
        available: Math.max(0, platformStorageLimit - totalStorageUsed),
        percentage: ((totalStorageUsed / platformStorageLimit) * 100).toFixed(2)
      },
      counts: {
        wings: wings.length,
        files: filesCount,
        folders: foldersCount
      },
      wingBreakdown: wings.map(w => ({
        name: w.name,
        storageUsed: w.storageUsed,
        storageQuota: w.storageQuota,
        percentage: ((w.storageUsed / w.storageQuota) * 100).toFixed(2),
        logo: w.logo
      })),
      activityFeed: logs,
      growth: growthData
    });
  } catch (error) {
    res.status(500).json({ message: 'Error compiling system analytics', error: error.message });
  }
};

export const getWingAnalytics = async (req, res) => {
  const { wing } = req.params;
  try {
    const isLocal = process.env.USE_LOCAL_JSON_DB === 'true';
    let wingDoc;
    let files = [];
    let foldersCount = 0;
    let logs = [];

    if (isLocal) {
      wingDoc = localDb.findOne('wings', { name: wing });
      files = localDb.find('files', { wing });
      foldersCount = localDb.find('folders', { wing }).length;
      logs = localDb.find('activityLogs', { wing });
      logs.sort((a, b) => new Date(b.date) - new Date(a.date));
      logs = logs.slice(0, 15);
    } else {
      wingDoc = await Wing.findOne({ name: wing });
      files = await File.find({ wing });
      foldersCount = await Folder.countDocuments({ wing });
      logs = await ActivityLog.find({ wing }).sort({ date: -1 }).limit(15);
    }

    if (!wingDoc) {
      return res.status(404).json({ message: 'Wing not found' });
    }

    // Breakdown files by type
    const breakdown = {
      image: 0,
      video: 0,
      pdf: 0,
      document: 0,
      archive: 0,
      other: 0
    };

    files.forEach(f => {
      const mime = f.mimeType.toLowerCase();
      if (mime.startsWith('image/')) breakdown.image += f.size;
      else if (mime.startsWith('video/')) breakdown.video += f.size;
      else if (mime.includes('pdf')) breakdown.pdf += f.size;
      else if (mime.includes('zip') || mime.includes('rar') || mime.includes('tar') || mime.includes('7z') || mime.includes('gzip')) breakdown.archive += f.size;
      else if (mime.includes('document') || mime.includes('word') || mime.includes('excel') || mime.includes('officedocument') || mime.includes('text/')) breakdown.document += f.size;
      else breakdown.other += f.size;
    });

    res.status(200).json({
      name: wingDoc.name,
      storageQuota: wingDoc.storageQuota,
      storageUsed: wingDoc.storageUsed,
      available: Math.max(0, wingDoc.storageQuota - wingDoc.storageUsed),
      percentage: ((wingDoc.storageUsed / wingDoc.storageQuota) * 100).toFixed(2),
      filesCount: files.length,
      foldersCount,
      breakdown,
      recentActivity: logs
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving wing analytics', error: error.message });
  }
};
