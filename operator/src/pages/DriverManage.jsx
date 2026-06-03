import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { localStore } from '../lib/localStore.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function DriverManage() {
  const { getToken } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [filter, setFilter] = useState({ search: '', status: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDrivers(); }, []);

  const loadDrivers = async () => {
    setLoading(true);
    let allDrivers = [];

    // Try API first
    try {
      const token = getToken();
      if (token) {
        const res = await fetch(`${API_URL}/drivers`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) { const data = await res.json(); allDrivers = data.drivers || []; }
      }
    } catch { /* API unavailable */ }

    // Merge with localStore drivers (show all drivers created via Add Driver page)
    const localDrivers = localStore.getDrivers();
    const apiIds = new Set(allDrivers.map(d => d._id));
    const merged = [...allDrivers, ...localDrivers.filter(d => !apiIds.has(d._id))];

    setDrivers(merged);
    setLoading(false);
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 px-2 py-0.5 text-xs font-medium rounded';
      case 'inactive': return 'bg-gray-100 text-gray-600 px-2 py-0.5 text-xs font-medium rounded';
      case 'suspended': return 'bg-red-100 text-red-700 px-2 py-0.5 text-xs font-medium rounded';
      case 'probation': return 'bg-orange-100 text-orange-700 px-2 py-0.5 text-xs font-medium rounded';
      default: return 'bg-gray-100 text-gray-600 px-2 py-0.5 text-xs font-medium rounded';
    }
  };

  const standingBadge = (standing) => {
    switch (standing) {
      case 'good standing': return 'text-green-600 text-xs';
      case 'probation': return 'text-orange-600 text-xs';
      case 'suspension': return 'text-red-600 text-xs';
      default: return 'text-gray-500 text-xs';
    }
  };

  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = !filter.search ||
      d.fullName?.toLowerCase().includes(filter.search.toLowerCase()) ||
      d.driverId?.toLowerCase().includes(filter.search.toLowerCase()) ||
      d.plateNumber?.toLowerCase().includes(filter.search.toLowerCase()) ||
      d.accessToken?.toLowerCase().includes(filter.search.toLowerCase());
    const matchesStatus = !filter.status || d.status === filter.status;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Driver Management</h1>
          <p className="text-sm text-gray-600">All drivers and their complete information.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-300 p-4 md:p-6 mb-4 md:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className="block text-xs font-medium text-gray-500 uppercase mb-1">Search</label><input type="text" className="border border-gray-300 px-4 py-2 w-full text-sm outline-none focus:border-blue-600" placeholder="Name, ID, plate, token..." value={filter.search} onChange={e => setFilter(p => ({ ...p, search: e.target.value }))} /></div>
          <div><label className="block text-xs font-medium text-gray-500 uppercase mb-1">Status</label><select className="border border-gray-300 px-4 py-2 w-full text-sm outline-none focus:border-blue-600 bg-white" value={filter.status} onChange={e => setFilter(p => ({ ...p, status: e.target.value }))}><option value="">All</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option><option value="probation">Probation</option></select></div>
          <div className="flex items-end gap-2">
            <button onClick={() => setFilter({ search: '', status: '' })} className="border border-gray-400 text-gray-700 px-4 py-2 text-xs bg-white hover:bg-gray-50 w-full">Clear</button>
            <button onClick={loadDrivers} className="bg-blue-600 text-white px-4 py-2 text-xs hover:bg-blue-700 w-full">Refresh</button>
          </div>
        </div>
      </div>

      {/* Driver count */}
      <p className="text-sm text-gray-600 mb-3">{filteredDrivers.length} driver{filteredDrivers.length !== 1 ? 's' : ''} found</p>

      {/* Driver cards */}
      {filteredDrivers.length === 0 ? (
        <div className="bg-white border border-gray-300 p-8 text-center">
          <p className="text-gray-500 text-sm">{loading ? 'Loading drivers...' : 'No drivers found. Add drivers from the Add Driver page.'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDrivers.map(driver => (
            <div key={driver._id} className="bg-white border border-gray-300 p-4 md:p-6">
              {/* Header row */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {driver.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'D'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">{driver.fullName}</h3>
                    <p className="text-xs text-gray-500">{driver.driverId || '--'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={statusBadge(driver.status)}>{driver.status || 'unknown'}</span>
                  <span className={standingBadge(driver.standing)}>{driver.standing || '--'}</span>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                <div><span className="text-xs text-gray-500 uppercase block">Access Token</span><span className="font-mono text-xs bg-gray-100 px-2 py-1 inline-block mt-0.5">{driver.accessToken || 'N/A'}</span></div>
                <div><span className="text-xs text-gray-500 uppercase block">Phone</span><span className="font-medium">{driver.phoneNumber || '--'}</span></div>
                <div><span className="text-xs text-gray-500 uppercase block">Email</span><span className="font-medium">{driver.email || '--'}</span></div>
                <div><span className="text-xs text-gray-500 uppercase block">Plate Number</span><span className="font-medium">{driver.plateNumber || '--'}</span></div>
                <div><span className="text-xs text-gray-500 uppercase block">Bus Type</span><span className="font-medium">{driver.busType || '--'}</span></div>
                <div><span className="text-xs text-gray-500 uppercase block">License Number</span><span className="font-medium">{driver.licenseNumber || '--'}</span></div>
                <div><span className="text-xs text-gray-500 uppercase block">License Type</span><span className="font-medium">{driver.licenseType || '--'}</span></div>
                <div><span className="text-xs text-gray-500 uppercase block">Vehicle Class</span><span className="font-medium">{driver.vehicleClass || '--'}</span></div>
                <div><span className="text-xs text-gray-500 uppercase block">Experience</span><span className="font-medium">{driver.yearsOfExperience ? `${driver.yearsOfExperience} years` : '--'}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
