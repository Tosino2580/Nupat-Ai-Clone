const { MongoClient } = require('mongodb');

let _db = null;

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI environment variable is not set');

  const client = new MongoClient(uri);
  await client.connect();
  _db = client.db('lumina');

  // Indexes
  await _db.collection('users').createIndex({ email: 1 }, { unique: true });
  await _db.collection('chats').createIndex({ userId: 1 });
  await _db.collection('messages').createIndex({ chatId: 1 });

  console.log('✅ MongoDB connected (data stored permanently in Atlas)');
}

function getDB() {
  if (!_db) throw new Error('Database not initialized. Call connectDB() first.');
  return {
    users: _db.collection('users'),
    chats: _db.collection('chats'),
    messages: _db.collection('messages'),
  };
}

module.exports = { connectDB, getDB };
