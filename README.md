# Lumina — Intelligent AI Assistant

A modern, full-stack AI chat application powered by **Groq** (Llama 3.3 70B). Chat with an intelligent AI, generate images, and manage your conversation history — all in a clean, responsive interface.

---

## Features

- **AI Chat** — Powered by Groq's blazing-fast Llama 3.3 70B model
- **Image Generation** — Generate images from text prompts using Pollinations.ai (free, no key needed)
- **Authentication** — Secure JWT-based sign up / sign in
- **Chat History** — All conversations saved and searchable
- **Theming** — Dark, Pure Black, Midnight, and Light themes
- **Responsive** — Works on desktop and mobile

---

## Tech Stack

| Layer     | Technology                         |
|-----------|------------------------------------|
| Frontend  | React 19 + Vite + Tailwind CSS v4  |
| Backend   | Node.js + Express                  |
| Database  | NeDB (embedded, no setup needed)   |
| AI        | Groq SDK — Llama 3.3 70B           |
| Auth      | JWT + bcryptjs                     |
| Images    | Pollinations.ai                    |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/lumina-ai.git
cd lumina-ai
```

### 2. Set up the backend

```bash
cd backend
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
npm install
npm run dev
```

Get a free Groq API key at [console.groq.com](https://console.groq.com).

### 3. Set up the frontend

```bash
# From the project root
npm install
npm run dev
```

### 4. Open the app

Visit `http://localhost:5173` (or the port shown in your terminal).

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

| Variable     | Description                        |
|--------------|------------------------------------|
| `GROQ_API_KEY` | Your Groq API key (free)         |
| `JWT_SECRET`   | Random secret for JWT signing    |
| `PORT`         | Backend port (default: 3001)     |

---

## Project Structure

```
lumina-ai/
├── backend/
│   ├── routes/
│   │   ├── auth.js        # Sign up / sign in / JWT
│   │   └── chats.js       # Chat CRUD + Groq AI + image generation
│   ├── middleware/
│   │   └── auth.js        # JWT middleware
│   ├── database.js        # NeDB setup
│   ├── server.js          # Express entry point
│   └── .env.example       # Environment variable template
└── src/
    ├── api/
    │   └── luminaAPI.js   # API client (auth + chats)
    ├── components/
    │   ├── MainPage.jsx   # Main chat interface
    │   ├── Sidebar.jsx    # Chat history sidebar
    │   ├── AuthPage.jsx   # Auth page container
    │   ├── Login.jsx      # Login form
    │   ├── Register.jsx   # Register form
    │   ├── SearchModal.jsx   # Chat search
    │   └── SettingsModal.jsx # Appearance & settings
    └── index.css          # Global styles + CSS variables
```

---

## License

MIT
