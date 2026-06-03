import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Register() {
  const [form, setForm] = useState({ fullName: '', phoneNumber: '', email: '', password: '', confirmPassword: '', agree: false });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (!form.agree) { setError('Please agree to the Terms of Service'); return; }
    try {
      const res = await fetch(`${API_URL}/auth/passenger/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: form.fullName, phoneNumber: form.phoneNumber, email: form.email, password: form.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
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
          <h2 className="text-lg md:text-xl font-semibold mb-1">Create Account</h2>
          <p className="text-sm text-gray-600 mb-6">Join the Transitkey network for efficient logistics management.</p>
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 mb-4 rounded">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Full Name</label>
              <input type="text" name="fullName" placeholder="Isaiah Adebayo" value={form.fullName} onChange={handleChange} required className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Phone Number</label>
              <input type="tel" name="phoneNumber" placeholder="+234 08095674832" value={form.phoneNumber} onChange={handleChange} required className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Email Address</label>
              <input type="email" name="email" placeholder="name@gmail.com" value={form.email} onChange={handleChange} required className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Password</label>
                <input type="password" name="password" placeholder="********" value={form.password} onChange={handleChange} required className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Confirm Password</label>
                <input type="password" name="confirmPassword" placeholder="********" value={form.confirmPassword} onChange={handleChange} required className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" />
              </div>
            </div>
            <div className="flex items-start gap-2">
              <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} className="w-4 h-4 mt-0.5 border border-gray-300 rounded" />
              <span className="text-sm text-gray-700">I agree to the <a href="#" className="underline text-blue-600">Terms of Service</a> and <a href="#" className="underline text-blue-600">Privacy Policy</a>.</span>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white px-6 py-3 text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">CREATE ACCOUNT</button>
          </form>
          <p className="text-center text-sm text-gray-600 mt-4">Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Log In</Link></p>
        </div>
      </div>
    </div>
  );
}
