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
      const res = await fetch(`${API_URL}/auth/passenger/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      login(data);
      navigate('/');
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gray-900 text-white px-4 md:px-8 py-8 md:py-10">
        <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-wide">PASSENGER DASHBOARD</h1>
      </div>
      <div className="flex-1 bg-white px-4 py-6 md:py-12">
        <div className="w-full max-w-lg mx-auto bg-white border border-gray-300 p-4 md:p-8">
          <h2 className="text-lg md:text-xl font-semibold mb-1">Passenger Login</h2>
          <p className="text-sm text-gray-600 mb-6">Access your Transitkey passenger account.</p>
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 mb-4 rounded">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Email Address</label>
              <input type="email" placeholder="name@gmail.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Password</label>
              <input type="password" placeholder="********" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" />
            </div>
            <Link to="#" className="block text-sm text-blue-600 hover:underline">Forgot Password?</Link>
            <button type="submit" className="w-full bg-blue-600 text-white px-6 py-3 text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">SIGN IN</button>
          </form>
          <p className="text-center text-sm text-gray-600 mt-4">Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Sign Up</Link></p>
        </div>
      </div>
    </div>
  );
}
