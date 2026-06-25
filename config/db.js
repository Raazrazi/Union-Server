import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultDbData = {
  users: [
    {
      _id: 'u1',
      username: 'admin',
      email: 'admin@unionvault.org',
      password: '$2a$10$4Gauzc.4StE1WQkUiBetjuJCdts0a97yY7QvNuD/4Gsu8AmCqDNBG', // Vault@ADM2025
      role: 'super_admin',
      wing: null,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'u2',
      username: 'guest',
      email: 'guest@unionvault.org',
      password: '$2a$10$q8xtZHWpASXsF5DH5huimuBZcdpWX9IpU.PHD2sgPn7TFw1n32qnS', // Guest@UV2025
      role: 'viewer',
      wing: null,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'u3',
      username: 'wing_ENG',
      email: 'english@unionvault.org',
      password: '$2a$10$4Gauzc.4StE1WQkUiBetjuJCdts0a97yY7QvNuD/4Gsu8AmCqDNBG', // Vault@ADM2025
      role: 'wing_admin',
      wing: 'Eng',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'u4',
      username: 'wing_URD',
      email: 'urdu@unionvault.org',
      password: '$2a$10$4Gauzc.4StE1WQkUiBetjuJCdts0a97yY7QvNuD/4Gsu8AmCqDNBG', // Vault@ADM2025
      role: 'wing_admin',
      wing: 'Urdu',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'u5',
      username: 'wing_ARB',
      email: 'arabic@unionvault.org',
      password: '$2a$10$4Gauzc.4StE1WQkUiBetjuJCdts0a97yY7QvNuD/4Gsu8AmCqDNBG', // Vault@ADM2025
      role: 'wing_admin',
      wing: 'Arabic',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'u6',
      username: 'wing_MAL',
      email: 'malayalam@unionvault.org',
      password: '$2a$10$4Gauzc.4StE1WQkUiBetjuJCdts0a97yY7QvNuD/4Gsu8AmCqDNBG', // Vault@ADM2025
      role: 'wing_admin',
      wing: 'Malayalam',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'u7',
      username: 'wing_SKSSF',
      email: 'skssf@unionvault.org',
      password: '$2a$10$4Gauzc.4StE1WQkUiBetjuJCdts0a97yY7QvNuD/4Gsu8AmCqDNBG', // Vault@ADM2025
      role: 'wing_admin',
      wing: 'SKSSF',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'u8',
      username: 'wing_HIZB',
      email: 'hizb@unionvault.org',
      password: '$2a$10$4Gauzc.4StE1WQkUiBetjuJCdts0a97yY7QvNuD/4Gsu8AmCqDNBG', // Vault@ADM2025
      role: 'wing_admin',
      wing: 'Hizb',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'u9',
      username: 'wing_EDT',
      email: 'edit@unionvault.org',
      password: '$2a$10$4Gauzc.4StE1WQkUiBetjuJCdts0a97yY7QvNuD/4Gsu8AmCqDNBG', // Vault@ADM2025
      role: 'wing_admin',
      wing: 'Edit',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'u10',
      username: 'wing_INT',
      email: 'intellectual@unionvault.org',
      password: '$2a$10$4Gauzc.4StE1WQkUiBetjuJCdts0a97yY7QvNuD/4Gsu8AmCqDNBG', // Vault@ADM2025
      role: 'wing_admin',
      wing: 'Intellectual',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'u11',
      username: 'wing_SRD',
      email: 'srd@unionvault.org',
      password: '$2a$10$4Gauzc.4StE1WQkUiBetjuJCdts0a97yY7QvNuD/4Gsu8AmCqDNBG', // Vault@ADM2025
      role: 'wing_admin',
      wing: 'SRD',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'u12',
      username: 'wing_OUT',
      email: 'outreach@unionvault.org',
      password: '$2a$10$4Gauzc.4StE1WQkUiBetjuJCdts0a97yY7QvNuD/4Gsu8AmCqDNBG', // Vault@ADM2025
      role: 'wing_admin',
      wing: 'Outreach',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'u13',
      username: 'wing_DIS',
      email: 'disa@unionvault.org',
      password: '$2a$10$4Gauzc.4StE1WQkUiBetjuJCdts0a97yY7QvNuD/4Gsu8AmCqDNBG', // Vault@ADM2025
      role: 'wing_admin',
      wing: 'DISA',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'u14',
      username: 'wing_MED',
      email: 'media@unionvault.org',
      password: '$2a$10$4Gauzc.4StE1WQkUiBetjuJCdts0a97yY7QvNuD/4Gsu8AmCqDNBG', // Vault@ADM2025
      role: 'wing_admin',
      wing: 'Media',
      createdAt: new Date().toISOString()
    }
  ],
  wings: [
    { _id: 'w1', name: 'Eng', description: 'English Language, Creative Writing & Public Speaking Wing.', logo: '/assets/wings/english.png', storageQuota: 2 * 1024 * 1024 * 1024, storageUsed: 0, createdAt: new Date().toISOString() },
    { _id: 'w2', name: 'Urdu', description: 'Urdu Poetry, Literature & Cultural Wing.', logo: '/assets/wings/english.png', storageQuota: 2 * 1024 * 1024 * 1024, storageUsed: 0, createdAt: new Date().toISOString() },
    { _id: 'w3', name: 'Arabic', description: 'Arabic Calligraphy, Language & Literature Wing.', logo: '/assets/wings/arabic.png', storageQuota: 2 * 1024 * 1024 * 1024, storageUsed: 0, createdAt: new Date().toISOString() },
    { _id: 'w4', name: 'Malayalam', description: 'Malayalam Language, Literature & Art Wing.', logo: '/assets/wings/malayalam.png', storageQuota: 2 * 1024 * 1024 * 1024, storageUsed: 0, createdAt: new Date().toISOString() },
    { _id: 'w5', name: 'SKSSF', description: 'SKSSF Union Wing.', logo: '/assets/wings/union.svg', storageQuota: 2 * 1024 * 1024 * 1024, storageUsed: 0, createdAt: new Date().toISOString() },
    { _id: 'w6', name: 'Hizb', description: 'Hizb Spiritual & Union Wing.', logo: '/assets/wings/union.svg', storageQuota: 2 * 1024 * 1024 * 1024, storageUsed: 0, createdAt: new Date().toISOString() },
    { _id: 'w7', name: 'Edit', description: 'Editorial & Publication Wing.', logo: '/assets/wings/arts.png', storageQuota: 2 * 1024 * 1024 * 1024, storageUsed: 0, createdAt: new Date().toISOString() },
    { _id: 'w8', name: 'Intellectual', description: 'Intellectual Debates, Seminars & Research Wing.', logo: '/assets/wings/science.png', storageQuota: 2 * 1024 * 1024 * 1024, storageUsed: 0, createdAt: new Date().toISOString() },
    { _id: 'w9', name: 'SRD', description: 'Student Resource Development Wing.', logo: '/assets/wings/it.png', storageQuota: 2 * 1024 * 1024 * 1024, storageUsed: 0, createdAt: new Date().toISOString() },
    { _id: 'w10', name: 'Outreach', description: 'Public Relations, Social Service & Outreach Wing.', logo: '/assets/wings/sports.svg', storageQuota: 2 * 1024 * 1024 * 1024, storageUsed: 0, createdAt: new Date().toISOString() },
    { _id: 'w11', name: 'DISA', description: 'DISA Guidance & Career Counseling Wing.', logo: '/assets/wings/union.svg', storageQuota: 2 * 1024 * 1024 * 1024, storageUsed: 0, createdAt: new Date().toISOString() },
    { _id: 'w12', name: 'Media', description: 'Media Wing, Photography, Broadcasting & Design.', logo: '/assets/wings/media.svg', storageQuota: 4 * 1024 * 1024 * 1024, storageUsed: 0, createdAt: new Date().toISOString() }
  ],
  folders: [],
  files: [],
  activityLogs: [
    { _id: 'al1', action: 'SYSTEM_INIT', description: 'Union Vault platform database initialized successfully.', details: 'Local database backend loaded.', user: 'System', date: new Date().toISOString() }
  ]
};

// Local JSON DB Engine
export const localDb = {
  read: () => {
    try {
      if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(defaultDbData, null, 2));
        return defaultDbData;
      }
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const data = JSON.parse(raw);
      
      // Migrate usernames and passwords to new wing-code format in local JSON DB
      const localMigrations = [
        { oldUsername: 'admin',           newUsername: 'admin',    newPassword: '$2a$10$4Gauzc.4StE1WQkUiBetjuJCdts0a97yY7QvNuD/4Gsu8AmCqDNBG' },
        { oldUsername: 'malayalam_admin', newUsername: 'wing_MAL', newPassword: '$2a$10$c9/.45afV65jYGpT2Q6CUOzCR4ycBYewizPe7LkFMxPBIBK2LN8de' },
        { oldUsername: 'english_admin',   newUsername: 'wing_ENG', newPassword: '$2a$10$EaqSlpsqeFdP.1UzV99TieNwb5EkT2RAKVzgp9s65ZI.kVSlGWKlm' },
        { oldUsername: 'arabic_admin',    newUsername: 'wing_ARB', newPassword: '$2a$10$fQD30Z6ygXMWMrlIjpSdeeIT7V952BLTPNGZ7O1b6.A7fG8S3n0h2' },
        { oldUsername: 'science_admin',   newUsername: 'wing_SCI', newPassword: '$2a$10$Kmvw//gEo3zGeM3scQEwo.BPPhxmCEhW7uIMAsaDz3it5mGpzpEW.' },
        { oldUsername: 'it_admin',        newUsername: 'wing_IT',  newPassword: '$2a$10$wqbnNKaTW5lq0jbV6fvLpOfLQIUxxfxehy70Ri0e.0RM06lb0a2Lm' },
        { oldUsername: 'arts_admin',      newUsername: 'wing_ART', newPassword: '$2a$10$7mzYh1vHinR3sEWRVLrsGuyje.nL.RwS9s1eiBchwgT1hZ/QQZlYC' },
        { oldUsername: 'sports_admin',    newUsername: 'wing_SPT', newPassword: '$2a$10$t98ILyyPk5geByWiscVcQuTd/97ku0vrqSex8eMq8Rio5wBIMGJwa' },
        { oldUsername: 'media_admin',     newUsername: 'wing_MED', newPassword: '$2a$10$LuJBs7Go6THOSQqTSHt/ZeyDuDvgYpUHkl6oq50DeA0nngO6K9Esy' },
        { oldUsername: 'union_admin',     newUsername: 'wing_UNO', newPassword: '$2a$10$MGs5GMyaoiPT1iMVrxneEuGWes5I.glsk24jowlplKIB5F73WCoSK' },
        { oldUsername: 'guest',           newUsername: 'guest',    newPassword: '$2a$10$q8xtZHWpASXsF5DH5huimuBZcdpWX9IpU.PHD2sgPn7TFw1n32qnS' },
      ];
      let modified = false;
      if (data.users && Array.isArray(data.users)) {
        data.users.forEach(u => {
          const migration = localMigrations.find(m => m.oldUsername === u.username);
          if (migration) {
            u.username = migration.newUsername;
            u.password = migration.newPassword;
            modified = true;
          }
        });
      }
      if (modified) {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        console.log('🔄 Migrated users to new wing-code credentials in local JSON DB.');
      }
      return data;
    } catch (err) {
      console.error('Failed to read local DB file, using default data', err);
      return defaultDbData;
    }
  },
  
  write: (data) => {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
      return true;
    } catch (err) {
      console.error('Failed to write to local DB file', err);
      return false;
    }
  },

  find: (collection, query = {}) => {
    const db = localDb.read();
    const list = db[collection] || [];
    return list.filter(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  },

  findOne: (collection, query = {}) => {
    const list = localDb.find(collection, query);
    return list.length > 0 ? list[0] : null;
  },

  create: (collection, doc) => {
    const db = localDb.read();
    if (!db[collection]) db[collection] = [];
    const newDoc = {
      _id: Math.random().toString(36).substring(2, 11),
      ...doc,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db[collection].push(newDoc);
    localDb.write(db);
    return newDoc;
  },

  updateOne: (collection, query, update) => {
    const db = localDb.read();
    const list = db[collection] || [];
    const idx = list.findIndex(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        ...update,
        updatedAt: new Date().toISOString()
      };
      db[collection] = list;
      localDb.write(db);
      return list[idx];
    }
    return null;
  },

  deleteOne: (collection, query) => {
    const db = localDb.read();
    const list = db[collection] || [];
    const idx = list.findIndex(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
    if (idx !== -1) {
      const removed = list.splice(idx, 1)[0];
      db[collection] = list;
      localDb.write(db);
      return removed;
    }
    return null;
  },

  deleteMany: (collection, query) => {
    const db = localDb.read();
    const list = db[collection] || [];
    const beforeLength = list.length;
    const newList = list.filter(item => {
      for (let key in query) {
        if (item[key] === query[key]) return false;
      }
      return true;
    });
    db[collection] = newList;
    localDb.write(db);
    return { deletedCount: beforeLength - newList.length };
  }
};

const seedMongoDB = async () => {
  try {
    const User = (await import('../models/User.js')).default;
    const Wing = (await import('../models/Wing.js')).default;
    const ActivityLog = (await import('../models/ActivityLog.js')).default;

    // Seed / Sync Users
    console.log('🌱 Syncing default users to MongoDB...');
    const validUsernames = defaultDbData.users.map(u => u.username);
    await User.deleteMany({ role: 'wing_admin', username: { $nin: validUsernames } });
    
    for (const u of defaultDbData.users) {
      const existing = await User.findOne({ username: u.username });
      if (!existing) {
        const { _id, ...uData } = u;
        await User.create(uData);
      } else {
        existing.wing = u.wing;
        existing.role = u.role;
        existing.email = u.email;
        existing.password = u.password;
        await existing.save();
      }
    }

    // Seed / Sync Wings
    console.log('🌱 Syncing default wings to MongoDB...');
    const validWingNames = defaultDbData.wings.map(w => w.name);
    await Wing.deleteMany({ name: { $nin: validWingNames } });

    for (const w of defaultDbData.wings) {
      const existing = await Wing.findOne({ name: w.name });
      if (!existing) {
        const { _id, ...wData } = w;
        await Wing.create(wData);
      } else {
        existing.logo = w.logo;
        existing.storageQuota = w.storageQuota;
        await existing.save();
      }
    }

    // Seed ActivityLog
    const logCount = await ActivityLog.countDocuments({});
    if (logCount === 0) {
      console.log('🌱 Seeding system log to MongoDB...');
      const logsToSeed = defaultDbData.activityLogs.map(({ _id, ...l }) => l);
      await ActivityLog.insertMany(logsToSeed);
    }
    console.log('✅ MongoDB database seeding check completed.');
  } catch (err) {
    console.error('❌ Error seeding MongoDB:', err.message);
  }
};

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('⚠️  No MONGODB_URI found. Defaulting to local JSON DB.');
    process.env.USE_LOCAL_JSON_DB = 'true';
    localDb.read(); // seed local file if not exists
    return;
  }
  
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB database.');
    process.env.USE_LOCAL_JSON_DB = 'false';
    await seedMongoDB();
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.log('⚠️  Falling back to local JSON DB.');
    process.env.USE_LOCAL_JSON_DB = 'true';
    localDb.read(); // seed local file if not exists
  }
};
