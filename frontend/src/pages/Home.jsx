import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Home() {
  const { user, getToken } = useAuth();
  const [routes, setRoutes] = useState([]);
  const [stats, setStats] = useState({ activeTrips: 0, totalRoutes: 0, serviceAlerts: 0 });

  useEffect(() => { fetchRoutes(); fetchStats(); }, []);

  const fetchRoutes = async () => {
    try {
      const res = await fetch(`${API_URL}/routes?status=active`);
      if (res.ok) { const data = await res.json(); setRoutes(data.slice(0, 5)); setStats(p => ({ ...p, totalRoutes: data.length })); }
    } catch (e) { console.error(e); }
  };

  const fetchStats = async () => {
    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [tripsRes, notifRes] = await Promise.all([
        fetch(`${API_URL}/trips?status=in_progress`, { headers }),
        fetch(`${API_URL}/notifications?type=system_alert`, { headers })
      ]);
      if (tripsRes.ok) { const d = await tripsRes.json(); setStats(p => ({ ...p, activeTrips: d.total || 0 })); }
      if (notifRes.ok) { const d = await notifRes.json(); setStats(p => ({ ...p, serviceAlerts: d.length || 0 })); }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Welcome{user ? `, ${user.user?.fullName || 'Passenger'}` : ''}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white border border-gray-300 p-4 md:p-6">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Trips</span>
          <p className="text-2xl md:text-3xl font-bold mt-2">{stats.activeTrips}</p>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Currently in transit</p>
        </div>
        <div className="bg-white border border-gray-300 p-4 md:p-6">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Routes</span>
          <p className="text-2xl md:text-3xl font-bold mt-2">{stats.totalRoutes}</p>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Available for booking</p>
        </div>
        <div className="bg-white border border-gray-300 p-4 md:p-6">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Service Alerts</span>
          <p className="text-2xl md:text-3xl font-bold mt-2 text-red-600">{stats.serviceAlerts}</p>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Active notifications</p>
        </div>
      </div>

      <div className="bg-white border border-gray-300 p-4 md:p-6">
        <h2 className="text-base md:text-lg font-semibold mb-4">Available Routes</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">Route Name</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">From</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">To</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">Fare</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {routes.map(route => (
                <tr key={route._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 text-sm font-medium">{route.name}</td>
                  <td className="py-3 text-sm text-gray-600">{route.startTerminal}</td>
                  <td className="py-3 text-sm text-gray-600">{route.endTerminal}</td>
                  <td className="py-3 text-sm">#{route.fare?.toLocaleString() || 0}</td>
                  <td className="py-3"><span className="border border-gray-400 text-gray-700 px-3 py-1 text-xs uppercase">{route.status}</span></td>
                  <td className="py-3"><Link to={`/routes/${route._id}`} className="text-blue-600 text-sm hover:underline">View</Link></td>
                </tr>
              ))}
              {routes.length === 0 && (
                <tr><td colSpan="6" className="py-8 text-center text-gray-500 text-sm">No routes available. Check back soon.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
