const Datastore = require('@seald-io/nedb');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// Persistent datastores — stored as plain JSON files in backend/data/
const users = new Datastore({
  filename: path.join(dataDir, 'users.db'),
  autoload: true,
});

const chats = new Datastore({
  filename: path.join(dataDir, 'chats.db'),
  autoload: true,
});

const messages = new Datastore({
  filename: path.join(dataDir, 'messages.db'),
  autoload: true,
});

// Unique index on email
users.ensureIndex({ fieldName: 'email', unique: true });
// Fast lookups by owner / chat
chats.ensureIndex({ fieldName: 'userId' });
messages.ensureIndex({ fieldName: 'chatId' });

console.log('✅ Database ready  (data stored in backend/data/)');

module.exports = { users, chats, messages };
