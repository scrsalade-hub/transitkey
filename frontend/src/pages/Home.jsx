import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';

export default function Home() {
  const { user, getToken } = useAuth();
  const [routes, setRoutes] = useState([]);
  const [liveTrips, setLiveTrips] = useState([]);
  const [stats, setStats] = useState({ activeTrips: 0, totalRoutes: 0, serviceAlerts: 0 });

  useEffect(() => { fetchRoutes(); fetchLiveData(); }, []);

  const fetchRoutes = async () => {
    try {
      const data = await api.getRoutes();
      setRoutes(data || []);
      setStats(p => ({ ...p, totalRoutes: data.length || 0 }));
    } catch (e) { console.error(e); }
  };

  const fetchLiveData = async () => {
    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [tripsRes, notifRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/trips`, { headers }).then(r => r.ok ? r.json() : { trips: [] }).catch(() => ({ trips: [] })),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/notifications?type=system_alert`, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
      ]);
      const allTrips = tripsRes.trips || tripsRes || [];
      const active = allTrips.filter(t => t.status === 'in_progress');
      setLiveTrips(active.slice(0, 4));
      setStats(p => ({ ...p, activeTrips: active.length, serviceAlerts: Array.isArray(notifRes) ? notifRes.length : 0 }));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Welcome{user ? `, ${user.user?.fullName || 'Passenger'}` : ''}</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white border border-gray-300 p-4 md:p-6">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Live Trips</span>
          <p className="text-2xl md:text-3xl font-bold mt-2 text-green-600">{stats.activeTrips}</p>
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

      {/* Live Trips Section */}
      {liveTrips.length > 0 && (
        <div className="mb-6 md:mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Trips
            </h2>
            <Link to="/map" className="text-sm text-blue-600 hover:underline">Track on Map</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveTrips.map(trip => (
              <div key={trip._id} className="bg-white border-2 border-green-500 p-4 md:p-6">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                  <div>
                    <p className="text-sm font-mono text-gray-500">{trip.tripId}</p>
                    <p className="text-sm font-medium">{trip.route && typeof trip.route === 'object' ? trip.route.name : 'Route'}</p>
                  </div>
                  <span className="bg-green-600 text-white px-3 py-1 text-xs uppercase font-medium">Live</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div><span className="text-gray-500 text-xs block">Driver</span><span className="font-medium">{trip.driver?.fullName || 'N/A'}</span></div>
                  <div><span className="text-gray-500 text-xs block">Available Seats</span><span className="font-bold text-blue-600">{trip.availableSeats ?? trip.busCapacity ?? 'N/A'}</span></div>
                  <div><span className="text-gray-500 text-xs block">Bus Plate</span><span className="font-medium">{trip.plateNumber || 'N/A'}</span></div>
                  <div><span className="text-gray-500 text-xs block">ETA</span><span className="font-medium">{trip.adjustedDuration || trip.estimatedDuration} mins</span></div>
                </div>
                {trip.delayMinutes > 0 && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 mb-3">
                    Delay: +{trip.delayMinutes} minutes
                  </div>
                )}
                <Link to={`/map?trip=${trip._id}`} className="block w-full text-center bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">
                  Track This Trip
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Routes */}
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
                  <td className="py-3"><Link to={`/routes/${route._id}`} className="text-blue-600 text-sm hover:underline">View Details</Link></td>
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
