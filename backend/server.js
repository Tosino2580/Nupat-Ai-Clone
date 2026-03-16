require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./database');

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chats');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── CORS ─────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  // Allow any Vercel deployment (preview + production)
  /^https:\/\/.*\.vercel\.app$/,
  // Allow custom domain if set via env
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      const allowed = allowedOrigins.some((o) =>
        o instanceof RegExp ? o.test(origin) : o === origin
      );
      if (allowed) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// ─── Body parsing ─────────────────────────────────────────────
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/chats', chatRoutes);

// ─── Health check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Lumina backend is running 🚀' });
});

// ─── 404 handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ detail: `Route ${req.method} ${req.path} not found.` });
});

// ─── Start ────────────────────────────────────────────────────
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🚀 Lumina backend running at http://localhost:${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/health\n`);

      if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
        console.warn('⚠️  GROQ_API_KEY is not set in backend/.env');
        console.warn('   AI responses will not work until you add your key.\n');
      }
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
