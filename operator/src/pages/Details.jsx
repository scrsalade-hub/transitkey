import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';

export default function Details() {
  const [trips, setTrips] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tripsData, routesData, driversData] = await Promise.all([
        api.getTrips().catch(() => ({ trips: [] })),
        api.getRoutes().catch(() => []),
        api.getDrivers().catch(() => []),
      ]);
      setTrips(tripsData.trips || tripsData || []);
      setRoutes(routesData || []);
      setDrivers(driversData || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // Build revenue per route from actual data
  const routeStats = routes.map(r => {
    const routeTrips = trips.filter(t => {
      const rid = typeof t.route === 'object' ? t.route?._id : t.route;
      return rid === r._id;
    });
    const totalFare = routeTrips.length * (r.fare || 0);
    return {
      _id: r._id,
      routeName: r.name,
      routeId: r.routeId,
      totalTrips: routeTrips.length,
      completedTrips: routeTrips.filter(t => t.status === 'completed').length,
      activeTrips: routeTrips.filter(t => t.status === 'in_progress').length,
      totalFare,
      status: routeTrips.length > 0 ? 'ACTIVE' : 'NO TRIPS',
    };
  });

  const totalRevenue = routeStats.reduce((sum, r) => sum + r.totalFare, 0);
  const totalTrips = trips.length;
  const activeDrivers = drivers.filter(d => d.status === 'active').length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-xl md:text-2xl font-semibold mb-1">Revenue & Operations Dashboard</h1>
      <p className="text-sm text-gray-600 mb-4 md:mb-6">Financial and operational overview from live data.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white border border-gray-300 p-4 md:p-6">
          <span className="text-xs font-medium text-gray-500 uppercase">Total Trips</span>
          <p className="text-lg md:text-xl font-bold mt-1">{totalTrips}</p>
        </div>
        <div className="bg-white border border-gray-300 p-4 md:p-6">
          <span className="text-xs font-medium text-gray-500 uppercase">Total Revenue</span>
          <p className="text-lg md:text-xl font-bold mt-1 text-green-600">#{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-gray-300 p-4 md:p-6">
          <span className="text-xs font-medium text-gray-500 uppercase">Active Routes</span>
          <p className="text-lg md:text-xl font-bold mt-1">{routes.filter(r => r.status === 'active').length}</p>
        </div>
        <div className="bg-white border border-gray-300 p-4 md:p-6">
          <span className="text-xs font-medium text-gray-500 uppercase">Active Drivers</span>
          <p className="text-lg md:text-xl font-bold mt-1">{activeDrivers}</p>
        </div>
      </div>

      {/* Trip Status Summary */}
      <div className="bg-white border border-gray-300 p-4 md:p-6 mb-6">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Trip Status Summary</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="border border-gray-200 p-3">
            <p className="text-2xl font-bold text-blue-600">{trips.filter(t => t.status === 'scheduled').length}</p>
            <p className="text-xs text-gray-500 uppercase mt-1">Scheduled</p>
          </div>
          <div className="border border-gray-200 p-3">
            <p className="text-2xl font-bold text-green-600">{trips.filter(t => t.status === 'in_progress').length}</p>
            <p className="text-xs text-gray-500 uppercase mt-1">In Progress</p>
          </div>
          <div className="border border-gray-200 p-3">
            <p className="text-2xl font-bold text-gray-600">{trips.filter(t => t.status === 'completed').length}</p>
            <p className="text-xs text-gray-500 uppercase mt-1">Completed</p>
          </div>
        </div>
      </div>

      {/* Revenue by Route */}
      <div className="bg-white border border-gray-300 p-4 md:p-6 overflow-x-auto mb-6">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Revenue by Route</h2>
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-2">Route Name</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-2">Total Trips</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-2">Completed</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-2">Active</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-2">Est. Revenue</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {routeStats.length > 0 ? routeStats.map(route => (
              <tr key={route._id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-2 text-sm font-medium">{route.routeName}</td>
                <td className="py-3 px-2 text-sm">{route.totalTrips}</td>
                <td className="py-3 px-2 text-sm">{route.completedTrips}</td>
                <td className="py-3 px-2 text-sm">{route.activeTrips}</td>
                <td className="py-3 px-2 text-sm font-medium">#{route.totalFare.toLocaleString()}</td>
                <td className="py-3 px-2"><span className={`border px-2 py-0.5 text-xs ${route.status === 'ACTIVE' ? 'border-green-500 text-green-700' : 'border-gray-400 text-gray-500'}`}>{route.status}</span></td>
              </tr>
            )) : (
              <tr><td colSpan="6" className="py-8 text-center text-gray-500 text-sm">{loading ? 'Loading data...' : 'No route data available. Create routes and trips to see analytics.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Driver Status */}
      <div className="bg-white border border-gray-300 p-4 md:p-6">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Driver Status ({drivers.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-2">Name</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-2">Bus Plate</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-2">Vehicle Class</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-2">License Type</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map(d => (
                <tr key={d._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 text-sm font-medium">{d.fullName}</td>
                  <td className="py-3 px-2 text-sm">{d.plateNumber || 'N/A'}</td>
                  <td className="py-3 px-2 text-sm">{d.vehicleClass || 'N/A'}</td>
                  <td className="py-3 px-2 text-sm">{d.licenseType || 'N/A'}</td>
                  <td className="py-3 px-2"><span className={`border px-2 py-0.5 text-xs ${d.status === 'active' ? 'border-green-500 text-green-700' : d.status === 'on_trip' ? 'border-blue-500 text-blue-700' : 'border-gray-400 text-gray-500'}`}>{d.status || 'idle'}</span></td>
                </tr>
              ))}
              {drivers.length === 0 && (
                <tr><td colSpan="5" className="py-8 text-center text-gray-500 text-sm">No drivers added yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
