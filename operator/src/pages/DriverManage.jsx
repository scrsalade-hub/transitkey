import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api.js';

export default function DriverManage() {
  const [drivers, setDrivers] = useState([]);
  const [filter, setFilter] = useState({ search: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDrivers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getDrivers();
      setDrivers(data.drivers || []);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadDrivers(); }, [loadDrivers]);

  const statusBadge = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 px-2 py-0.5 text-xs font-medium rounded';
      case 'inactive': return 'bg-gray-100 text-gray-600 px-2 py-0.5 text-xs font-medium rounded';
      case 'suspended': return 'bg-red-100 text-red-700 px-2 py-0.5 text-xs font-medium rounded';
      case 'probation': return 'bg-orange-100 text-orange-700 px-2 py-0.5 text-xs font-medium rounded';
      default: return 'bg-gray-100 text-gray-600 px-2 py-0.5 text-xs font-medium rounded';
    }
  };

  const filteredDrivers = drivers.filter(d => {
    const q = filter.search.toLowerCase();
    const matchesSearch = !q ||
      d.fullName?.toLowerCase().includes(q) ||
      d.driverId?.toLowerCase().includes(q) ||
      d.plateNumber?.toLowerCase().includes(q) ||
      d.accessToken?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q);
    const matchesStatus = !filter.status || d.status === filter.status;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">All Drivers</h1>
          <p className="text-sm text-gray-600">Complete driver profiles with access tokens and vehicle details.</p>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm p-3 mb-4 rounded">{error}</div>}

      {/* Filters */}
      <div className="bg-white border border-gray-300 p-4 md:p-6 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className="block text-xs font-medium text-gray-500 uppercase mb-1">Search</label><input type="text" className="border border-gray-300 px-4 py-2 w-full text-sm outline-none focus:border-blue-600" placeholder="Name, ID, plate, token..." value={filter.search} onChange={e => setFilter(p => ({ ...p, search: e.target.value }))} /></div>
          <div><label className="block text-xs font-medium text-gray-500 uppercase mb-1">Status</label><select className="border border-gray-300 px-4 py-2 w-full text-sm outline-none focus:border-blue-600 bg-white" value={filter.status} onChange={e => setFilter(p => ({ ...p, status: e.target.value }))}><option value="">All</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option><option value="probation">Probation</option></select></div>
          <div className="flex items-end gap-2">
            <button onClick={() => setFilter({ search: '', status: '' })} className="border border-gray-400 text-gray-700 px-4 py-2 text-xs bg-white hover:bg-gray-50 w-full">Clear</button>
            <button onClick={loadDrivers} className="bg-blue-600 text-white px-4 py-2 text-xs hover:bg-blue-700 w-full">Refresh</button>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3">{filteredDrivers.length} driver{filteredDrivers.length !== 1 ? 's' : ''} found</p>

      {filteredDrivers.length === 0 ? (
        <div className="bg-white border border-gray-300 p-8 text-center">
          <p className="text-gray-500 text-sm">{loading ? 'Loading drivers...' : 'No drivers found. Add drivers from the Add Driver page.'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDrivers.map(driver => (
            <div key={driver._id} className="bg-white border border-gray-300 p-4 md:p-6">
              {/* Header */}
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
                  <span className="text-xs text-gray-500">{driver.standing || '--'}</span>
                </div>
              </div>

              {/* Full Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                <div><span className="text-xs text-gray-500 uppercase block">Access Token</span>
                  <span className="font-mono text-xs bg-yellow-50 border border-yellow-200 px-2 py-1 inline-block mt-0.5 text-gray-800">{driver.accessToken || 'N/A'}</span>
                </div>
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
