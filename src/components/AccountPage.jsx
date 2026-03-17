import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, HelpCircle, LogOut, ExternalLink, User, Shield } from 'lucide-react';
import { useState } from 'react';
import SettingsModal from './SettingsModal';

const AccountPage = () => {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const getUserEmail = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.email || '';
    } catch { return ''; }
  };

  const getUserInitial = () => {
    const email = getUserEmail();
    return email ? email[0].toUpperCase() : 'U';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userAuth');
    localStorage.removeItem('user');
    navigate('/auth', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#05040a', fontFamily: 'Montserrat, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-800/60">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-gray-800/60 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-white font-semibold text-lg">My Account</h1>
      </div>

      {/* Avatar + email section */}
      <div className="flex flex-col items-center py-8 px-6 border-b border-gray-800/60">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white font-bold text-3xl shadow-xl mb-4">
          {getUserInitial()}
        </div>
        <p className="text-white font-semibold text-base truncate max-w-xs">{getUserEmail()}</p>
        <span className="mt-1.5 text-xs font-medium text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full">
          Free Plan
        </span>
      </div>

      {/* Menu items */}
      <div className="flex flex-col px-4 py-4 gap-1">
        <p className="text-xs text-gray-500 uppercase tracking-wider px-3 mb-2">Account</p>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-gray-300 hover:bg-gray-800/60 hover:text-white transition text-sm font-medium"
        >
          <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
            <Settings size={15} className="text-gray-400" />
          </div>
          Settings
        </button>

        <button className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-gray-300 hover:bg-gray-800/60 hover:text-white transition text-sm font-medium">
          <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
            <User size={15} className="text-gray-400" />
          </div>
          Profile
        </button>

        <button className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-gray-300 hover:bg-gray-800/60 hover:text-white transition text-sm font-medium">
          <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
            <Shield size={15} className="text-gray-400" />
          </div>
          Privacy & Security
        </button>

        <a
          href="https://github.com/Tosino2580/Nupat-Ai-Clone"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-gray-300 hover:bg-gray-800/60 hover:text-white transition text-sm font-medium"
        >
          <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
            <HelpCircle size={15} className="text-gray-400" />
          </div>
          Help & FAQ
          <ExternalLink size={12} className="text-gray-600 ml-auto" />
        </a>
      </div>

      {/* Logout */}
      <div className="px-4 mt-auto pb-8">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition text-sm font-semibold"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onLogout={handleLogout}
        chatCount={0}
      />
    </div>
  );
};

export default AccountPage;
