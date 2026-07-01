const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const localDbPath = path.join(__dirname, '../uploads/local_db.json');

// Ensure uploads folder and local_db.json exist
const initLocalDb = () => {
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  if (!fs.existsSync(localDbPath)) {
    const initialData = {
      users: [],
      customers: [],
      predictions: [],
      reports: []
    };
    fs.writeFileSync(localDbPath, JSON.stringify(initialData, null, 2), 'utf-8');
  }
};

let dbState = {
  isFallback: false,
  localDbPath: localDbPath
};

// Local JSON DB Helper methods (mocking Mongoose CRUD)
const localDb = {
  read: () => {
    try {
      initLocalDb();
      const raw = fs.readFileSync(localDbPath, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error reading local DB:', err);
      return { users: [], customers: [], predictions: [], reports: [] };
    }
  },
  write: (data) => {
    try {
      fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Error writing local DB:', err);
      return false;
    }
  },
  // Simple collections wrapper
  collection: (name) => {
    return {
      find: (filter = {}) => {
        const db = localDb.read();
        let list = db[name] || [];
        // Support simple filter matching
        return list.filter(item => {
          for (let key in filter) {
            if (item[key] !== filter[key]) return false;
          }
          return true;
        });
      },
      findOne: (filter = {}) => {
        const db = localDb.read();
        const list = db[name] || [];
        return list.find(item => {
          for (let key in filter) {
            if (item[key] !== filter[key]) return false;
          }
          return true;
        });
      },
      create: (item) => {
        const db = localDb.read();
        if (!db[name]) db[name] = [];
        const newItem = {
          _id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
          ...item
        };
        db[name].push(newItem);
        localDb.write(db);
        return newItem;
      },
      updateById: (id, update) => {
        const db = localDb.read();
        const list = db[name] || [];
        const idx = list.findIndex(item => item._id === id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...update, updatedAt: new Date().toISOString() };
          db[name] = list;
          localDb.write(db);
          return list[idx];
        }
        return null;
      },
      deleteById: (id) => {
        const db = localDb.read();
        const list = db[name] || [];
        const filtered = list.filter(item => item._id !== id);
        db[name] = filtered;
        localDb.write(db);
        return true;
      }
    };
  }
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/telecom_churn';
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000 // 3 seconds timeout
    });
    console.log('MongoDB connected successfully.');
    dbState.isFallback = false;
  } catch (error) {
    console.warn('MongoDB connection failed. Falling back to local JSON database.');
    initLocalDb();
    dbState.isFallback = true;
  }
};

module.exports = {
  connectDB,
  dbState,
  localDb
};
