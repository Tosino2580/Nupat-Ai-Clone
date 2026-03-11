import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  MessageSquare,
  Settings,
  LogOut,
  PanelLeftClose,
  Sparkles,
} from 'lucide-react';

const Sidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  chatHistory = [],
  activeChat,
  onNewChat,
  isCreating,
  onOpenSearch,
  onOpenSettings,
  onLogout,
  onSelectHistory,
}) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-30"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`
          fixed md:static left-0 top-0 h-screen z-40
          border-r backdrop-blur-xl
          transition-all duration-300 flex flex-col flex-shrink-0 overflow-hidden
          ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0 md:w-0'}
        `}
        style={{ background: 'var(--sidebar-bg, #0a0a0f)', borderColor: 'var(--sidebar-border)' }}
      >
        {isSidebarOpen && (
          <>
            {/* Logo / Brand */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/20">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--sidebar-brand)' }}>Lumina</span>
              </Link>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-1.5 rounded-lg hover:bg-black/10 transition"
                style={{ color: 'var(--sidebar-text)' }}
              >
                <PanelLeftClose size={18} />
              </button>
            </div>

            {/* Actions */}
            <div className="p-3 flex flex-col gap-2">
              <button
                onClick={onNewChat}
                disabled={isCreating}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-violet-600/15 hover:bg-violet-600/25 border border-violet-600/20 text-white text-sm font-medium transition disabled:opacity-50"
              >
                <Plus size={17} />
                <span>New Chat</span>
              </button>

              <button
                onClick={onOpenSearch}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition"
                style={{ color: 'var(--sidebar-text)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--sidebar-hover-bg)'; e.currentTarget.style.color = 'var(--sidebar-text-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--sidebar-text)'; }}
              >
                <Search size={16} />
                <span>Search chats</span>
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 px-3 overflow-y-auto scrollbar-thin space-y-0.5">
              <div
                className="text-xs font-semibold uppercase tracking-wider px-2 mb-2 pt-1"
                style={{ color: 'var(--sidebar-section-label)' }}
              >
                Recent
              </div>

              {chatHistory.length === 0 ? (
                <div className="px-2 py-4 text-center">
                  <MessageSquare className="h-6 w-6 mx-auto mb-2" style={{ color: 'var(--sidebar-section-label)' }} />
                  <p className="text-xs" style={{ color: 'var(--sidebar-text)' }}>No conversations yet</p>
                </div>
              ) : (
                chatHistory.map((chat) => {
                  const isActive = activeChat?.id === chat.id;
                  return (
                    <button
                      key={chat.id}
                      onClick={() => onSelectHistory(chat)}
                      className="w-full flex items-center gap-2.5 px-2 py-2.5 rounded-xl text-sm transition text-left border"
                      style={isActive ? {
                        background: 'rgba(37,99,235,0.18)',
                        borderColor: 'rgba(37,99,235,0.25)',
                        color: 'var(--sidebar-brand)',
                      } : {
                        borderColor: 'transparent',
                        color: 'var(--sidebar-text)',
                      }}
                      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--sidebar-hover-bg)'; e.currentTarget.style.color = 'var(--sidebar-text-hover)'; }}}
                      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--sidebar-text)'; }}}
                    >
                      <MessageSquare size={15} className="flex-shrink-0" />
                      <span className="truncate">{chat.title || 'Untitled Chat'}</span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t flex flex-col gap-1" style={{ borderColor: 'var(--sidebar-border)' }}>
              <button
                onClick={onOpenSettings}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition"
                style={{ color: 'var(--sidebar-text)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--sidebar-hover-bg)'; e.currentTarget.style.color = 'var(--sidebar-text-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--sidebar-text)'; }}
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>

              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition"
                style={{ color: 'var(--sidebar-text)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.08)'; e.currentTarget.style.color = '#f87171'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--sidebar-text)'; }}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </>
        )}
      </aside>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            onClick={() => setShowLogoutModal(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative z-10 bg-gray-900 border border-gray-700/80 p-6 rounded-2xl w-[90%] max-w-sm shadow-2xl text-white">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600/15 border border-red-600/20 mx-auto mb-4">
              <LogOut className="h-5 w-5 text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-center mb-1">Sign out?</h2>
            <p className="text-gray-400 text-sm text-center mb-5">
              You'll need to sign back in to access your chats.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowLogoutModal(false); onLogout(); }}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-medium transition"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
