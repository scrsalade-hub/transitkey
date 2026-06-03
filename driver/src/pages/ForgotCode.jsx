import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotCode() {
  const [idOrPhone, setIdOrPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('A new operator code has been requested. Please contact your dispatch office.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md mx-auto bg-white border border-gray-300 p-4 md:p-8 text-center">
          <div className="mb-4">
            <svg className="w-10 h-10 md:w-12 md:h-12 mx-auto text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-lg md:text-xl font-semibold mb-2">Forgot Operator Code?</h2>
          <p className="text-sm text-gray-600 mb-6">Operator codes are unique security identifiers managed by your dispatch office. Please provide your details below to request a reset or recovery of your credentials.</p>
          {message && <div className="bg-blue-50 text-blue-700 text-sm p-3 mb-4 rounded">{message}</div>}
          <form onSubmit={handleSubmit} className="text-left">
            <label className="block text-sm font-medium text-gray-900 mb-1">Driver's ID or Registered Phone Number</label>
            <input type="text" placeholder="e.g. 88294 or +23456765434" value={idOrPhone} onChange={e => setIdOrPhone(e.target.value)} required className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600 mb-4" />
            <button type="submit" className="w-full bg-blue-600 text-white px-6 py-3 text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">REQUEST NEW CODE &rarr;</button>
          </form>
          <Link to="/login" className="block text-blue-600 text-sm mt-4 hover:underline">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
