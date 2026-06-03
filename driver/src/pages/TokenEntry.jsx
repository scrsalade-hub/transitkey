import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { localStore } from '../lib/localStore.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function TokenEntry() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const inputToken = token.trim();

    // Try API first
    try {
      const res = await fetch(`${API_URL}/drivers/verify-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: inputToken })
      });
      const data = await res.json();
      if (res.ok) {
        login({ token: data.token, user: { ...data.user, role: 'driver' } });
        navigate('/dashboard');
        return;
      }
    } catch {
      // API unavailable, fall back to localStorage
    }

    // Fallback: check localStorage
    
    const driver = localStore.getDriverByToken(inputToken);
    if (driver) {
      // Generate a mock JWT-like token
      const mockToken = 'local_' + Date.now();
      login({ token: mockToken, user: { ...driver, role: 'driver' } });
      navigate('/dashboard');
      return;
    }

    setError('Invalid access token. Please check with your operator.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      {/* Hero */}
      <div className="bg-gray-900 text-white px-4 md:px-8 py-8 md:py-12 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-wide">Driver Portal</h1>
        <p className="text-gray-400 text-sm mt-2">Access your assignments, tasks, and trip details</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-md">
          {/* Official badge */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            <span className="uppercase tracking-wider font-medium text-xs">Official Access Only</span>
          </div>

          <div className="bg-white border border-gray-300 p-4 md:p-8">
            <h2 className="text-lg md:text-xl font-semibold mb-1 text-center">Enter Your Access Token</h2>
            <p className="text-sm text-gray-600 mb-6 text-center">Input the unique access token provided by your operator to view your assignments and tasks.</p>

            {error && <div className="bg-red-50 text-red-600 text-sm p-3 mb-4 rounded">{error}</div>}

            <form onSubmit={handleSubmit}>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Access Token</label>
              <input
                type="text"
                placeholder="e.g. TKD-aB3x9KpLm2Qr"
                value={token}
                onChange={e => setToken(e.target.value)}
                required
                className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600 mb-4"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white px-6 py-3 text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Access My Dashboard \u2192'}
              </button>
            </form>
          </div>

          <div className="mt-6 text-sm text-center">
            <p className="text-gray-600">
              Don&apos;t have a token?{' '}
              <span className="text-gray-500">Contact your operator to get registered.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
