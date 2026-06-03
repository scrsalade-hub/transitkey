import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { localStore } from '../lib/localStore.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Report() {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState('complaints');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    setLoading(true);
    let allComplaints = [];

    // Try API first
    try {
      const token = getToken();
      if (token) {
        const res = await fetch(`${API_URL}/complaints`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) { const data = await res.json(); allComplaints = data.complaints || []; }
      }
    } catch { /* API unavailable */ }

    // Fallback / merge with localStore
    const localComplaints = localStore.getComplaints();
    // Merge: API complaints + local complaints that aren't already in API results
    const apiIds = new Set(allComplaints.map(c => c._id));
    const merged = [...allComplaints, ...localComplaints.filter(c => !apiIds.has(c._id))];

    setComplaints(merged);
    setLoading(false);
  };

  const handleStatusChange = (id, newStatus) => {
    localStore.updateComplaint(id, { status: newStatus });
    setComplaints(prev => prev.map(c => c._id === id ? { ...c, status: newStatus } : c));
  };

  const categoryLabels = { vehicle_issue: 'Vehicle Issue', route_issue: 'Route Issue', passenger_incident: 'Passenger Incident', driver_behavior: 'Driver Behavior', fare_dispute: 'Fare Dispute', other: 'Other' };
  const urgencyColors = { low: 'text-gray-600', medium: 'text-yellow-600', high: 'text-orange-600', critical: 'text-red-600' };
  const statusColors = { open: 'text-red-600', in_review: 'text-yellow-600', resolved: 'text-green-600', closed: 'text-gray-600' };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Reports & Analytics</h1>
      <div className="flex gap-2 md:gap-4 mb-4 md:mb-6 border-b border-gray-200 overflow-x-auto">
        {['complaints', 'revenue', 'drivers', 'fleet'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-xs md:text-sm font-medium whitespace-nowrap ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab === 'complaints' ? 'Complaints' : tab === 'revenue' ? 'Revenue' : tab === 'drivers' ? 'Driver Performance' : 'Fleet Status'}
          </button>
        ))}
      </div>

      {activeTab === 'complaints' && (
        <div className="bg-white border border-gray-300 p-4 md:p-6 overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-medium text-gray-500 uppercase">All Complaints</h2>
            <button onClick={loadComplaints} className="text-xs text-blue-600 hover:underline">Refresh</button>
          </div>
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-2">ID</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-2">Reporter</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-2">Category</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-2">Description</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-2">Urgency</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-2">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length > 0 ? complaints.map(c => (
                <tr key={c._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 text-sm">#{c._id?.toString().slice(-6)}</td>
                  <td className="py-3 px-2 text-sm">{c.reporterName || 'Unknown'}<br/><span className="text-xs text-gray-400">{c.reporterRole}</span></td>
                  <td className="py-3 px-2 text-sm">{categoryLabels[c.category] || c.category}</td>
                  <td className="py-3 px-2 text-sm text-gray-600 max-w-xs truncate">{c.description}</td>
                  <td className={`py-3 px-2 text-sm ${urgencyColors[c.urgency] || ''}`}>{c.urgency}</td>
                  <td className={`py-3 px-2 text-sm ${statusColors[c.status] || ''}`}>{c.status || 'open'}</td>
                  <td className="py-3 px-2">
                    <select
                      value={c.status || 'open'}
                      onChange={e => handleStatusChange(c._id, e.target.value)}
                      className="text-xs border border-gray-300 px-2 py-1 bg-white"
                    >
                      <option value="open">Open</option>
                      <option value="in_review">In Review</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="7" className="py-8 text-center text-gray-500 text-sm">{loading ? 'Loading complaints...' : 'No complaints received.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {activeTab === 'revenue' && (
        <div className="bg-white border border-gray-300 p-4 md:p-6"><h2 className="text-sm font-medium text-gray-500 uppercase mb-4">Revenue Analytics</h2><p className="text-gray-600 text-sm">Revenue analytics data will appear here when available.</p></div>
      )}
      {activeTab === 'drivers' && (
        <div className="bg-white border border-gray-300 p-4 md:p-6"><h2 className="text-sm font-medium text-gray-500 uppercase mb-4">Driver Performance</h2><p className="text-gray-600 text-sm">Driver performance metrics will appear here when available.</p></div>
      )}
      {activeTab === 'fleet' && (
        <div className="bg-white border border-gray-300 p-4 md:p-6"><h2 className="text-sm font-medium text-gray-500 uppercase mb-4">Fleet Status</h2><p className="text-gray-600 text-sm">Fleet status data will appear here when available.</p></div>
      )}
    </div>
  );
}
