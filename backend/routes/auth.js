const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { users } = require('../database');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// ─── POST /api/v1/auth/signup ─────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ detail: 'Email and password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ detail: 'Password must be at least 8 characters.' });
    }

    const emailClean = email.toLowerCase().trim();

    const existing = await users.findOneAsync({ email: emailClean });
    if (existing) {
      return res.status(400).json({ detail: 'An account with this email already exists.' });
    }

    const id = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);
    const now = Date.now();

    await users.insertAsync({
      _id: id,
      email: emailClean,
      phone: phone || null,
      password_hash: passwordHash,
      created_at: now,
    });

    const token = jwt.sign({ id, email: emailClean }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      access_token: token,
      user: { id, email: emailClean, phone: phone || null },
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ detail: 'Something went wrong. Please try again.' });
  }
});

// ─── POST /api/v1/auth/login ──────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ detail: 'Email and password are required.' });
    }

    const user = await users.findOneAsync({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ detail: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ detail: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      access_token: token,
      user: { id: user._id, email: user.email, phone: user.phone },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ detail: 'Something went wrong. Please try again.' });
  }
});

// ─── POST /api/v1/auth/logout ─────────────────────────────────
router.post('/logout', authMiddleware, (req, res) => {
  return res.json({ message: 'Logged out successfully.' });
});

// ─── GET /api/v1/auth/me ──────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  const user = await users.findOneAsync({ _id: req.user.id });
  if (!user) return res.status(404).json({ detail: 'User not found.' });
  return res.json({ id: user._id, email: user.email, phone: user.phone, created_at: user.created_at });
});

module.exports = router;
