import fs from 'fs';
import { localDb } from '../config/db.js';
import Folder from '../models/Folder.js';
import File from '../models/File.js';
import ActivityLog from '../models/ActivityLog.js';
import { cloudinary } from '../config/cloudinary.js';


export const createFolder = async (req, res) => {
  const { name, parentFolder, wing } = req.body;

  if (!name || !wing) {
    return res.status(400).json({ message: 'Folder name and associated wing are required.' });
  }

  try {
    const isLocal = process.env.USE_LOCAL_JSON_DB === 'true';
    let folderExists;

    const parentId = parentFolder || null;

    if (isLocal) {
      folderExists = localDb.findOne('folders', { name, parentFolder: parentId, wing });
    } else {
      folderExists = await Folder.findOne({ name, parentFolder: parentId, wing });
    }

    if (folderExists) {
      return res.status(400).json({ message: 'A folder with this name already exists in this directory.' });
    }

    let newFolder;
    if (isLocal) {
      newFolder = localDb.create('folders', {
        name,
        parentFolder: parentId,
        wing,
        createdBy: req.user.username
      });
      localDb.create('activityLogs', {
        action: 'CREATE_FOLDER',
        description: `Created folder "${name}" in ${wing}.`,
        user: req.user.username,
        wing
      });
    } else {
      newFolder = new Folder({
        name,
        parentFolder: parentId,
        wing,
        createdBy: req.user.username
      });
      await newFolder.save();

      const log = new ActivityLog({
        action: 'CREATE_FOLDER',
        description: `Created folder "${name}" in ${wing}.`,
        user: req.user.username,
        wing
      });
      await log.save();
    }

    res.status(201).json(newFolder);
  } catch (error) {
    res.status(500).json({ message: 'Error creating folder', error: error.message });
  }
};

export const getFoldersByWing = async (req, res) => {
  const { wing } = req.params;
  try {
    const isLocal = process.env.USE_LOCAL_JSON_DB === 'true';
    let folders;
    if (isLocal) {
      folders = localDb.find('folders', { wing });
    } else {
      folders = await Folder.find({ wing });
    }
    res.status(200).json(folders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching folders', error: error.message });
  }
};

export const deleteFolder = async (req, res) => {
  const { id } = req.params;
  try {
    const isLocal = process.env.USE_LOCAL_JSON_DB === 'true';
    let folder;
    
    if (isLocal) {
      folder = localDb.findOne('folders', { _id: id });
    } else {
      folder = await Folder.findById(id);
    }

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Authorization: User must be Super Admin or Admin of this wing
    if (req.user.role !== 'super_admin' && req.user.wing !== folder.wing) {
      return res.status(403).json({ message: 'Not authorized to modify this wing.' });
    }

    // Helper function to recursively find all subfolders
    const getAllSubfolderIds = async (folderId) => {
      let subIds = [folderId];
      let queue = [folderId];
      
      while (queue.length > 0) {
        const current = queue.shift();
        let children;
        if (isLocal) {
          children = localDb.find('folders', { parentFolder: current });
        } else {
          children = await Folder.find({ parentFolder: current });
        }
        for (let child of children) {
          subIds.push(child._id.toString());
          queue.push(child._id.toString());
        }
      }
      return subIds;
    };

    const targetFolderIds = await getAllSubfolderIds(id);
    let filesToDelete = [];

    // Find files to calculate storage refund and to delete physically
    if (isLocal) {
      filesToDelete = localDb.find('files', {}).filter(f => targetFolderIds.includes(f.folder));
    } else {
      filesToDelete = await File.find({ folder: { $in: targetFolderIds } });
    }

    const totalSizeDeleted = filesToDelete.reduce((sum, f) => sum + f.size, 0);

    // Delete physical files or Cloudinary assets
    for (const fileDoc of filesToDelete) {
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
          console.error(`Failed to delete folder asset ${fileDoc.path} from Cloudinary:`, delError);
        }
      } else {
        if (fs.existsSync(fileDoc.path)) {
          fs.unlinkSync(fileDoc.path);
        }
      }
    }

    // Delete records from database
    if (isLocal) {
      const db = localDb.read();
      db.files = db.files.filter(f => !targetFolderIds.includes(f.folder));
      db.folders = db.folders.filter(f => !targetFolderIds.includes(f._id));
      
      // Update wing storage
      const wing = db.wings.find(w => w.name === folder.wing);
      if (wing) {
        wing.storageUsed = Math.max(0, wing.storageUsed - totalSizeDeleted);
      }
      localDb.write(db);

      localDb.create('activityLogs', {
        action: 'DELETE_FOLDER',
        description: `Deleted folder "${folder.name}" and all contents in ${folder.wing}.`,
        user: req.user.username,
        wing: folder.wing
      });
    } else {
      await File.deleteMany({ folder: { $in: targetFolderIds } });
      await Folder.deleteMany({ _id: { $in: targetFolderIds } });

      // Update storage used
      const Wing = (await import('../models/Wing.js')).default;
      await Wing.findOneAndUpdate(
        { name: folder.wing },
        { $inc: { storageUsed: -totalSizeDeleted } }
      );

      const log = new ActivityLog({
        action: 'DELETE_FOLDER',
        description: `Deleted folder "${folder.name}" and all contents in ${folder.wing}.`,
        user: req.user.username,
        wing: folder.wing
      });
      await log.save();
    }

    res.status(200).json({ message: 'Folder and contents deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting folder', error: error.message });
  }
};
