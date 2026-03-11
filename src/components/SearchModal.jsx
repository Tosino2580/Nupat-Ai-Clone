import { useEffect, useMemo, useRef, useState } from "react";
import { X, Search as SearchIcon, MessageSquare, Clock } from "lucide-react";

const SearchModal = ({ isOpen, onClose, chatHistory = [], onSelect }) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chatHistory;
    return chatHistory.filter((h) =>
      (h.title || "").toLowerCase().includes(q)
    );
  }, [query, chatHistory]);

  const formatDate = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-start justify-center sm:pt-[10vh] px-0 sm:px-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-xl rounded-t-2xl sm:rounded-2xl bg-[#0f0f18] border border-gray-700/60 shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-700/60">
          <SearchIcon size={18} className="text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your conversations…"
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-gray-500 hover:text-gray-300 transition"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center mb-3">
                <SearchIcon size={20} className="text-gray-500" />
              </div>
              <p className="text-gray-400 text-sm font-medium">
                {query ? `No results for "${query}"` : "No conversations yet"}
              </p>
              {query && (
                <p className="text-gray-600 text-xs mt-1">Try a different search term</p>
              )}
            </div>
          ) : (
            <>
              {!query && (
                <div className="px-4 py-1.5 mb-1">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Recent conversations
                  </span>
                </div>
              )}
              {query && (
                <div className="px-4 py-1.5 mb-1">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onSelect(item); onClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800/60 transition text-left group"
                >
                  <div className="w-9 h-9 rounded-xl bg-violet-600/10 border border-violet-600/20 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-600/20 transition">
                    <MessageSquare size={15} className="text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">
                      {item.title || "Untitled Chat"}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock size={11} className="text-gray-600" />
                      <span className="text-xs text-gray-500">
                        {formatDate(item.updated_at || item.created_at)}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 group-hover:text-gray-400 transition flex-shrink-0">
                    Open →
                  </span>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-gray-700/60 px-4 py-2.5 flex items-center gap-4">
          <span className="text-xs text-gray-600">
            <kbd className="bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded text-xs">↵</kbd>
            {" "}to open
          </span>
          <span className="text-xs text-gray-600">
            <kbd className="bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded text-xs">Esc</kbd>
            {" "}to close
          </span>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
