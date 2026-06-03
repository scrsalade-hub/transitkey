import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api.js';

export default function Home() {
  const [stats, setStats] = useState({ ongoing: 0, scheduled: 0, completed: 0, totalDrivers: 0, totalRoutes: 0, openComplaints: 0 });
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [tripsData, driversData, routesData, complaintsData] = await Promise.all([
        api.getTrips().catch(() => ({ trips: [] })),
        api.getDrivers().catch(() => ({ drivers: [] })),
        api.getRoutes().catch(() => []),
        api.getComplaints().catch(() => ({ complaints: [] })),
      ]);
      const allTrips = tripsData.trips || [];
      setTrips(allTrips);
      setStats({
        ongoing: allTrips.filter(t => t.status === 'in_progress').length,
        scheduled: allTrips.filter(t => t.status === 'scheduled').length,
        completed: allTrips.filter(t => t.status === 'completed').length,
        totalDrivers: (driversData.drivers || []).length,
        totalRoutes: (Array.isArray(routesData) ? routesData : []).length,
        openComplaints: (complaintsData.complaints || []).filter(c => c.status === 'open').length,
      });
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const statusBadge = (status) => {
    switch (status) {
      case 'in_progress': return 'bg-green-100 text-green-700 border border-green-300 px-2 py-0.5 text-xs';
      case 'scheduled': return 'bg-blue-100 text-blue-700 border border-blue-300 px-2 py-0.5 text-xs';
      case 'completed': return 'bg-gray-100 text-gray-600 border border-gray-300 px-2 py-0.5 text-xs';
      default: return 'bg-gray-100 text-gray-600 border border-gray-300 px-2 py-0.5 text-xs';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Operations Dashboard</h1>
      {error && <div className="bg-red-50 text-red-600 text-sm p-3 mb-4 rounded">{error}</div>}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="bg-white border border-gray-300 p-4"><p className="text-xs text-gray-500 uppercase">Ongoing</p><p className="text-xl font-bold text-green-600 mt-1">{stats.ongoing}</p></div>
        <div className="bg-white border border-gray-300 p-4"><p className="text-xs text-gray-500 uppercase">Scheduled</p><p className="text-xl font-bold text-blue-600 mt-1">{stats.scheduled}</p></div>
        <div className="bg-white border border-gray-300 p-4"><p className="text-xs text-gray-500 uppercase">Completed</p><p className="text-xl font-bold text-gray-600 mt-1">{stats.completed}</p></div>
        <div className="bg-white border border-gray-300 p-4"><p className="text-xs text-gray-500 uppercase">Drivers</p><p className="text-xl font-bold mt-1">{stats.totalDrivers}</p></div>
        <div className="bg-white border border-gray-300 p-4"><p className="text-xs text-gray-500 uppercase">Routes</p><p className="text-xl font-bold mt-1">{stats.totalRoutes}</p></div>
        <div className="bg-white border border-gray-300 p-4"><p className="text-xs text-gray-500 uppercase">Open Issues</p><p className="text-xl font-bold text-red-600 mt-1">{stats.openComplaints}</p></div>
      </div>

      {/* All Trips Table */}
      <div className="bg-white border border-gray-300 p-4 md:p-6 mb-4 overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-medium text-gray-500 uppercase">All Trips</h2>
          <button onClick={fetchData} className="text-xs text-blue-600 hover:underline">Refresh</button>
        </div>
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Trip ID</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Route</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Driver</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Bus</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Seats</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Status</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Delay</th>
            </tr>
          </thead>
          <tbody>
            {trips.length > 0 ? trips.map(t => (
              <tr key={t._id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-2 text-sm font-mono">{t.tripId || t._id?.slice(-6)}</td>
                <td className="py-3 px-2 text-sm">{t.route?.name || '--'}</td>
                <td className="py-3 px-2 text-sm">{t.driver?.fullName || '--'}</td>
                <td className="py-3 px-2 text-sm">{t.bus?.plateNumber || '--'}</td>
                <td className="py-3 px-2 text-sm">{t.availableSeats ?? '--'}</td>
                <td className="py-3 px-2"><span className={statusBadge(t.status)}>{t.status}</span></td>
                <td className="py-3 px-2 text-sm">{t.delayMinutes > 0 ? <span className="text-red-600">+{t.delayMinutes}m</span> : '--'}</td>
              </tr>
            )) : (
              <tr><td colSpan="7" className="py-8 text-center text-gray-500 text-sm">{loading ? 'Loading trips...' : 'No trips found.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-300 p-4 md:p-6">
          <h2 className="text-sm font-medium text-gray-500 uppercase mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link to="/add-driver" className="bg-blue-600 text-white px-4 py-3 text-sm font-medium hover:bg-blue-700 transition-colors text-center">Add New Driver</Link>
            <Link to="/routes" className="border border-gray-400 text-gray-700 px-4 py-3 text-sm bg-white hover:bg-gray-50 transition-colors text-center">Create Route</Link>
            <Link to="/drivers" className="border border-gray-400 text-gray-700 px-4 py-3 text-sm bg-white hover:bg-gray-50 transition-colors text-center">View All Drivers</Link>
            <Link to="/report" className="border border-gray-400 text-gray-700 px-4 py-3 text-sm bg-white hover:bg-gray-50 transition-colors text-center">View Complaints</Link>
          </div>
        </div>
        <div className="bg-white border border-gray-300 p-4 md:p-6">
          <h2 className="text-sm font-medium text-gray-500 uppercase mb-4">System Status</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Backend API</span><span className="text-blue-600 font-medium">Connected</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Database</span><span className="text-blue-600 font-medium">MongoDB</span></div>
            <div className="flex justify-between"><span className="text-gray-500">API URL</span><span className="text-gray-600 font-mono text-xs">transitkeybackend.vercel.app</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
