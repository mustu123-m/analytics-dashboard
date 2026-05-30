// Simple file-based persistence so users survive server restarts on Render
// In production swap this for PostgreSQL/MongoDB
const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, '../data/users.json');

// Ensure data dir exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Load existing users from disk into a Map
const loadUsers = () => {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf8');
      const arr = JSON.parse(raw);
      const map = new Map();
      arr.forEach(u => map.set(u.email, u));
      return map;
    }
  } catch (e) {
    console.error('Failed to load users from disk:', e.message);
  }
  return new Map();
};

const users = loadUsers();

// Persist to disk on every write
const saveUsers = () => {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify([...users.values()], null, 2));
  } catch (e) {
    console.error('Failed to save users to disk:', e.message);
  }
};

module.exports = { users, saveUsers };