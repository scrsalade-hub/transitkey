import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';

export default function MapView() {
  const [searchParams] = useSearchParams();
  const focusTripId = searchParams.get('trip');
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const svgRef = useRef(null);

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    if (focusTripId && trips.length > 0) {
      const t = trips.find(tr => tr._id === focusTripId);
      if (t) setSelectedTrip(t);
    }
  }, [focusTripId, trips]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tripsData, routesData] = await Promise.all([
        api.getTrips().catch(() => ({ trips: [] })),
        api.getRoutes().catch(() => []),
      ]);
      const allTrips = tripsData.trips || tripsData || [];
      // Only show active trips on map
      const activeTrips = allTrips.filter(t => t.status === 'in_progress');
      setTrips(activeTrips);
      setRoutes(Array.isArray(routesData) ? routesData : (routesData.routes || []));
      if (focusTripId) {
        const focused = activeTrips.find(t => t._id === focusTripId);
        if (focused) setSelectedTrip(focused);
      } else if (activeTrips.length > 0) {
        setSelectedTrip(activeTrips[0]);
      }
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
    // Distribute stops along a path
    const points = stops.map((_, i) => {
      const x = padding + (i / (stops.length - 1)) * (width - 2 * padding);
      // Add some curvature
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

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Live Trip Tracking</h1>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading active trips...</div>
      ) : trips.length === 0 ? (
        <div className="bg-white border border-gray-300 p-8 text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.447-.894L15 7m0 13V7" />
          </svg>
          <p className="text-sm">No active trips currently in progress.</p>
          <p className="text-xs text-gray-400 mt-1">Trips will appear here when drivers start them.</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          {/* Map Area */}
          <div className="flex-1 bg-white border border-gray-300 overflow-hidden relative" style={{ minHeight: '400px' }}>
            {routeSvg ? (
              <svg ref={svgRef} viewBox={`0 0 ${routeSvg.width} ${routeSvg.height}`} className="w-full h-full" style={{ minHeight: '400px' }}>
                {/* Road path */}
                <path d={routeSvg.pathD} fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round" />
                <path d={routeSvg.pathD} fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 4" />

                {/* Stops */}
                {routeSvg.points.map((p, i) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r="10" fill="white" stroke="#2563eb" strokeWidth="2" />
                    <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#2563eb">{i + 1}</text>
                    <text x={p.x} y={p.y - 18} textAnchor="middle" fontSize="9" fill="#6b7280">{routeSvg.stops[i]?.name}</text>
                  </g>
                ))}

                {/* Bus icon - positioned at estimated progress */}
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
                <p className="text-gray-500 text-sm">Route map unavailable - no stops defined</p>
              </div>
            )}

            {/* Trip selector overlay */}
            {trips.length > 1 && (
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                {trips.map(t => (
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
          </div>

          {/* Sidebar Info */}
          <div className="w-full lg:w-80 space-y-4">
            {selectedTrip ? (
              <>
                <div className="bg-white border border-gray-300 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs font-mono text-gray-500">{selectedTrip.tripId}</p>
                      <h2 className="text-base font-semibold">{selectedTrip.driver?.fullName || 'Unknown'}</h2>
                    </div>
                    <span className="bg-green-600 text-white px-2 py-0.5 text-xs uppercase">Live</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Bus Plate</span><span className="font-medium">{selectedTrip.plateNumber || 'N/A'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Available Seats</span><span className="font-bold text-blue-600">{selectedTrip.availableSeats ?? selectedTrip.busCapacity ?? 'N/A'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Started</span><span>{selectedTrip.actualStartTime ? new Date(selectedTrip.actualStartTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : 'N/A'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Est. Duration</span><span>{selectedTrip.adjustedDuration || selectedTrip.estimatedDuration} mins</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Stops Done</span><span>{selectedTrip.completedStops || 0} / {(selectedTrip.route?.stops?.length || routeSvg?.stops?.length || 0)}</span></div>
                  </div>
                  {selectedTrip.delayMinutes > 0 && (
                    <div className="mt-3 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2">
                      Delay reported: +{selectedTrip.delayMinutes} minutes
                    </div>
                  )}
                </div>

                {/* Stops list */}
                <div className="bg-white border border-gray-300 p-4">
                  <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">Route Stops</h3>
                  <div className="space-y-2">
                    {(selectedTrip.route?.stops || routeSvg?.stops || []).map((stop, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                          i < (selectedTrip.completedStops || 0) ? 'bg-green-600 text-white' : i === (selectedTrip.completedStops || 0) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>{i + 1}</div>
                        <span className={i < (selectedTrip.completedStops || 0) ? 'line-through text-gray-400' : ''}>{stop.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white border border-gray-300 p-6 text-center text-gray-500">
                <p className="text-sm">Select a trip to view live tracking</p>
              </div>
            )}

            {/* Active trips list */}
            <div className="bg-white border border-gray-300 p-4">
              <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">All Active Trips ({trips.length})</h3>
              <div className="space-y-2">
                {trips.map(t => (
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
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
