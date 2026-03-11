import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../api/luminaAPI';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = ({ setShowRegister }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setStatusMsg('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setStatusMsg('Creating your account…');

    try {
      const res = await signup({ email, phone: phone || undefined, password });

      const token = res.access_token || res.token;
      if (!token) {
        setError('Registration failed. Please try again.');
        setLoading(false);
        setStatusMsg('');
        return;
      }

      setStatusMsg('Account created! Redirecting…');
      localStorage.setItem('token', token);
      if (res.user) localStorage.setItem('user', JSON.stringify(res.user));

      navigate('/', { replace: true });
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Something went wrong. Try again.');
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
        <div className="absolute top-0 left-0 w-96 h-96 bg-violet-900/50 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-violet-700/50 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-violet-800/50 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <form
          onSubmit={handleRegister}
          className="flex flex-col p-8 bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-800/80 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-600/30 mb-4 mx-auto">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">Create account</h1>
            <p className="text-gray-400 text-sm">Join Lumina and start chatting</p>
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
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700/60 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-violet-500/60 focus:bg-gray-900 transition"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Phone <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                placeholder="+234 801 234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700/60 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-violet-500/60 focus:bg-gray-900 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 bg-gray-900/80 border border-gray-700/60 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-violet-500/60 focus:bg-gray-900 transition"
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
              <p className="text-xs text-gray-500 mt-1.5">Minimum 8 characters</p>
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
                Creating account…
              </span>
            ) : (
              'Create Account'
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
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setShowRegister(false)}
              className="text-violet-400 hover:text-violet-300 font-medium transition"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
