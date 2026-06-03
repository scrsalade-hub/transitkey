import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';

export default function MapView() {
  const [trips, setTrips] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tripsData, routesData] = await Promise.all([
        api.getTrips().catch(() => ({ trips: [] })),
        api.getRoutes().catch(() => []),
      ]);
      const allTrips = tripsData.trips || tripsData || [];
      setTrips(allTrips);
      setRoutes(Array.isArray(routesData) ? routesData : (routesData.routes || []));
      const active = allTrips.filter(t => t.status === 'in_progress');
      if (active.length > 0) setSelectedTrip(active[0]);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // Generate SVG path from stops
  const getRoutePath = (trip) => {
    const route = trip.route && typeof trip.route === 'object' ? trip.route : routes.find(r => r._id === trip.route);
    if (!route || !route.stops || route.stops.length < 2) return null;
    const stops = route.stops;
    const width = 600;
    const height = 400;
    const padding = 50;
    const points = stops.map((_, i) => {
      const x = padding + (i / (stops.length - 1)) * (width - 2 * padding);
      const y = height / 2 + Math.sin(i * 0.8) * 80;
      return { x, y };
    });
    const pathD = points.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const cpx1 = prev.x + (p.x - prev.x) / 3;
      const cpy1 = prev.y;
      const cpx2 = prev.x + 2 * (p.x - prev.x) / 3;
      const cpy2 = p.y;
      return `${acc} C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${p.x} ${p.y}`;
    }, '');
    return { points, pathD, stops, width, height };
  };

  const routeSvg = selectedTrip ? getRoutePath(selectedTrip) : null;
  const activeTrips = trips.filter(t => t.status === 'in_progress');
  const delayedTrips = trips.filter(t => (t.delayMinutes || 0) > 0);
  const driverStatus = {};
  trips.forEach(t => {
    if (t.driver?._id) {
      driverStatus[t.driver._id] = t.status === 'in_progress' ? 'on_trip' : t.status;
    }
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Fleet Overview</h1>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading fleet data...</div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          {/* Map Area */}
          <div className="w-full lg:w-2/3 bg-white border border-gray-300 overflow-hidden relative" style={{ minHeight: '400px' }}>
            {routeSvg ? (
              <svg viewBox={`0 0 ${routeSvg.width} ${routeSvg.height}`} className="w-full h-full" style={{ minHeight: '400px' }}>
                <path d={routeSvg.pathD} fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round" />
                <path d={routeSvg.pathD} fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 4" />
                {routeSvg.points.map((p, i) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r="10" fill="white" stroke="#2563eb" strokeWidth="2" />
                    <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#2563eb">{i + 1}</text>
                    <text x={p.x} y={p.y - 18} textAnchor="middle" fontSize="9" fill="#6b7280">{routeSvg.stops[i]?.name}</text>
                  </g>
                ))}
                {/* Bus position based on completed stops */}
                {selectedTrip && (() => {
                  const progress = selectedTrip.completedStops && routeSvg.stops.length > 1
                    ? Math.min(selectedTrip.completedStops / (routeSvg.stops.length - 1), 0.95)
                    : 0.3;
                  const idx = Math.floor(progress * (routeSvg.points.length - 1));
                  const nextIdx = Math.min(idx + 1, routeSvg.points.length - 1);
                  const t = progress * (routeSvg.points.length - 1) - idx;
                  const x = routeSvg.points[idx].x + t * (routeSvg.points[nextIdx].x - routeSvg.points[idx].x);
                  const y = routeSvg.points[idx].y + t * (routeSvg.points[nextIdx].y - routeSvg.points[idx].y);
                  return (
                    <g>
                      <circle cx={x} cy={y} r="16" fill="#dc2626" stroke="white" strokeWidth="3" />
                      <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fill="white">BUS</text>
                    </g>
                  );
                })()}
              </svg>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <p className="text-gray-500 text-sm">{selectedTrip ? 'Route map unavailable - no stops defined' : 'Select a trip to view map'}</p>
              </div>
            )}

            {/* Trip selector overlay */}
            {activeTrips.length > 1 && (
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                {activeTrips.map(t => (
                  <button
                    key={t._id}
                    onClick={() => setSelectedTrip(t)}
                    className={`text-xs px-3 py-1.5 font-medium ${selectedTrip?._id === t._id ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}
                  >
                    {t.tripId}
                  </button>
                ))}
              </div>
            )}

            {/* Fleet overlay controls */}
            <div className="absolute top-4 left-4 bg-white border border-gray-300 py-3 px-4 z-10 max-w-[180px]">
              <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Fleet Overlay</h3>
              <label className="flex items-center gap-2 text-sm mb-1"><input type="checkbox" defaultChecked className="w-3 h-3" /> Active Routes</label>
              <label className="flex items-center gap-2 text-sm mb-1"><input type="checkbox" defaultChecked className="w-3 h-3" /> Show Delays</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="w-3 h-3" /> Completed Trips</label>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-1/3 space-y-4 overflow-y-auto">
            {/* Current Delays */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-medium text-gray-500 uppercase">Current Delays</h3>
                {delayedTrips.length > 0 && (
                  <span className="border border-red-500 text-red-600 px-2 py-0.5 text-xs">{delayedTrips.length} DELAYED</span>
                )}
              </div>
              <div className="space-y-2">
                {delayedTrips.length > 0 ? delayedTrips.map(t => (
                  <div key={t._id} className="bg-white border border-red-500 p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <span className="text-sm font-medium">{t.tripId}</span>
                      </div>
                      <span className="text-sm text-red-600 font-medium">+{t.delayMinutes}m</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{t.driver?.fullName} - {t.plateNumber}</p>
                    {t.route && typeof t.route === 'object' && (
                      <p className="text-xs text-gray-500">{t.route.name}</p>
                    )}
                  </div>
                )) : (
                  <div className="bg-white border border-gray-300 p-4 text-center text-gray-500 text-sm">No delays reported</div>
                )}
              </div>
            </div>

            {/* Active Trips */}
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">Active Trips ({activeTrips.length})</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {activeTrips.length > 0 ? activeTrips.map(t => (
                  <button
                    key={t._id}
                    onClick={() => setSelectedTrip(t)}
                    className={`w-full text-left p-2 text-sm border ${selectedTrip?._id === t._id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{t.tripId}</span>
                      <span className="text-xs text-gray-500">{t.plateNumber}</span>
                    </div>
                    <p className="text-xs text-gray-500">{t.driver?.fullName}</p>
                    <p className="text-xs text-gray-400">Seats: {t.availableSeats ?? 'N/A'} | Stops: {t.completedStops || 0}/{t.route?.stops?.length || '?'}</p>
                  </button>
                )) : (
                  <p className="text-gray-500 text-sm text-center py-3">No active trips</p>
                )}
              </div>
            </div>

            {/* Selected Trip Details */}
            {selectedTrip && (
              <div className="bg-white border border-gray-300 p-4">
                <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Selected Trip Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Trip ID</span><span className="font-medium font-mono">{selectedTrip.tripId}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Driver</span><span className="font-medium">{selectedTrip.driver?.fullName || 'N/A'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Bus Plate</span><span className="font-medium">{selectedTrip.plateNumber || 'N/A'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Seats Left</span><span className="font-medium">{selectedTrip.availableSeats ?? 'N/A'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Started</span><span>{selectedTrip.actualStartTime ? new Date(selectedTrip.actualStartTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : 'N/A'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Duration</span><span>{selectedTrip.adjustedDuration || selectedTrip.estimatedDuration} mins</span></div>
                </div>
                {selectedTrip.delayMinutes > 0 && (
                  <div className="mt-3 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2">
                    Delay: +{selectedTrip.delayMinutes} minutes
                  </div>
                )}
              </div>
            )}

            {/* Trip status summary */}
            <div className="bg-white border border-gray-300 p-4">
              <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Fleet Summary</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div><p className="text-lg font-bold text-blue-600">{trips.filter(t => t.status === 'scheduled').length}</p><p className="text-xs text-gray-500">Scheduled</p></div>
                <div><p className="text-lg font-bold text-green-600">{activeTrips.length}</p><p className="text-xs text-gray-500">Active</p></div>
                <div><p className="text-lg font-bold text-gray-600">{trips.filter(t => t.status === 'completed').length}</p><p className="text-xs text-gray-500">Done</p></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
