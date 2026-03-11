import { useState, useEffect, useCallback } from "react";
import {
  X,
  User,
  Palette,
  Info,
  Shield,
  Check,
  Sparkles,
  Mail,
  Calendar,
  Trash2,
  LogOut,
  MessageSquare,
} from "lucide-react";

const TABS = [
  { id: "account",    label: "Account",       icon: User },
  { id: "appearance", label: "Appearance",     icon: Palette },
  { id: "privacy",    label: "Privacy & Data", icon: Shield },
  { id: "about",      label: "About",          icon: Info },
];

// ── helpers ──────────────────────────────────────────
const THEMES = {
  dark:   { bg: "#05040a", sidebar: "#0a0a0f", label: "Dark",       desc: "Easy on the eyes" },
  darker: { bg: "#000000", sidebar: "#030303", label: "Pure Black", desc: "Maximum contrast" },
  navy:   { bg: "#020818", sidebar: "#040c1f", label: "Midnight",   desc: "Deep blue atmosphere" },
  light:  { bg: "#f1f3f7", sidebar: "#e8eaf0", label: "Light",      desc: "Clean and bright" },
};

const DENSITY = {
  compact:     { py: "6px",  px: "12px", label: "Compact",     desc: "Fit more messages on screen" },
  comfortable: { py: "12px", px: "16px", label: "Comfortable", desc: "Balanced spacing (recommended)" },
  spacious:    { py: "18px", px: "20px", label: "Spacious",    desc: "Maximum breathing room" },
};

const FONT_SIZES = {
  small:  { size: "13px", label: "Small" },
  medium: { size: "15px", label: "Medium" },
  large:  { size: "17px", label: "Large" },
};

function applyTheme(t) {
  const theme = THEMES[t] || THEMES.dark;
  document.documentElement.style.setProperty("--app-bg", theme.bg);
  document.documentElement.style.setProperty("--sidebar-bg", theme.sidebar);
  // data-theme triggers CSS variable overrides in index.css
  document.documentElement.setAttribute("data-theme", t);
}

function applyDensity(d) {
  const den = DENSITY[d] || DENSITY.comfortable;
  document.documentElement.style.setProperty("--msg-py", den.py);
  document.documentElement.style.setProperty("--msg-px", den.px);
}

function applyFontSize(f) {
  const fs = FONT_SIZES[f] || FONT_SIZES.medium;
  document.documentElement.style.setProperty("--chat-font-size", fs.size);
}

// ─────────────────────────────────────────────────────
const SettingsModal = ({ isOpen, onClose, onLogout, chatCount = 0 }) => {
  const [tab, setTab] = useState("account");

  const [theme, setTheme] = useState(
    () => localStorage.getItem("lumina_theme") || "dark"
  );
  const [fontSize, setFontSize] = useState(
    () => localStorage.getItem("lumina_font_size") || "medium"
  );
  const [density, setDensity] = useState(
    () => localStorage.getItem("lumina_density") || "comfortable"
  );
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const getUser = () => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  };
  const user = getUser();

  // Apply & persist on every change
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("lumina_theme", theme);
  }, [theme]);

  useEffect(() => {
    applyFontSize(fontSize);
    localStorage.setItem("lumina_font_size", fontSize);
  }, [fontSize]);

  useEffect(() => {
    applyDensity(density);
    localStorage.setItem("lumina_density", density);
  }, [density]);

  // ESC to close
  const handleKey = useCallback((e) => { if (e.key === "Escape") onClose(); }, [onClose]);
  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // Reset on open
  useEffect(() => {
    if (isOpen) { setTab("account"); setShowClearConfirm(false); }
  }, [isOpen]);

  const handleClearHistory = () => {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("lumina_chat_history"))
      .forEach((k) => localStorage.removeItem(k));
    setShowClearConfirm(false);
    onClose();
    window.location.reload();
  };

  const formatDate = (ts) => {
    if (!ts) return "N/A";
    return new Date(ts).toLocaleDateString(undefined, {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative z-10 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#0d0d16", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <h2 className="text-white font-semibold text-lg">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex" style={{ minHeight: "440px" }}>
          {/* Left nav */}
          <nav className="w-48 flex-shrink-0 border-r border-white/5 p-3 flex flex-col gap-0.5">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left w-full ${
                  tab === id
                    ? "bg-violet-600/15 text-white border border-violet-600/20"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                }`}
              >
                <Icon size={15} className={tab === id ? "text-violet-400" : ""} />
                {label}
              </button>
            ))}
          </nav>

          {/* Right content */}
          <div className="flex-1 p-6 overflow-y-auto">

            {/* ── ACCOUNT ── */}
            {tab === "account" && (
              <div className="space-y-5">
                <SectionHeader title="Account" sub="Your profile and account details" />

                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/4 border border-white/6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0">
                    {(user.email || "U")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{user.email || "Unknown user"}</p>
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-violet-600/15 border border-violet-600/20 text-violet-300 text-xs font-medium">
                      <Sparkles size={10} /> Free Plan
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <InfoRow icon={Mail}          label="Email"         value={user.email || "—"} />
                  <InfoRow icon={Calendar}       label="Member since"  value={formatDate(user.created_at)} />
                  <InfoRow icon={MessageSquare}  label="Conversations" value={chatCount > 0 ? `${chatCount} chat${chatCount !== 1 ? "s" : ""}` : "No chats yet"} />
                </div>

                <div className="pt-2 border-t border-white/5">
                  <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider">Danger Zone</p>
                  <button
                    onClick={() => onLogout?.()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-red-400 border border-red-500/20 hover:bg-red-600/10 hover:border-red-500/40 transition w-full"
                  >
                    <LogOut size={15} />
                    Sign out of Lumina
                  </button>
                </div>
              </div>
            )}

            {/* ── APPEARANCE ── */}
            {tab === "appearance" && (
              <div className="space-y-6">
                <SectionHeader title="Appearance" sub="All changes apply instantly" />

                {/* Theme */}
                <div>
                  <label className="block text-sm text-gray-300 font-medium mb-2.5">Theme</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(THEMES).map(([id, t]) => (
                      <button
                        key={id}
                        onClick={() => setTheme(id)}
                        className={`p-3 rounded-xl border text-left transition ${
                          theme === id
                            ? "border-violet-600/40 bg-violet-600/10"
                            : "border-white/6 hover:bg-white/4"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className="w-5 h-5 rounded-md border border-white/10 flex-shrink-0"
                            style={{ background: t.bg }}
                          />
                          {theme === id && (
                            <div className="w-4 h-4 rounded-full bg-violet-600 flex items-center justify-center">
                              <Check size={10} className="text-white" />
                            </div>
                          )}
                        </div>
                        <p className={`text-xs font-semibold ${theme === id ? "text-white" : "text-gray-300"}`}>{t.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font size */}
                <div>
                  <label className="block text-sm text-gray-300 font-medium mb-2.5">
                    Font Size
                    <span className="ml-2 text-xs text-gray-500 font-normal">({FONT_SIZES[fontSize]?.label})</span>
                  </label>
                  <div className="flex gap-2">
                    {Object.entries(FONT_SIZES).map(([id, f]) => (
                      <button
                        key={id}
                        onClick={() => setFontSize(id)}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition border ${
                          fontSize === id
                            ? "bg-violet-600/15 text-white border-violet-600/30"
                            : "text-gray-400 border-white/6 hover:bg-white/5 hover:text-gray-200"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Preview: <span style={{ fontSize: FONT_SIZES[fontSize]?.size }} className="text-gray-400">The quick brown fox</span></p>
                </div>

                {/* Message Density */}
                <div>
                  <label className="block text-sm text-gray-300 font-medium mb-2.5">Message Density</label>
                  <div className="space-y-2">
                    {Object.entries(DENSITY).map(([id, d]) => (
                      <button
                        key={id}
                        onClick={() => setDensity(id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition text-left ${
                          density === id
                            ? "bg-violet-600/10 border-violet-600/30"
                            : "border-white/6 hover:bg-white/4"
                        }`}
                      >
                        <div>
                          <p className={`text-sm font-medium ${density === id ? "text-white" : "text-gray-300"}`}>{d.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{d.desc}</p>
                        </div>
                        {density === id && (
                          <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-600 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  All preferences are saved automatically
                </p>
              </div>
            )}

            {/* ── PRIVACY ── */}
            {tab === "privacy" && (
              <div className="space-y-5">
                <SectionHeader title="Privacy & Data" sub="Manage your data and conversation history" />

                <div className="space-y-3">
                  <PrivacyItem title="Conversation Storage" desc="Your chats are stored in a local database on this server. Messages are never shared with third parties." />
                  <PrivacyItem title="AI Processing" desc="Messages are sent to Groq's API to generate responses. Groq's privacy policy applies to AI interactions." />
                  <PrivacyItem title="Local Preferences" desc="Appearance and UI settings are stored in your browser's localStorage only." />
                </div>

                <div className="pt-2 border-t border-white/5">
                  <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider">Data Management</p>

                  {!showClearConfirm ? (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-red-400 border border-red-500/20 hover:bg-red-600/10 hover:border-red-500/40 transition w-full"
                    >
                      <Trash2 size={15} />
                      Clear all conversation history
                    </button>
                  ) : (
                    <div className="p-4 rounded-xl border border-red-500/30 bg-red-600/5">
                      <p className="text-sm text-red-300 font-medium mb-1">Are you sure?</p>
                      <p className="text-xs text-gray-500 mb-3">This will permanently delete all local conversation history. This cannot be undone.</p>
                      <div className="flex gap-2">
                        <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-2 rounded-xl text-sm text-gray-300 border border-white/10 hover:bg-white/5 transition">
                          Cancel
                        </button>
                        <button onClick={handleClearHistory} className="flex-1 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition">
                          Clear history
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── ABOUT ── */}
            {tab === "about" && (
              <div className="space-y-5">
                <SectionHeader title="About Lumina" sub="Version and system information" />

                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/4 border border-white/6">
                  <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg flex-shrink-0">
                    <Sparkles size={22} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-base">Lumina</p>
                    <p className="text-gray-400 text-xs mt-0.5">Version 1.0.0 — Intelligent AI Assistant</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <AboutRow label="AI Model"   value="Llama 3.3 70B (Groq)" />
                  <AboutRow label="Frontend"   value="React 19 + Vite + Tailwind CSS" />
                  <AboutRow label="Backend"    value="Node.js + Express" />
                  <AboutRow label="Database"   value="NeDB (local)" />
                  <AboutRow label="Auth"       value="JWT (7-day tokens)" />
                </div>

                <div className="p-4 rounded-xl bg-violet-600/5 border border-violet-600/15">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Lumina is a personal AI assistant powered by Groq's blazing-fast inference.
                    All conversations are private and stored locally. Built with modern web technologies
                    for a smooth and responsive experience.
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-gray-600">© 2025 Lumina. All rights reserved.</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-green-400">All systems operational</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

// ── Sub-components ──────────────────────────────────

const SectionHeader = ({ title, sub }) => (
  <div>
    <h3 className="text-white font-semibold text-base mb-0.5">{title}</h3>
    <p className="text-gray-500 text-xs">{sub}</p>
  </div>
);

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/3 border border-white/5">
    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
      <Icon size={14} className="text-gray-400" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm text-gray-200 font-medium truncate">{value}</p>
    </div>
  </div>
);

const PrivacyItem = ({ title, desc }) => (
  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/3 border border-white/5">
    <div className="w-5 h-5 rounded-full bg-green-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Check size={11} className="text-green-400" />
    </div>
    <div>
      <p className="text-sm text-gray-200 font-medium">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const AboutRow = ({ label, value }) => (
  <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/3 border border-white/5">
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-xs text-gray-300 font-medium">{value}</span>
  </div>
);

export default SettingsModal;
