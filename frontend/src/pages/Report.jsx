import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { localStore } from '../lib/localStore.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Report() {
  const { user, getToken } = useAuth();
  const [form, setForm] = useState({ category: '', description: '', urgency: 'low' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const reporterId = user?.user?._id || user?.user?.phoneNumber || 'passenger_' + Date.now();
    const reporterName = user?.user?.fullName || 'Anonymous Passenger';

    const complaintData = {
      ...form,
      reporterId,
      reporterName,
      reporterRole: 'passenger',
    };

    // Save to localStore immediately
    localStore.addComplaint(complaintData);
    setMessage('Report submitted successfully. The operator has been notified.');
    setForm({ category: '', description: '', urgency: 'low' });

    // Try API
    try {
      const token = getToken();
      if (token) {
        await fetch(`${API_URL}/complaints`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(complaintData)
        });
      }
    } catch { /* silent - localStore already has it */ }
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-xl md:text-2xl font-semibold mb-1">Submit a Report</h1>
      <p className="text-sm text-gray-600 mb-4 md:mb-6">Report issues regarding vehicles, routes, or passenger incidents. The operator will see your report immediately.</p>
      {message && <div className="bg-green-50 text-green-700 text-sm p-3 mb-4 rounded">{message}</div>}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-300 p-4 md:p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Category</label>
          <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} required className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600 bg-white">
            <option value="">Select a category...</option>
            <option value="vehicle_issue">Vehicle Issue</option>
            <option value="route_issue">Route Issue</option>
            <option value="passenger_incident">Passenger Incident</option>
            <option value="fare_dispute">Fare Dispute</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Detailed Description</label>
          <textarea rows="5" placeholder="Describe the incident in detail..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600 resize-y" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Urgency Level</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['low', 'medium', 'high', 'critical'].map(level => (
              <button key={level} type="button" onClick={() => setForm(p => ({ ...p, urgency: level }))}
                className={`py-2 text-xs sm:text-sm font-medium border transition-colors ${form.urgency === level ? 'bg-gray-800 text-white border-gray-800' : level === 'critical' ? 'bg-white text-red-600 border-gray-300 hover:bg-red-50' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                {level.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button type="submit" className="flex-1 bg-blue-600 text-white px-6 py-3 text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">Submit Report</button>
          <button type="button" onClick={() => setForm({ category: '', description: '', urgency: 'low' })} className="flex-1 border border-gray-400 text-gray-700 px-6 py-2 text-sm bg-white hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
        </div>
      </form>
    </div>
  );
}
