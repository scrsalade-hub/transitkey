import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { localStore } from '../lib/localStore.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Report() {
  const { user, getToken } = useAuth();
  const [activeTab, setActiveTab] = useState('submit');
  const [form, setForm] = useState({ category: '', description: '', urgency: 'low' });
  const [message, setMessage] = useState('');
  const [myComplaints, setMyComplaints] = useState([]);
  const [busInfo, setBusInfo] = useState(null);

  const driverId = user?.user?.driverId || user?.driverId || '';
  const driverName = user?.user?.fullName || user?.fullName || '';

  // Load real data
  useEffect(() => {
    const complaints = localStore.getComplaints().filter(c => c.reporterId === driverId);
    setMyComplaints(complaints);
    // Get driver's bus info from the driver record
    const driver = localStore.getDriverById(user?.user?._id || user?.user?.driverId || user?._id);
    if (driver) setBusInfo(driver);
  }, [driverId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const complaintData = {
      ...form,
      reporterId: driverId,
      reporterName: driverName,
      reporterRole: 'driver',
      plateNumber: busInfo?.plateNumber || '',
    };
    // Save to localStore
    localStore.addComplaint(complaintData);
    setMessage('Complaint submitted successfully. The operator will see it.');
    setForm({ category: '', description: '', urgency: 'low' });
    // Refresh list
    setMyComplaints(localStore.getComplaints().filter(c => c.reporterId === driverId));
    // Try API
    try {
      const token = getToken();
      if (token) {
        await fetch(`${API_URL}/complaints`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(complaintData)
        });
      }
    } catch { /* silent */ }
  };

  const sidebarItems = [
    { id: 'bus', label: 'Bus Information', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
    { id: 'submit', label: 'Submit Complaint', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    { id: 'history', label: 'My Complaints', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
        <div className="w-full lg:w-48 flex-shrink-0">
          <div className="bg-white border border-gray-300 p-3 mb-2 flex items-center gap-3">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <div><p className="text-sm font-medium">{driverName || 'Driver'}</p><p className="text-xs text-gray-500">ID: {driverId || '--'}</p></div>
          </div>
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {sidebarItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm text-left transition-colors whitespace-nowrap flex-shrink-0 lg:flex-shrink ${activeTab === item.id ? 'bg-gray-100 border-l-0 lg:border-l-4 border-l-gray-800 font-medium' : 'hover:bg-gray-50'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {activeTab === 'submit' && (
            <>
              <h1 className="text-xl md:text-2xl font-semibold mb-1">Submit a Complaint</h1>
              <p className="text-sm text-gray-600 mb-4 md:mb-6">Report issues. Your complaint will be sent to the operator dashboard immediately.</p>
              {message && <div className="bg-green-50 text-green-700 text-sm p-3 mb-4 rounded">{message}</div>}
              <form onSubmit={handleSubmit} className="bg-white border border-gray-300 p-4 md:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Complaint Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} required className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600 bg-white">
                    <option value="">Select a category...</option>
                    <option value="vehicle_issue">Vehicle Issue</option>
                    <option value="route_issue">Route Issue</option>
                    <option value="passenger_incident">Passenger Incident</option>
                    <option value="driver_behavior">Driver Behavior</option>
                    <option value="fare_dispute">Fare Dispute</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Detailed Description</label>
                  <textarea rows="6" placeholder="Describe the incident in detail..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600 resize-y" />
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
                  <button type="submit" className="flex-1 bg-blue-600 text-white px-6 py-3 text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">Submit Complaint</button>
                  <button type="button" onClick={() => setForm({ category: '', description: '', urgency: 'low' })} className="flex-1 border border-gray-400 text-gray-700 px-6 py-2 text-sm bg-white hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
                </div>
              </form>
            </>
          )}
          {activeTab === 'bus' && (
            <div className="bg-white border border-gray-300 p-4 md:p-6">
              <h2 className="text-base md:text-lg font-semibold mb-4">Bus Information</h2>
              {busInfo ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Driver Name</span><span className="font-medium">{busInfo.fullName || '--'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Bus Plate Number</span><span className="font-medium">{busInfo.plateNumber || '--'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Bus Type</span><span className="font-medium">{busInfo.busType || '--'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">License Number</span><span className="font-medium">{busInfo.licenseNumber || '--'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">License Type</span><span className="font-medium">{busInfo.licenseType || '--'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Vehicle Class</span><span className="font-medium">{busInfo.vehicleClass || '--'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Years of Experience</span><span className="font-medium">{busInfo.yearsOfExperience || '--'}</span></div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No bus information available.</p>
              )}
            </div>
          )}
          {activeTab === 'history' && (
            <div className="bg-white border border-gray-300 p-4 md:p-6">
              <h2 className="text-base md:text-lg font-semibold mb-4">My Complaints</h2>
              {myComplaints.length === 0 ? (
                <p className="text-sm text-gray-500">No complaints submitted yet.</p>
              ) : (
                <div className="space-y-3">
                  {myComplaints.map(c => (
                    <div key={c._id} className="border border-gray-200 p-3">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium">{c.category}</span>
                        <span className={`text-xs px-2 py-0.5 ${c.status === 'open' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{c.status}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
