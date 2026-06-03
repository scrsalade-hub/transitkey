import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { localStore } from '../lib/localStore.js';

export default function Report() {
  const [activeTab, setActiveTab] = useState('complaints');
  const [complaints, setComplaints] = useState([]);
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    let allComplaints = [];

    // Try API first
    try {
      const data = await api.getComplaints();
      allComplaints = data.complaints || [];
    } catch { /* API unavailable */ }

    // Fallback / merge with localStore
    const localComplaints = localStore.getComplaints();
    const apiIds = new Set(allComplaints.map(c => c._id));
    const merged = [...allComplaints, ...localComplaints.filter(c => !apiIds.has(c._id))];
    setComplaints(merged);

    // Load trips, drivers, routes for other tabs
    try {
      const [tripsData, driversData, routesData] = await Promise.all([
        api.getTrips().catch(() => ({ trips: [] })),
        api.getDrivers().catch(() => []),
        api.getRoutes().catch(() => []),
      ]);
      setTrips(tripsData.trips || tripsData || []);
      setDrivers(driversData || []);
      setRoutes(routesData || []);
    } catch (e) { console.error(e); }

    setLoading(false);
  };

  const handleStatusChange = async (id, newStatus) => {
    localStore.updateComplaint(id, { status: newStatus });
    setComplaints(prev => prev.map(c => c._id === id ? { ...c, status: newStatus } : c));
    try {
      await api.updateComplaint(id, { status: newStatus });
    } catch { /* localStore has it */ }
  };

  const categoryLabels = { vehicle_issue: 'Vehicle Issue', route_issue: 'Route Issue', passenger_incident: 'Passenger Incident', driver_behavior: 'Driver Behavior', fare_dispute: 'Fare Dispute', other: 'Other' };
  const urgencyColors = { low: 'text-gray-600', medium: 'text-yellow-600', high: 'text-orange-600', critical: 'text-red-600' };
  const statusColors = { open: 'text-red-600', in_review: 'text-yellow-600', resolved: 'text-green-600', closed: 'text-gray-600' };

  // Driver performance data
  const driverPerf = drivers.map(d => {
    const driverTrips = trips.filter(t => t.driver?._id === d._id);
    return {
      ...d,
      totalTrips: driverTrips.length,
      completedTrips: driverTrips.filter(t => t.status === 'completed').length,
      activeTrips: driverTrips.filter(t => t.status === 'in_progress').length,
      avgDelay: driverTrips.length > 0
        ? Math.round(driverTrips.reduce((sum, t) => sum + (t.delayMinutes || 0), 0) / driverTrips.length)
        : 0,
    };
  });

  // Fleet status
  const fleetStats = {
    total: drivers.length,
    active: drivers.filter(d => d.status === 'active' || d.status === 'on_trip').length,
    idle: drivers.filter(d => d.status === 'idle' || !d.status).length,
    onTrip: trips.filter(t => t.status === 'in_progress').length,
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Reports & Analytics</h1>
      <div className="flex gap-2 md:gap-4 mb-4 md:mb-6 border-b border-gray-200 overflow-x-auto">
        {['complaints', 'fleet', 'drivers'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-xs md:text-sm font-medium whitespace-nowrap ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab === 'complaints' ? 'Complaints' : tab === 'fleet' ? 'Fleet Status' : 'Driver Performance'}
          </button>
        ))}
      </div>

      {activeTab === 'complaints' && (
        <div className="bg-white border border-gray-300 p-4 md:p-6 overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-medium text-gray-500 uppercase">All Complaints ({complaints.length})</h2>
            <button onClick={loadData} className="text-xs text-blue-600 hover:underline">Refresh</button>
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

      {activeTab === 'fleet' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-300 p-4 text-center">
              <p className="text-2xl md:text-3xl font-bold">{fleetStats.total}</p>
              <p className="text-xs text-gray-500 uppercase mt-1">Total Drivers</p>
            </div>
            <div className="bg-white border border-gray-300 p-4 text-center">
              <p className="text-2xl md:text-3xl font-bold text-green-600">{fleetStats.active}</p>
              <p className="text-xs text-gray-500 uppercase mt-1">Active</p>
            </div>
            <div className="bg-white border border-gray-300 p-4 text-center">
              <p className="text-2xl md:text-3xl font-bold text-blue-600">{fleetStats.onTrip}</p>
              <p className="text-xs text-gray-500 uppercase mt-1">On Trip</p>
            </div>
            <div className="bg-white border border-gray-300 p-4 text-center">
              <p className="text-2xl md:text-3xl font-bold text-gray-400">{fleetStats.idle}</p>
              <p className="text-xs text-gray-500 uppercase mt-1">Idle</p>
            </div>
          </div>

          {/* Active trips table */}
          <div className="bg-white border border-gray-300 p-4 md:p-6 overflow-x-auto">
            <h2 className="text-sm font-medium text-gray-500 uppercase mb-4">Currently Active Trips</h2>
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Trip ID</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Driver</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Plate</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Seats Left</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Stops Done</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Delay</th>
                </tr>
              </thead>
              <tbody>
                {trips.filter(t => t.status === 'in_progress').length > 0 ? trips.filter(t => t.status === 'in_progress').map(t => (
                  <tr key={t._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2 text-sm font-mono">{t.tripId}</td>
                    <td className="py-3 px-2 text-sm">{t.driver?.fullName || 'N/A'}</td>
                    <td className="py-3 px-2 text-sm">{t.plateNumber || 'N/A'}</td>
                    <td className="py-3 px-2 text-sm font-medium">{t.availableSeats ?? 'N/A'}</td>
                    <td className="py-3 px-2 text-sm">{t.completedStops || 0} / {t.route?.stops?.length || '?'}</td>
                    <td className="py-3 px-2 text-sm">{(t.delayMinutes || 0) > 0 ? <span className="text-red-600 font-medium">+{t.delayMinutes}m</span> : <span className="text-green-600">On time</span>}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="py-8 text-center text-gray-500 text-sm">No active trips</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'drivers' && (
        <div className="bg-white border border-gray-300 p-4 md:p-6 overflow-x-auto">
          <h2 className="text-sm font-medium text-gray-500 uppercase mb-4">Driver Performance</h2>
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Name</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Bus Plate</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Total Trips</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Completed</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Active</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Avg Delay</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {driverPerf.length > 0 ? driverPerf.map(d => (
                <tr key={d._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 text-sm font-medium">{d.fullName}</td>
                  <td className="py-3 px-2 text-sm">{d.plateNumber || 'N/A'}</td>
                  <td className="py-3 px-2 text-sm">{d.totalTrips}</td>
                  <td className="py-3 px-2 text-sm text-green-600">{d.completedTrips}</td>
                  <td className="py-3 px-2 text-sm text-blue-600">{d.activeTrips}</td>
                  <td className="py-3 px-2 text-sm">{d.avgDelay > 0 ? <span className="text-red-600">+{d.avgDelay}m</span> : 'None'}</td>
                  <td className="py-3 px-2">
                    <span className={`border px-2 py-0.5 text-xs ${d.status === 'active' || d.status === 'on_trip' ? 'border-green-500 text-green-700' : 'border-gray-400 text-gray-500'}`}>
                      {d.status || 'idle'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="7" className="py-8 text-center text-gray-500 text-sm">No driver data available.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
