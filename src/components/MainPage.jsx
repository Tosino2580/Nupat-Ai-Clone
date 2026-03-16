import { useEffect, useRef, useState } from 'react';
import { Sparkles, Send, Menu, Download } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import SearchModal from './SearchModal';
import SettingsModal from './SettingsModal';
import { getUserChats, getMessages, createChat, sendMessage } from '../api/luminaAPI';
import ReactMarkdown from 'react-markdown';

const ImageCard = ({ url }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full">
      {!loaded && !error && (
        <div className="flex items-center justify-center w-full h-[180px] sm:h-[220px] text-violet-400 gap-2 text-sm">
          <div className="animate-spin w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full" />
          Generating image…
        </div>
      )}
      {error ? (
        <div className="flex items-center justify-center w-full h-[100px] text-gray-500 text-sm px-4 text-center">
          Failed to generate image. Try again.
        </div>
      ) : (
        <img
          src={url}
          alt="AI generated"
          className={`w-full rounded-xl transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0 absolute'}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
      {loaded && (
        <div className="flex items-center justify-between px-3 py-2 border-t border-violet-600/10">
          <span className="text-xs text-gray-500">AI Generated Image</span>
          <a
            href={url}
            download="lumina-image.jpg"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition"
          >
            <Download size={13} /> Save
          </a>
        </div>
      )}
    </div>
  );
};

const MainPage = () => {
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem("token") || localStorage.getItem("userToken");

  const getUserHistoryKey = () => {
    const token = getToken();
    return token ? `lumina_chat_history_${token}` : 'lumina_chat_history_guest';
  };

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Chat state
  const [chatHistory, setChatHistory] = useState(() => {
    try {
      const raw = localStorage.getItem(getUserHistoryKey());
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [activeChat, setActiveChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  const persistHistory = (next) => {
    setChatHistory(next);
    try {
      localStorage.setItem(getUserHistoryKey(), JSON.stringify(next));
    } catch (e) {
      console.warn('Failed to save history', e);
    }
  };

  // Auth check
  useEffect(() => {
    setIsLoggedIn(!!getToken());
  }, []);

  // Initialize CSS variables from saved preferences
  useEffect(() => {
    const fontMap = { small: '13px', medium: '15px', large: '17px' };
    const densityMap = {
      compact:     { py: '6px',  px: '12px' },
      comfortable: { py: '12px', px: '16px' },
      spacious:    { py: '18px', px: '20px' },
    };
    const themeMap = {
      dark:   { bg: '#05040a', sidebar: '#0a0a0f' },
      darker: { bg: '#000000', sidebar: '#030303' },
      navy:   { bg: '#020818', sidebar: '#040c1f' },
      light:  { bg: '#f1f3f7', sidebar: '#e8eaf0' },
    };
    const fs = localStorage.getItem('lumina_font_size') || 'medium';
    const den = localStorage.getItem('lumina_density') || 'comfortable';
    const th = localStorage.getItem('lumina_theme') || 'dark';
    const root = document.documentElement;
    root.style.setProperty('--chat-font-size', fontMap[fs] || '15px');
    root.style.setProperty('--msg-py', (densityMap[den] || densityMap.comfortable).py);
    root.style.setProperty('--msg-px', (densityMap[den] || densityMap.comfortable).px);
    root.style.setProperty('--app-bg', (themeMap[th] || themeMap.dark).bg);
    root.style.setProperty('--sidebar-bg', (themeMap[th] || themeMap.dark).sidebar);
    root.setAttribute('data-theme', th);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const close = () => setShowUserMenu(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages?.length, isGenerating]);

  // Load chats on mount
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    (async () => {
      try {
        const chats = await getUserChats(token);
        const list = Array.isArray(chats) ? chats : chats?.data || [];
        const localHistoryRaw = localStorage.getItem(getUserHistoryKey());
        const localHistory = localHistoryRaw ? JSON.parse(localHistoryRaw) : [];
        const merged = [...list, ...localHistory]
          .filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i)
          .slice(0, 100);
        persistHistory(merged);
        if (merged.length > 0) {
          const first = { ...merged[0], messages: [] };
          setActiveChat(first);
          await loadMessagesForChat(first.id, token);
        }
      } catch (err) {
        console.error('Failed to load chats:', err);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMessagesForChat = async (chatId, tokenArg) => {
    const token = tokenArg || getToken();
    if (!token || !chatId) return;
    try {
      const res = await getMessages(token, chatId);
      const messages = Array.isArray(res?.messages) ? res.messages : [];
      setActiveChat((prev) => ({ ...(prev || {}), id: chatId, messages }));
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const handleNewChat = async () => {
    const token = getToken();
    if (!token) { navigate('/auth'); return; }
    setIsGenerating(true);
    try {
      const newChat = await createChat(token, 'New Chat');
      const chatObj = newChat?.id ? newChat : newChat?.chat || newChat;
      persistHistory([chatObj, ...chatHistory].slice(0, 100));
      setActiveChat({ ...chatObj, messages: [] });
      setMessageInput('');
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (err) {
      console.error('Failed to create new chat:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectHistory = async (item) => {
    const token = getToken();
    const storageKey = getUserHistoryKey();
    const raw = localStorage.getItem(storageKey);
    const allChats = raw ? JSON.parse(raw) : [];
    const cached = allChats.find((c) => c.id === item.id);
    setActiveChat(cached ? { ...cached } : { ...item, messages: [] });
    try {
      const res = await getMessages(token, item.id);
      const messages = Array.isArray(res?.messages) ? res.messages : [];
      setActiveChat((prev) => {
        const updated = { ...prev, messages };
        persistHistory(allChats.map((c) => (c.id === updated.id ? updated : c)));
        return updated;
      });
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    const content = messageInput.trim();
    if (!content || isGenerating) return;
    const token = getToken();
    if (!token) { navigate('/auth'); return; }

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setIsGenerating(true);
    setMessageInput('');

    // Show user message immediately
    const tempId = `u-temp-${Date.now()}`;
    const tempUserMsg = { id: tempId, role: 'user', content };
    setActiveChat((prev) => ({
      ...(prev || {}),
      messages: [...(prev?.messages ?? []), tempUserMsg],
    }));

    try {
      let chatId = activeChat?.id;
      let currentHistory = chatHistory;

      if (!chatId) {
        const newChat = await createChat(token, 'New Chat');
        const chatObj = newChat?.id ? newChat : newChat?.chat || newChat;
        chatId = chatObj.id;
        currentHistory = [chatObj, ...chatHistory].slice(0, 100);
        persistHistory(currentHistory);
      }

      const res = await sendMessage(token, chatId, content);
      const userMsg = res?.user_message || tempUserMsg;
      const assistantMsg = res?.assistant_message || {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: res?.message || res?.response || res?.text || 'No response received.',
      };

      setActiveChat((prev) => {
        const withoutTemp = (prev?.messages ?? []).filter((m) => m.id !== tempId);
        const updated = {
          ...(prev || {}),
          id: chatId,
          messages: [...withoutTemp, userMsg, assistantMsg],
          title: res?.chat?.title || prev?.title,
        };
        const idx = currentHistory.findIndex((c) => c.id === updated.id);
        const next = [...currentHistory];
        if (idx !== -1) next[idx] = { ...updated };
        else next.unshift({ ...updated });
        persistHistory(next.slice(0, 100));
        return updated;
      });
    } catch (err) {
      console.error('Send message error:', err);
      // Remove temp message on error
      setActiveChat((prev) => ({
        ...prev,
        messages: (prev?.messages ?? []).filter((m) => m.id !== tempId),
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userAuth');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/auth', { replace: true });
  };

  const getUserInitial = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return (user.email || user.name || 'U')[0].toUpperCase();
    } catch {
      return 'U';
    }
  };

  const suggestions = [
    { icon: '✉️', text: 'Help me write a professional email' },
    { icon: '💡', text: 'Explain a complex topic simply' },
    { icon: '📚', text: 'Create a study plan for me' },
    { icon: '🚀', text: 'Give me ideas for my project' },
  ];

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'var(--app-bg, #05040a)', fontFamily: 'Montserrat, sans-serif' }}>
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        chatHistory={chatHistory}
        activeChat={activeChat}
        onNewChat={handleNewChat}
        onOpenSearch={() => setIsSearchOpen(true)}
        onSelectHistory={handleSelectHistory}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="bg-grid-pattern absolute inset-0 opacity-20"></div>
          <div className="animate-blob absolute left-0 top-0 h-96 w-96 rounded-full bg-violet-700/30 blur-3xl"></div>
          <div className="animate-blob animation-delay-2000 absolute right-0 top-1/2 h-80 w-96 rounded-full bg-violet-500/25 blur-3xl"></div>
          <div className="animate-blob animation-delay-4000 absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl"></div>
        </div>

        {/* Header */}
        <header
          className="relative z-10 flex items-center justify-between px-4 py-3 border-b backdrop-blur-sm flex-shrink-0"
          style={{ background: 'var(--header-bg)', borderColor: 'var(--header-border)' }}
        >
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-black/10 transition"
                style={{ color: 'var(--sidebar-text)' }}
              >
                <Menu size={20} />
              </button>
            )}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold truncate max-w-[140px] sm:max-w-xs md:max-w-sm" style={{ color: 'var(--header-text)' }}>
                {activeChat?.title || 'Lumina'}
              </span>
            </div>
          </div>

          <div>
            {!isLoggedIn ? (
              <Link to="/auth">
                <button className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-full transition-colors duration-200">
                  Sign In
                </button>
              </Link>
            ) : (
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowUserMenu((p) => !p); }}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white font-bold text-sm hover:opacity-90 transition shadow-lg"
                >
                  {getUserInitial()}
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-44 bg-gray-900 border border-gray-700/80 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-700/60">
                      <p className="text-white text-sm font-semibold">My Account</p>
                    </div>
                    <button
                      onClick={() => { setShowUserMenu(false); setIsSettingsOpen(true); }}
                      className="w-full text-left px-4 py-2.5 text-gray-300 hover:bg-gray-800 text-sm transition"
                    >
                      Settings
                    </button>
                    <button
                      onClick={() => { setShowUserMenu(false); handleLogout(); }}
                      className="w-full text-left px-4 py-2.5 text-red-400 hover:bg-red-600/20 text-sm transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Content: Messages or Welcome */}
        <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
          {activeChat ? (
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5 scrollbar-thin">
              {activeChat.messages?.length > 0 ? (
                <>
                  {activeChat.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="hidden sm:flex w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-600/30 items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles className="h-4 w-4 text-violet-400" />
                        </div>
                      )}
                      {msg.role === 'assistant' && msg.content.startsWith('__IMAGE__:') ? (
                        <div className="max-w-[90%] sm:max-w-[78%] w-full rounded-2xl overflow-hidden border border-violet-600/20 bg-[#0f0f18]">
                          <ImageCard url={msg.content.replace('__IMAGE__:', '')} />
                        </div>
                      ) : (
                        <div
                          className={`max-w-[90%] sm:max-w-[78%] rounded-2xl leading-relaxed border ${
                            msg.role === 'user'
                              ? 'bg-violet-600 text-white rounded-tr-sm border-transparent'
                              : 'rounded-tl-sm'
                          }`}
                          style={msg.role === 'assistant' ? {
                            fontSize: 'var(--chat-font-size, 15px)',
                            padding: 'var(--msg-py, 12px) var(--msg-px, 16px)',
                            background: 'var(--ai-bubble-bg)',
                            borderColor: 'var(--ai-bubble-border)',
                            color: 'var(--ai-bubble-text)',
                          } : {
                            fontSize: 'var(--chat-font-size, 15px)',
                            padding: 'var(--msg-py, 12px) var(--msg-px, 16px)',
                          }}
                        >
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                      {msg.role === 'user' && (
                        <div className="hidden sm:flex w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 items-center justify-center flex-shrink-0 mt-0.5 text-white font-bold text-xs shadow">
                          {getUserInitial()}
                        </div>
                      )}
                    </div>
                  ))}

                  {isGenerating && (
                    <div className="flex justify-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-600/30 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-4 w-4 text-violet-400" />
                      </div>
                      <div className="border rounded-2xl rounded-tl-sm px-4 py-3.5" style={{ background: 'var(--ai-bubble-bg)', borderColor: 'var(--ai-bubble-border)' }}>
                        <div className="typing-indicator">
                          <span></span><span></span><span></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 text-sm">Send a message to start this conversation.</p>
                </div>
              )}
            </div>
          ) : (
            // Welcome / empty state
            <div className="flex flex-1 flex-col items-center justify-center px-4 pb-6 fade-in">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-600/20 bg-violet-600/10 px-4 py-1.5">
                <Sparkles className="h-4 w-4 text-violet-400" />
                <span className="text-violet-300 text-sm font-medium tracking-wide">Lumina</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-3 px-2">
                Intelligent. Fast.{' '}
                <span className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">
                  Helpful.
                </span>
              </h1>
              <p className="text-gray-400 text-center max-w-sm mb-6 sm:mb-8 text-sm px-4">
                Your AI assistant is ready to help you think, create, plan, and explore ideas.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg mb-6">
                {suggestions.map((s) => (
                  <button
                    key={s.text}
                    onClick={() => {
                      setMessageInput(s.text);
                      inputRef.current?.focus();
                    }}
                    className="text-left p-3.5 rounded-xl bg-gray-900/60 border border-gray-700/50 text-gray-300 text-sm hover:border-violet-500/50 hover:bg-gray-800/80 hover:text-white transition-all duration-200 group"
                  >
                    <span className="mr-2">{s.icon}</span>
                    {s.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="relative z-10 px-4 pb-5 flex-shrink-0">
            <div className="mx-auto w-full max-w-2xl">
              <div
                className="relative flex items-end gap-2 border rounded-2xl px-4 py-3 backdrop-blur-sm transition-colors shadow-lg focus-within:border-violet-500/60"
                style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)' }}
              >
                <textarea
                  ref={(el) => { inputRef.current = el; textareaRef.current = el; }}
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="flex-1 bg-transparent placeholder-gray-500 resize-none outline-none text-sm leading-relaxed"
                  style={{ minHeight: '24px', maxHeight: '160px', color: 'var(--input-text)' }}
                  placeholder={isLoggedIn ? 'Ask anything… (Shift+Enter for new line)' : 'Sign in to start chatting'}
                  rows={1}
                  disabled={!isLoggedIn}
                />
                <button
                  onClick={handleSend}
                  disabled={!messageInput.trim() || isGenerating || !isLoggedIn}
                  className="flex-shrink-0 w-9 h-9 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors shadow"
                >
                  <Send className="h-4 w-4 text-white" />
                </button>
              </div>
              <p className="text-center text-xs text-gray-600 mt-2">
                Lumina can make mistakes. Verify important information.
              </p>
            </div>
          </div>
        </div>
      </div>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        chatHistory={chatHistory}
        onSelect={handleSelectHistory}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onLogout={handleLogout}
        chatCount={chatHistory.length}
      />
    </div>
  );
};

export default MainPage;
