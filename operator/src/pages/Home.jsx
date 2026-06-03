import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { localStore } from '../lib/localStore.js';

export default function Home() {
  const [stats, setStats] = useState({ activeTrips: 0, totalRoutes: 0, totalDrivers: 0, pendingIssues: 0 });
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allTrips = localStore.getTrips();
    const allRoutes = localStore.getRoutes();
    const allDrivers = localStore.getDrivers();
    const allComplaints = localStore.getComplaints();
    setTrips(allTrips.filter(t => t.status === 'in_progress'));
    setStats({
      activeTrips: allTrips.filter(t => t.status === 'in_progress').length,
      totalRoutes: allRoutes.length,
      totalDrivers: allDrivers.length,
      pendingIssues: allComplaints.filter(c => c.status === 'open').length,
    });
    setLoading(false);
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Operations Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-4 md:mb-6">
        <div className="bg-white border border-gray-300 p-4 md:p-6">
          <p className="text-xs font-medium text-gray-500 uppercase">Active Trips</p>
          <p className="text-xl md:text-2xl font-bold mt-1">{stats.activeTrips}</p>
        </div>
        <div className="bg-white border border-gray-300 p-4 md:p-6">
          <p className="text-xs font-medium text-gray-500 uppercase">Total Routes</p>
          <p className="text-xl md:text-2xl font-bold mt-1">{stats.totalRoutes}</p>
        </div>
        <div className="bg-white border border-gray-300 p-4 md:p-6">
          <p className="text-xs font-medium text-gray-500 uppercase">Total Drivers</p>
          <p className="text-xl md:text-2xl font-bold mt-1">{stats.totalDrivers}</p>
        </div>
        <div className="bg-white border border-gray-300 p-4 md:p-6">
          <p className="text-xs font-medium text-gray-500 uppercase">Open Complaints</p>
          <p className="text-xl md:text-2xl font-bold mt-1">{stats.pendingIssues}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-300 p-4 md:p-6 mb-4 md:mb-6 overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-medium text-gray-500 uppercase">Active Trips</h2>
          <Link to="/map" className="text-xs text-blue-600 hover:underline">View Map</Link>
        </div>
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Trip ID</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Route</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Driver</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Bus</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {trips.length > 0 ? trips.map(t => (
              <tr key={t._id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-2 text-sm font-mono">{t.tripId || t._id?.slice(-6)}</td>
                <td className="py-3 px-2 text-sm">{t.route?.name || '--'}</td>
                <td className="py-3 px-2 text-sm">{t.driver?.fullName || '--'}</td>
                <td className="py-3 px-2 text-sm">{t.bus?.plateNumber || t.driver?.plateNumber || '--'}</td>
                <td className="py-3 px-2"><span className="border border-green-500 text-green-700 px-2 py-0.5 text-xs">{t.status}</span></td>
              </tr>
            )) : (
              <tr><td colSpan="5" className="py-8 text-center text-gray-500 text-sm">No active trips.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
            <div className="flex justify-between"><span className="text-gray-500">API Server</span><span className="text-gray-600">Offline (localStorage mode)</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Local Database</span><span className="text-green-600 font-medium">Active</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Data Storage</span><span className="text-green-600 font-medium">Connected</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
