import fs from 'fs';
import path from 'path';
import { localDb } from '../config/db.js';
import File from '../models/File.js';
import Wing from '../models/Wing.js';
import ActivityLog from '../models/ActivityLog.js';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

export const uploadFiles = async (req, res) => {
  const { wing, folder, description, tags } = req.body;
  const parentFolder = folder === 'null' || !folder ? null : folder;

  if (!wing) {
    return res.status(400).json({ message: 'Associated wing is required.' });
  }

  const uploadedFiles = req.files && req.files.files ? req.files.files : [];
  const uploadedReport = req.files && req.files.report ? req.files.report[0] : null;

  if (uploadedFiles.length === 0) {
    return res.status(400).json({ message: 'No files uploaded.' });
  }

  try {
    const isLocal = process.env.USE_LOCAL_JSON_DB === 'true';
    let wingDoc;
    if (isLocal) {
      wingDoc = localDb.findOne('wings', { name: wing });
    } else {
      wingDoc = await Wing.findOne({ name: wing });
    }

    if (!wingDoc) {
      return res.status(404).json({ message: 'Associated wing not found.' });
    }

    const totalUploadedSize = uploadedFiles.reduce((sum, f) => sum + f.size, 0) + (uploadedReport ? uploadedReport.size : 0);

    // Quota validation
    if (wingDoc.storageUsed + totalUploadedSize > wingDoc.storageQuota) {
      // Delete local uploaded files to clean up
      uploadedFiles.forEach(f => {
        if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
      });
      if (uploadedReport && fs.existsSync(uploadedReport.path)) {
        fs.unlinkSync(uploadedReport.path);
      }
      return res.status(400).json({
        message: `Upload exceeds wing storage quota. Available: ${((wingDoc.storageQuota - wingDoc.storageUsed) / (1024 * 1024)).toFixed(2)} MB.`
      });
    }

    // Process report file if present
    let reportUrl = '';
    let reportPath = '';
    let reportName = '';
    let reportSize = 0;

    if (uploadedReport) {
      if (isCloudinaryConfigured) {
        try {
          const uploadResult = await cloudinary.uploader.upload(uploadedReport.path, {
            folder: 'unionvault',
            resource_type: 'raw'
          });
          reportUrl = uploadResult.secure_url;
          reportPath = uploadResult.public_id;
          reportName = uploadedReport.originalname;
          reportSize = uploadedReport.size;

          if (fs.existsSync(uploadedReport.path)) {
            fs.unlinkSync(uploadedReport.path);
          }
        } catch (uploadError) {
          console.error(`Cloudinary upload failed for report ${uploadedReport.originalname}:`, uploadError);
          throw new Error(`Cloudinary report upload failed: ${uploadError.message}`);
        }
      } else {
        const relativePath = path.relative(path.join(process.cwd(), 'server'), uploadedReport.path).replace(/\\/g, '/');
        const BASE_URL = process.env.BASE_URL;
        reportUrl = `${BASE_URL}/${relativePath}`;
        reportPath = uploadedReport.path;
        reportName = uploadedReport.originalname;
        reportSize = uploadedReport.size;
      }
    }

    const parsedTags = tags ? tags.split(',').map(t => t.trim()) : [];
    const uploadedDocs = [];

    for (let f of uploadedFiles) {
      let fileUrl = '';
      let storagePath = '';

      if (isCloudinaryConfigured) {
        try {
          let resourceType = 'auto';
          if (f.mimetype.startsWith('image/')) {
            resourceType = 'image';
          } else if (f.mimetype.startsWith('video/') || f.mimetype.startsWith('audio/')) {
            resourceType = 'video';
          } else {
            resourceType = 'raw';
          }

          const uploadResult = await cloudinary.uploader.upload(f.path, {
            folder: 'unionvault',
            resource_type: resourceType
          });

          fileUrl = uploadResult.secure_url;
          storagePath = uploadResult.public_id;

          // Delete local temporary file
          if (fs.existsSync(f.path)) {
            fs.unlinkSync(f.path);
          }
        } catch (uploadError) {
          console.error(`Cloudinary upload failed for ${f.originalname}:`, uploadError);
          throw new Error(`Cloudinary upload failed: ${uploadError.message}`);
        }
      } else {
        const relativePath = path.relative(path.join(process.cwd(), 'server'), f.path).replace(/\\/g, '/');
        const BASE_URL = process.env.BASE_URL;
        fileUrl = `${BASE_URL}/${relativePath}`;
        storagePath = f.path;
      }

      let fileDoc;
      if (isLocal) {
        fileDoc = localDb.create('files', {
          name: f.originalname,
          originalName: f.originalname,
          size: f.size,
          mimeType: f.mimetype,
          path: storagePath,
          url: fileUrl,
          folder: parentFolder,
          wing,
          uploadedBy: req.user.username,
          description: description || '',
          tags: parsedTags,
          isPublic: true,
          reportUrl,
          reportPath,
          reportName,
          reportSize
        });
      } else {
        fileDoc = new File({
          name: f.originalname,
          originalName: f.originalname,
          size: f.size,
          mimeType: f.mimetype,
          path: storagePath,
          url: fileUrl,
          folder: parentFolder,
          wing,
          uploadedBy: req.user.username,
          description: description || '',
          tags: parsedTags,
          isPublic: true,
          reportUrl,
          reportPath,
          reportName,
          reportSize
        });
        await fileDoc.save();
      }
      uploadedDocs.push(fileDoc);
    }

    // Update storage size on Wing
    if (isLocal) {
      localDb.updateOne('wings', { name: wing }, { storageUsed: wingDoc.storageUsed + totalUploadedSize });
      localDb.create('activityLogs', {
        action: 'UPLOAD_FILES',
        description: `Uploaded ${uploadedFiles.length} file(s) into wing "${wing}" (Total: ${(totalUploadedSize / (1024 * 1024)).toFixed(2)} MB).`,
        user: req.user.username,
        wing
      });
    } else {
      await Wing.findOneAndUpdate({ name: wing }, { $inc: { storageUsed: totalUploadedSize } });
      const log = new ActivityLog({
        action: 'UPLOAD_FILES',
        description: `Uploaded ${uploadedFiles.length} file(s) into wing "${wing}" (Total: ${(totalUploadedSize / (1024 * 1024)).toFixed(2)} MB).`,
        user: req.user.username,
        wing
      });
      await log.save();
    }

    res.status(201).json(uploadedDocs);
  } catch (error) {
    // Delete local files in case of error
    uploadedFiles.forEach(f => {
      if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
    });
    if (uploadedReport && fs.existsSync(uploadedReport.path)) {
      fs.unlinkSync(uploadedReport.path);
    }
    res.status(500).json({ message: 'Error uploading files', error: error.message });
  }
};

export const getFilesByWing = async (req, res) => {
  const { wing } = req.params;
  const { folder } = req.query; // optional folder filter
  const parentFolder = folder === 'null' || !folder ? null : folder;

  try {
    const isLocal = process.env.USE_LOCAL_JSON_DB === 'true';
    let files;

    if (isLocal) {
      files = localDb.find('files', { wing, folder: parentFolder });
    } else {
      files = await File.find({ wing, folder: parentFolder });
    }

    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching files', error: error.message });
  }
};

export const deleteFiles = async (req, res) => {
  const { ids } = req.body; // Array of IDs

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'Array of file IDs is required.' });
  }

  try {
    const isLocal = process.env.USE_LOCAL_JSON_DB === 'true';
    let deletedCount = 0;
    let refundedSize = 0;
    let wingName = '';

    for (let id of ids) {
      let fileDoc;
      if (isLocal) {
        fileDoc = localDb.findOne('files', { _id: id });
      } else {
        fileDoc = await File.findById(id);
      }

      if (fileDoc) {
        // Authorization: super_admin or wing_admin of this wing
        if (req.user.role !== 'super_admin' && req.user.wing !== fileDoc.wing) {
          continue; // skip
        }

        wingName = fileDoc.wing;
        refundedSize += fileDoc.size + (fileDoc.reportSize || 0);

        // Delete physical file or Cloudinary asset
        if (fileDoc.url && fileDoc.url.includes('cloudinary.com')) {
          try {
            let resourceType = 'auto';
            if (fileDoc.mimeType.startsWith('image/')) {
              resourceType = 'image';
            } else if (fileDoc.mimeType.startsWith('video/') || fileDoc.mimeType.startsWith('audio/')) {
              resourceType = 'video';
            } else {
              resourceType = 'raw';
            }
            await cloudinary.uploader.destroy(fileDoc.path, { resource_type: resourceType });
            console.log(`🗑️ Deleted Cloudinary asset: ${fileDoc.path}`);
          } catch (delError) {
            console.error(`Failed to delete asset ${fileDoc.path} from Cloudinary:`, delError);
          }
        } else {
          if (fs.existsSync(fileDoc.path)) {
            fs.unlinkSync(fileDoc.path);
          }
        }

        // Delete report if exists
        if (fileDoc.reportUrl) {
          if (fileDoc.reportUrl.includes('cloudinary.com')) {
            try {
              await cloudinary.uploader.destroy(fileDoc.reportPath, { resource_type: 'raw' });
              console.log(`🗑️ Deleted Cloudinary report asset: ${fileDoc.reportPath}`);
            } catch (delError) {
              console.error(`Failed to delete report asset ${fileDoc.reportPath} from Cloudinary:`, delError);
            }
          } else {
            if (fs.existsSync(fileDoc.reportPath)) {
              fs.unlinkSync(fileDoc.reportPath);
            }
          }
        }

        // Delete record
        if (isLocal) {
          localDb.deleteOne('files', { _id: id });
        } else {
          await File.findByIdAndDelete(id);
        }
        deletedCount++;
      }
    }

    if (deletedCount > 0 && wingName) {
      if (isLocal) {
        const wingDoc = localDb.findOne('wings', { name: wingName });
        if (wingDoc) {
          localDb.updateOne(
            'wings',
            { name: wingName },
            { storageUsed: Math.max(0, wingDoc.storageUsed - refundedSize) }
          );
        }
        localDb.create('activityLogs', {
          action: 'DELETE_FILES',
          description: `Deleted ${deletedCount} file(s) from wing "${wingName}".`,
          user: req.user.username,
          wing: wingName
        });
      } else {
        await Wing.findOneAndUpdate(
          { name: wingName },
          { $inc: { storageUsed: -refundedSize } }
        );
        const log = new ActivityLog({
          action: 'DELETE_FILES',
          description: `Deleted ${deletedCount} file(s) from wing "${wingName}".`,
          user: req.user.username,
          wing: wingName
        });
        await log.save();
      }
    }

    res.status(200).json({ message: `Successfully deleted ${deletedCount} files.` });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting files', error: error.message });
  }
};

export const searchFiles = async (req, res) => {
  const { q, wing, tags, type, year } = req.query;

  try {
    const isLocal = process.env.USE_LOCAL_JSON_DB === 'true';
    let results = [];

    if (isLocal) {
      results = localDb.find('files');

      if (q) {
        const lowerQ = q.toLowerCase();
        results = results.filter(f =>
          f.name.toLowerCase().includes(lowerQ) ||
          f.description.toLowerCase().includes(lowerQ)
        );
      }

      if (wing) {
        results = results.filter(f => f.wing === wing);
      }

      if (tags) {
        const tagList = tags.split(',').map(t => t.trim().toLowerCase());
        results = results.filter(f =>
          f.tags.some(tag => tagList.includes(tag.toLowerCase()))
        );
      }

      if (type) {
        results = results.filter(f => {
          const mime = f.mimeType.toLowerCase();
          if (type === 'image') return mime.startsWith('image/');
          if (type === 'video') return mime.startsWith('video/');
          if (type === 'pdf') return mime.includes('pdf');
          if (type === 'document') return mime.includes('document') || mime.includes('word') || mime.includes('excel') || mime.includes('powerpoint') || mime.includes('officedocument') || mime.includes('text/') || mime.includes('epub');
          if (type === 'archive') return mime.includes('zip') || mime.includes('rar') || mime.includes('tar') || mime.includes('gzip') || mime.includes('7z');
          return true;
        });
      }

      if (year) {
        results = results.filter(f => f.createdAt.startsWith(year));
      }
    } else {
      let query = {};

      if (q) {
        query.$or = [
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } }
        ];
      }

      if (wing) {
        query.wing = wing;
      }

      if (tags) {
        const tagList = tags.split(',').map(t => t.trim());
        query.tags = { $in: tagList };
      }

      if (type) {
        if (type === 'image') query.mimeType = { $regex: '^image/', $options: 'i' };
        else if (type === 'video') query.mimeType = { $regex: '^video/', $options: 'i' };
        else if (type === 'pdf') query.mimeType = { $regex: 'pdf', $options: 'i' };
        else if (type === 'document') {
          query.mimeType = {
            $regex: '(document|word|excel|powerpoint|officedocument|text/|epub)',
            $options: 'i'
          };
        } else if (type === 'archive') {
          query.mimeType = { $regex: '(zip|rar|tar|gzip|7z)', $options: 'i' };
        }
      }

      if (year) {
        const start = new Date(`${year}-01-01T00:00:00.000Z`);
        const end = new Date(`${year}-12-31T23:59:59.999Z`);
        query.createdAt = { $gte: start, $lte: end };
      }

      results = await File.find(query);
    }

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error searching files', error: error.message });
  }
};
