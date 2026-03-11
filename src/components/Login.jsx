import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/luminaAPI';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = ({ setShowRegister }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setStatusMsg('');
    setLoading(true);
    setStatusMsg('Signing in…');

    try {
      const res = await login({ email, password });
      const token = res.access_token || res.token;

      if (!token) {
        setError('Invalid email or password. Please try again.');
        setLoading(false);
        setStatusMsg('');
        return;
      }

      setStatusMsg('Signed in! Redirecting…');
      localStorage.setItem('token', token);
      if (res.user) localStorage.setItem('user', JSON.stringify(res.user));

      navigate('/', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setStatusMsg('');
    }

    setLoading(false);
  };

  return (
    <div
      className="main-page-bg min-h-screen relative flex items-center justify-center overflow-hidden"
      style={{ fontFamily: 'Montserrat, sans-serif' }}
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-violet-700/40 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-violet-500/40 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-violet-400/40 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <form
          onSubmit={handleLogin}
          className="flex flex-col p-5 sm:p-8 bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-800/80 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-600/30 mb-4 mx-auto">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-gray-400 text-sm">Sign in to continue to Lumina</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-300 p-3 rounded-xl mb-4 text-sm">
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700/60 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-violet-500/60 focus:bg-gray-900 transition"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 pr-11 bg-gray-900/80 border border-gray-700/60 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-violet-500/60 focus:bg-gray-900 transition"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-violet-600/20"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Signing in…
              </span>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Live status message */}
          {statusMsg && (
            <div className="mt-3 flex items-center gap-2 justify-center text-xs text-violet-300 bg-violet-600/10 border border-violet-600/20 rounded-xl px-3 py-2">
              <span className="w-3 h-3 border-2 border-violet-400/40 border-t-violet-400 rounded-full animate-spin flex-shrink-0"></span>
              {statusMsg}
            </div>
          )}

          <div className="text-center text-gray-500 mt-5 text-sm">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => setShowRegister(true)}
              className="text-violet-400 hover:text-violet-300 font-medium transition"
            >
              Create account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
