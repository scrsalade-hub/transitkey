import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/driver/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      login(data); navigate('/dashboard');
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md mx-auto bg-white border border-gray-300 p-4 md:p-8">
          <h2 className="text-lg md:text-xl font-semibold mb-1">Driver Portal</h2>
          <p className="text-sm text-gray-600 mb-6">Log in to manage your routes and fleet assignments.</p>
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 mb-4 rounded">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Email or Phone Number</label>
              <input type="text" placeholder="e.g. name@gmail.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Password</label>
              <input type="password" placeholder="********" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600" />
            </div>
            <Link to="/forgot-code" className="block text-sm text-blue-600 hover:underline">Forgot password?</Link>
            <button type="submit" className="w-full bg-blue-600 text-white px-6 py-3 text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">LOGIN</button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
            <div className="relative flex justify-center text-sm"><span className="bg-white px-4 text-gray-500 uppercase tracking-wider text-xs">Fleet Support</span></div>
          </div>

          <div className="space-y-3">
            <div className="bg-white border border-gray-300 p-3 flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              <div><p className="text-sm font-medium">Dispatch Hot-line</p><p className="text-xs text-gray-500">1-800-TSK-HELP</p></div>
            </div>
            <div className="bg-white border border-gray-300 p-3 flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <div><p className="text-sm font-medium">Emergency Chat</p><p className="text-xs text-gray-500">Active 24/7 for En-route Drivers</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
