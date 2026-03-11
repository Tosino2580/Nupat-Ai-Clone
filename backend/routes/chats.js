const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Groq = require('groq-sdk');
const { chats, messages } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const AI_SYSTEM_PROMPT = `You are Lumina, a helpful, intelligent, and friendly AI assistant.
Give clear, accurate, and well-structured responses.
Use markdown formatting (bold, lists, code blocks) where it improves readability.
Be concise but thorough. If you don't know something, say so honestly.`;

// Detect if the user is asking for image generation
function isImageRequest(text) {
  const lower = text.toLowerCase();
  const imgWords = ['image', 'picture', 'photo', 'illustration', 'drawing', 'painting',
    'artwork', 'portrait', 'landscape', 'wallpaper', 'logo', 'icon', 'banner', 'poster', 'sketch'];
  const actWords = ['generate', 'create', 'draw', 'make', 'show', 'paint',
    'design', 'produce', 'render', 'give me', 'can you'];
  return imgWords.some(w => lower.includes(w)) && actWords.some(w => lower.includes(w));
}

function buildImageUrl(prompt) {
  const clean = encodeURIComponent(prompt.trim());
  return `https://image.pollinations.ai/prompt/${clean}?width=800&height=512&nologo=true&seed=${Date.now()}`;
}

// Helper — strips NeDB internal _id and exposes it as id
function pub(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: _id, ...rest };
}

// ─── POST /api/v1/chats ───────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    const id = uuidv4();
    const now = Date.now();
    const doc = await chats.insertAsync({
      _id: id,
      userId: req.user.id,
      title: req.body.title || 'New Chat',
      created_at: now,
      updated_at: now,
    });
    return res.status(201).json(pub(doc));
  } catch (err) {
    console.error('Create chat error:', err);
    return res.status(500).json({ detail: 'Failed to create chat.' });
  }
});

// ─── GET /api/v1/chats ────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const docs = await chats
      .findAsync({ userId: req.user.id })
      .sort({ updated_at: -1 });
    return res.json(docs.map(pub));
  } catch (err) {
    return res.status(500).json({ detail: 'Failed to get chats.' });
  }
});

// ─── GET /api/v1/chats/:id ────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const chat = await chats.findOneAsync({ _id: req.params.id, userId: req.user.id });
    if (!chat) return res.status(404).json({ detail: 'Chat not found.' });
    return res.json(pub(chat));
  } catch (err) {
    return res.status(500).json({ detail: 'Failed to get chat.' });
  }
});

// ─── PATCH /api/v1/chats/:id ──────────────────────────────────
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const chat = await chats.findOneAsync({ _id: req.params.id, userId: req.user.id });
    if (!chat) return res.status(404).json({ detail: 'Chat not found.' });

    await chats.updateAsync(
      { _id: req.params.id },
      { $set: { title: req.body.title || chat.title, updated_at: Date.now() } }
    );
    const updated = await chats.findOneAsync({ _id: req.params.id });
    return res.json(pub(updated));
  } catch (err) {
    return res.status(500).json({ detail: 'Failed to update chat.' });
  }
});

// ─── DELETE /api/v1/chats/:id ─────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const chat = await chats.findOneAsync({ _id: req.params.id, userId: req.user.id });
    if (!chat) return res.status(404).json({ detail: 'Chat not found.' });

    await chats.removeAsync({ _id: req.params.id }, {});
    await messages.removeAsync({ chatId: req.params.id }, { multi: true });
    return res.json({ message: 'Chat deleted.' });
  } catch (err) {
    return res.status(500).json({ detail: 'Failed to delete chat.' });
  }
});

// ─── GET /api/v1/chats/:id/messages ──────────────────────────
router.get('/:id/messages', authMiddleware, async (req, res) => {
  try {
    const chat = await chats.findOneAsync({ _id: req.params.id, userId: req.user.id });
    if (!chat) return res.status(404).json({ detail: 'Chat not found.' });

    const msgs = await messages
      .findAsync({ chatId: req.params.id })
      .sort({ created_at: 1 });

    return res.json({ messages: msgs.map(pub) });
  } catch (err) {
    return res.status(500).json({ detail: 'Failed to get messages.' });
  }
});

// ─── POST /api/v1/chats/:id/messages ─────────────────────────
router.post('/:id/messages', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ detail: 'Message content is required.' });
    }

    const chat = await chats.findOneAsync({ _id: req.params.id, userId: req.user.id });
    if (!chat) return res.status(404).json({ detail: 'Chat not found.' });

    // Save user message
    const userMsgId = uuidv4();
    const userNow = Date.now();
    const userMsg = await messages.insertAsync({
      _id: userMsgId,
      chatId: chat._id,
      role: 'user',
      content: content.trim(),
      created_at: userNow,
    });

    let assistantContent;

    if (isImageRequest(content.trim())) {
      // Image generation via Pollinations.ai (free, no key needed)
      const imageUrl = buildImageUrl(content.trim());
      assistantContent = `__IMAGE__:${imageUrl}`;
    } else {
      // Get full conversation history for Groq context
      const history = await messages
        .findAsync({ chatId: chat._id })
        .sort({ created_at: 1 });

      // Call Groq
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: AI_SYSTEM_PROMPT },
          ...history.map((m) => ({ role: m.role, content: m.content })),
        ],
        max_tokens: 2048,
        temperature: 0.7,
      });

      assistantContent =
        completion.choices[0]?.message?.content ||
        'Sorry, I could not generate a response. Please try again.';
    }

    // Save assistant message
    const assistantMsgId = uuidv4();
    const assistantNow = Date.now();
    const assistantMsg = await messages.insertAsync({
      _id: assistantMsgId,
      chatId: chat._id,
      role: 'assistant',
      content: assistantContent,
      created_at: assistantNow,
    });

    // Auto-title from first user message
    if (chat.title === 'New Chat') {
      const autoTitle =
        content.trim().length > 55
          ? content.trim().slice(0, 55) + '…'
          : content.trim();
      await chats.updateAsync({ _id: chat._id }, { $set: { title: autoTitle, updated_at: assistantNow } });
    } else {
      await chats.updateAsync({ _id: chat._id }, { $set: { updated_at: assistantNow } });
    }

    const updatedChat = await chats.findOneAsync({ _id: chat._id });

    return res.json({
      user_message: pub(userMsg),
      assistant_message: pub(assistantMsg),
      chat: pub(updatedChat),
    });
  } catch (err) {
    console.error('Send message error:', err);
    if (err?.status === 401 || err?.message?.includes('API key')) {
      return res.status(500).json({
        detail: 'AI error: invalid or missing GROQ_API_KEY in backend/.env',
      });
    }
    return res.status(500).json({ detail: 'Failed to send message. Please try again.' });
  }
});

module.exports = router;
