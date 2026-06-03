import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Onboarding() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/driver/verify-code`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatorCode: code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid code');
      login(data); navigate('/dashboard');
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gray-900 text-white px-4 md:px-8 py-8 md:py-10">
        <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-wide">DRIVERS DASHBOARD</h1>
      </div>
      <div className="flex-1 bg-white px-4 py-8 md:py-12 flex flex-col items-center">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          <span className="uppercase tracking-wider font-medium text-xs">Official Access Only</span>
        </div>
        <h2 className="text-lg md:text-xl font-semibold mb-2">Driver Onboarding</h2>
        <p className="text-sm text-gray-600 mb-6 max-w-md text-center px-4">Access the Transitkey Driver Platform. Please enter the unique 6-digit Operator Code provided by your fleet dispatcher to securely link your profile.</p>

        <div className="w-full max-w-md mx-auto bg-white border border-gray-300 p-4 md:p-8">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 mb-4 rounded">{error}</div>}
          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-gray-900 mb-1">Operator Code</label>
            <input type="text" placeholder="Enter 6-digit code" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} required className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600 mb-3" />
            <p className="text-sm text-gray-600 mb-4">Authorized transport personnel use only.</p>
            <button type="submit" className="w-full bg-blue-600 text-white px-6 py-3 text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">Verify Code &rarr;</button>
          </form>
        </div>

        <div className="mt-6 text-sm text-center px-4">
          <Link to="/forgot-code" className="text-blue-600 hover:underline">Forgot your code?</Link>
          <p className="text-gray-600 mt-2">Don't have a code? <a href="#" className="text-blue-600 hover:underline">Contact your dispatcher</a></p>
        </div>
      </div>
    </div>
  );
}
