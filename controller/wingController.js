import { localDb } from '../config/db.js';
import Wing from '../models/Wing.js';
import ActivityLog from '../models/ActivityLog.js';

export const getAllWings = async (req, res) => {
  try {
    const isLocal = process.env.USE_LOCAL_JSON_DB === 'true';
    let wings;
    if (isLocal) {
      wings = localDb.find('wings');
    } else {
      wings = await Wing.find({});
    }
    res.status(200).json(wings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wings', error: error.message });
  }
};

export const getWingByName = async (req, res) => {
  const { name } = req.params;
  try {
    const isLocal = process.env.USE_LOCAL_JSON_DB === 'true';
    let wing;
    if (isLocal) {
      wing = localDb.findOne('wings', { name });
    } else {
      wing = await Wing.findOne({ name });
    }

    if (!wing) {
      return res.status(404).json({ message: 'Wing not found' });
    }
    res.status(200).json(wing);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wing details', error: error.message });
  }
};

export const updateWingQuota = async (req, res) => {
  const { name } = req.params;
  const { storageQuota } = req.body; // in bytes

  try {
    const isLocal = process.env.USE_LOCAL_JSON_DB === 'true';
    let updatedWing;

    if (isLocal) {
      const wing = localDb.findOne('wings', { name });
      if (!wing) return res.status(404).json({ message: 'Wing not found' });
      updatedWing = localDb.updateOne('wings', { name }, { storageQuota: Number(storageQuota) });
      localDb.create('activityLogs', {
        action: 'UPDATE_QUOTA',
        description: `Storage quota for ${name} updated to ${(storageQuota / (1024 * 1024 * 1024)).toFixed(2)} GB.`,
        user: req.user.username,
        wing: name
      });
    } else {
      updatedWing = await Wing.findOneAndUpdate(
        { name },
        { storageQuota: Number(storageQuota) },
        { new: true }
      );
      if (!updatedWing) return res.status(404).json({ message: 'Wing not found' });
      
      const log = new ActivityLog({
        action: 'UPDATE_QUOTA',
        description: `Storage quota for ${name} updated to ${(storageQuota / (1024 * 1024 * 1024)).toFixed(2)} GB.`,
        user: req.user.username,
        wing: name
      });
      await log.save();
    }

    res.status(200).json(updatedWing);
  } catch (error) {
    res.status(500).json({ message: 'Error updating storage quota', error: error.message });
  }
};

export const createWing = async (req, res) => {
  const { name, description, logo, storageQuota } = req.body;
  try {
    const isLocal = process.env.USE_LOCAL_JSON_DB === 'true';
    let existing;
    
    if (isLocal) {
      existing = localDb.findOne('wings', { name });
    } else {
      existing = await Wing.findOne({ name });
    }

    if (existing) {
      return res.status(400).json({ message: 'Wing already exists' });
    }

    let newWing;
    if (isLocal) {
      newWing = localDb.create('wings', {
        name,
        description,
        logo: logo || '',
        storageQuota: Number(storageQuota) || 2 * 1024 * 1024 * 1024,
        storageUsed: 0
      });
      localDb.create('activityLogs', {
        action: 'CREATE_WING',
        description: `New wing "${name}" was created.`,
        user: req.user.username,
        wing: name
      });
    } else {
      newWing = new Wing({
        name,
        description,
        logo: logo || '',
        storageQuota: Number(storageQuota) || 2 * 1024 * 1024 * 1024,
        storageUsed: 0
      });
      await newWing.save();

      const log = new ActivityLog({
        action: 'CREATE_WING',
        description: `New wing "${name}" was created.`,
        user: req.user.username,
        wing: name
      });
      await log.save();
    }

    res.status(201).json(newWing);
  } catch (error) {
    res.status(500).json({ message: 'Error creating wing', error: error.message });
  }
};
