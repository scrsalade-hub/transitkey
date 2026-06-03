import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../lib/api.js';

export default function Home() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const driverName = user?.user?.fullName || user?.fullName || '';
  const driverId = user?.user?.driverId || user?.driverId || '';
  const plateNumber = user?.user?.plateNumber || '';

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [tripsData, notifsData] = await Promise.all([
        api.getMyTrips().catch(() => ({ trips: [] })),
        api.getNotifications().catch(() => []),
      ]);
      setTrips(tripsData.trips || []);
      setNotifications(Array.isArray(notifsData) ? notifsData.slice(0, 5) : []);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const ongoingTrips = trips.filter(t => t.status === 'in_progress');
  const upcomingTrips = trips.filter(t => t.status === 'scheduled');
  const completedTrips = trips.filter(t => t.status === 'completed');

  const statusBadge = (status) => {
    switch (status) {
      case 'in_progress': return 'border border-green-500 text-green-700 px-2 py-0.5 text-xs bg-green-50';
      case 'scheduled': return 'border border-blue-500 text-blue-700 px-2 py-0.5 text-xs bg-blue-50';
      case 'completed': return 'border border-gray-400 text-gray-600 px-2 py-0.5 text-xs bg-gray-50';
      default: return 'border border-gray-400 text-gray-600 px-2 py-0.5 text-xs';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold">{driverName ? `Welcome, ${driverName.split(' ')[0]}` : 'Driver Dashboard'}</h1>
        <p className="text-sm text-gray-600">{driverId && `ID: ${driverId}`}{plateNumber && ` | Bus: ${plateNumber}`}</p>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm p-3 mb-4 rounded">{error}</div>}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-gray-300 p-4 text-center">
          <p className="text-xl font-bold text-green-600">{ongoingTrips.length}</p>
          <p className="text-xs text-gray-500 uppercase">Ongoing</p>
        </div>
        <div className="bg-white border border-gray-300 p-4 text-center">
          <p className="text-xl font-bold text-blue-600">{upcomingTrips.length}</p>
          <p className="text-xs text-gray-500 uppercase">Upcoming</p>
        </div>
        <div className="bg-white border border-gray-300 p-4 text-center">
          <p className="text-xl font-bold text-gray-600">{completedTrips.length}</p>
          <p className="text-xs text-gray-500 uppercase">Completed</p>
        </div>
      </div>

      {/* Ongoing Trips */}
      {ongoingTrips.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-green-700 uppercase mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Ongoing Trips
          </h2>
          <div className="space-y-3">
            {ongoingTrips.map(trip => (
              <Link key={trip._id} to={`/trip/${trip._id}`} className="block bg-white border border-green-300 p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <div>
                    <p className="font-semibold">{trip.route?.name || 'Route'}</p>
                    <p className="text-xs text-gray-500">{trip.route?.startTerminal} &rarr; {trip.route?.endTerminal}</p>
                    <p className="text-xs text-gray-500 mt-1">Trip ID: {trip.tripId || trip._id?.slice(-6)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {trip.availableSeats !== undefined && (
                      <span className="text-xs bg-gray-100 px-2 py-1">{trip.availableSeats} seats left</span>
                    )}
                    <span className={statusBadge(trip.status)}>{trip.status}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Trips */}
      {upcomingTrips.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-blue-700 uppercase mb-3">Upcoming Trips</h2>
          <div className="space-y-3">
            {upcomingTrips.map(trip => (
              <Link key={trip._id} to={`/trip/${trip._id}`} className="block bg-white border border-gray-300 p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <div>
                    <p className="font-semibold">{trip.route?.name || 'Route'}</p>
                    <p className="text-xs text-gray-500">{trip.route?.startTerminal} &rarr; {trip.route?.endTerminal}</p>
                    <p className="text-xs text-gray-500 mt-1">Trip ID: {trip.tripId || trip._id?.slice(-6)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {trip.scheduledDeparture && (
                      <span className="text-xs text-gray-500">Departs: {trip.scheduledDeparture}</span>
                    )}
                    <span className={statusBadge(trip.status)}>{trip.status}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Completed Trips */}
      {completedTrips.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-500 uppercase mb-3">Completed Trips</h2>
          <div className="space-y-3">
            {completedTrips.map(trip => (
              <div key={trip._id} className="bg-white border border-gray-200 p-4 opacity-70">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <div>
                    <p className="font-semibold">{trip.route?.name || 'Route'}</p>
                    <p className="text-xs text-gray-500">{trip.route?.startTerminal} &rarr; {trip.route?.endTerminal}</p>
                    <p className="text-xs text-gray-500 mt-1">Trip ID: {trip.tripId || trip._id?.slice(-6)}</p>
                  </div>
                  <span className={statusBadge(trip.status)}>{trip.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {trips.length === 0 && !loading && (
        <div className="bg-white border border-gray-300 p-8 text-center">
          <p className="text-gray-500 mb-2">No trips assigned yet.</p>
          <p className="text-sm text-gray-400">Your operator will assign trips to you soon.</p>
          <button onClick={fetchData} className="mt-4 bg-blue-600 text-white px-6 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">Refresh</button>
        </div>
      )}

      {loading && <p className="text-center text-gray-500 py-8">Loading trips...</p>}

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="bg-white border border-gray-300 p-4 mt-6">
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">Notifications</h3>
          <div className="space-y-2">
            {notifications.map(n => (
              <div key={n._id} className="flex items-start gap-2 text-sm">
                <svg className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p className="text-gray-600 text-xs">{n.title}: {n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
