import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api.js';

export default function RouteDetails() {
  const { id } = useParams();
  const [route, setRoute] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [routeData, allTrips] = await Promise.all([
        api.getRoute(id).catch(() => null),
        api.getTrips().catch(() => []),
      ]);
      setRoute(routeData);
      // Filter trips for this route
      const routeTrips = (allTrips.trips || allTrips || []).filter(t => {
        const routeId = typeof t.route === 'object' ? t.route?._id : t.route;
        return routeId === id;
      });
      setTrips(routeTrips);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (loading) return <div className="p-4 md:p-8 text-center text-gray-500">Loading...</div>;
  if (!route) return <div className="p-4 md:p-8 text-center text-gray-500">Route not found.</div>;

  const upcomingTrips = trips.filter(t => t.status === 'scheduled');
  const activeTrips = trips.filter(t => t.status === 'in_progress');
  const completedTrips = trips.filter(t => t.status === 'completed');

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-xl md:text-2xl font-semibold mb-2">{route.name}</h1>
      <p className="text-sm text-gray-600 mb-4 md:mb-6">Route ID: {route.routeId} | {route.startTerminal} to {route.endTerminal}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white border border-gray-300 p-4 text-center">
          <span className="text-xs font-medium text-gray-500 uppercase">Distance</span>
          <p className="text-lg md:text-xl font-bold mt-1">{route.distance} km</p>
        </div>
        <div className="bg-white border border-gray-300 p-4 text-center">
          <span className="text-xs font-medium text-gray-500 uppercase">Duration</span>
          <p className="text-lg md:text-xl font-bold mt-1">{route.estimatedDuration} mins</p>
        </div>
        <div className="bg-white border border-gray-300 p-4 text-center">
          <span className="text-xs font-medium text-gray-500 uppercase">Fare</span>
          <p className="text-lg md:text-xl font-bold mt-1 text-blue-600">#{route.fare?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-white border border-gray-300 p-4 text-center">
          <span className="text-xs font-medium text-gray-500 uppercase">Stops</span>
          <p className="text-lg md:text-xl font-bold mt-1">{route.stops?.length || 0}</p>
        </div>
      </div>

      {/* Active Trips - Live */}
      {activeTrips.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base md:text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Live Trips ({activeTrips.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTrips.map(trip => (
              <div key={trip._id} className="bg-white border-2 border-green-500 p-4 md:p-6">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                  <div>
                    <p className="text-sm font-mono text-gray-500">{trip.tripId}</p>
                    <p className="text-sm font-medium">{trip.driver?.fullName || 'Unknown Driver'}</p>
                  </div>
                  <span className="bg-green-600 text-white px-3 py-1 text-xs uppercase font-medium">In Progress</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div><span className="text-gray-500 text-xs block">Available Seats</span><span className="font-bold text-lg">{trip.availableSeats ?? trip.busCapacity ?? 'N/A'}</span></div>
                  <div><span className="text-gray-500 text-xs block">Bus Plate</span><span className="font-medium">{trip.plateNumber || 'N/A'}</span></div>
                  <div><span className="text-gray-500 text-xs block">Started</span><span className="font-medium">{trip.actualStartTime ? new Date(trip.actualStartTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}</span></div>
                  <div><span className="text-gray-500 text-xs block">ETA</span><span className="font-medium">{trip.adjustedDuration || trip.estimatedDuration} mins</span></div>
                </div>
                {trip.delayMinutes > 0 && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 mb-3">
                    Delay: +{trip.delayMinutes} minutes
                  </div>
                )}
                <Link to={`/map?trip=${trip._id}`} className="block w-full text-center bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">
                  Track Live on Map
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Trips */}
      {upcomingTrips.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base md:text-lg font-semibold mb-3">Upcoming Trips ({upcomingTrips.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingTrips.map(trip => (
              <div key={trip._id} className="bg-white border border-gray-300 p-4 md:p-6">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                  <div>
                    <p className="text-sm font-mono text-gray-500">{trip.tripId}</p>
                    <p className="text-sm font-medium">{trip.driver?.fullName || 'Unassigned'}</p>
                  </div>
                  <span className="border border-gray-400 text-gray-700 px-3 py-1 text-xs uppercase">Scheduled</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div><span className="text-gray-500 text-xs block">Departure</span><span className="font-medium">{trip.departureTime}</span></div>
                  <div><span className="text-gray-500 text-xs block">Seats</span><span className="font-medium">{trip.busCapacity || 'N/A'}</span></div>
                  <div><span className="text-gray-500 text-xs block">Plate</span><span className="font-medium">{trip.plateNumber || 'N/A'}</span></div>
                  <div><span className="text-gray-500 text-xs block">Duration</span><span className="font-medium">{trip.estimatedDuration} mins</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Trips */}
      {completedTrips.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base md:text-lg font-semibold mb-3 text-gray-600">Completed Today ({completedTrips.length})</h2>
          <div className="bg-white border border-gray-300 overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Trip ID</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Driver</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Started</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">Ended</th>
                </tr>
              </thead>
              <tbody>
                {completedTrips.map(trip => (
                  <tr key={trip._id} className="border-b border-gray-100">
                    <td className="py-3 px-2 text-sm font-mono">{trip.tripId}</td>
                    <td className="py-3 px-2 text-sm">{trip.driver?.fullName || 'N/A'}</td>
                    <td className="py-3 px-2 text-sm">{trip.actualStartTime ? new Date(trip.actualStartTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}</td>
                    <td className="py-3 px-2 text-sm">{trip.actualEndTime ? new Date(trip.actualEndTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stop Schedule */}
      <div className="bg-white border border-gray-300 p-4 md:p-6">
        <h2 className="text-base md:text-lg font-semibold mb-4">Stop Schedule</h2>
        <div className="space-y-2">
          {route.stops?.map((stop, i) => (
            <div key={i} className="flex items-center gap-3 text-sm py-2 border-b border-gray-100 last:border-0">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
              <span className="font-medium flex-1">{stop.name}</span>
              <span className="text-gray-500 text-xs">{stop.estimatedArrival}</span>
            </div>
          ))}
          {(!route.stops || route.stops.length === 0) && (
            <p className="text-gray-500 text-sm text-center py-4">No stops defined for this route.</p>
          )}
        </div>
      </div>

      {trips.length === 0 && (
        <div className="bg-white border border-gray-300 p-8 text-center text-gray-500 text-sm mt-4">
          No trips scheduled for this route yet.
        </div>
      )}
    </div>
  );
}
