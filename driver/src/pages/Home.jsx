import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import RealMap from '../components/RealMap.jsx';
import { localStore } from '../lib/localStore.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Home() {
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [route, setRoute] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [delayMinutes, setDelayMinutes] = useState(0);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [delayInput, setDelayInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  const driverName = user?.user?.fullName || user?.fullName || '';
  const plateNumber = user?.user?.plateNumber || '';
  const driverId = user?.user?.driverId || user?.driverId || '';

  // Load trip data
  useEffect(() => {
    loadTrip();
  }, []);

  const loadTrip = useCallback(async () => {
    setLoading(true);
    // Try API first, fall back to localStorage
    let foundTrip = null;
    try {
      const token = getToken();
      if (token) {
        const res = await fetch(`${API_URL}/trips?status=in_progress`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          if (data.trips?.length > 0) {
            foundTrip = data.trips[0];
            if (foundTrip.route?._id) {
              const rRes = await fetch(`${API_URL}/routes/${foundTrip.route._id}`, { headers: { Authorization: `Bearer ${token}` } });
              if (rRes.ok) { const rData = await rRes.json(); setRoute(rData); }
            }
          }
        }
      }
    } catch (e) {
      // API unavailable, use localStorage
    }

    if (!foundTrip) {
      // Find trip for this driver
      const driverData = user?.user || user;
      const localTrips = localStore.getTrips();
      foundTrip = localTrips.find(t =>
        t.status === 'in_progress' &&
        (t.driverId === driverData?._id || t.driverId === driverData?.driverId)
      );
      if (!foundTrip) {
        // Check by token
        const token = getToken();
        if (token) {
          // Get any active trip for demo
          foundTrip = localTrips.find(t => t.status === 'in_progress');
        }
      }
      if (foundTrip?.route) setRoute(foundTrip.route);
    }

    if (foundTrip) {
      setTrip(foundTrip);
      setCurrentStopIndex(foundTrip.currentStopIndex || 0);
      setDelayMinutes(foundTrip.delayMinutes || 0);
    }

    // Load notifications
    const localNotifs = localStore.getNotifications();
    const token = getToken();
    if (token) {
      try {
        const nRes = await fetch(`${API_URL}/notifications`, { headers: { Authorization: `Bearer ${token}` } });
        if (nRes.ok) { const nData = await nRes.json(); setNotifications(Array.isArray(nData) ? nData.slice(0, 3) : localNotifs.slice(0, 3)); }
        else setNotifications(localNotifs.slice(0, 3));
      } catch { setNotifications(localNotifs.slice(0, 3)); }
    } else {
      setNotifications(localNotifs.slice(0, 3));
    }

    setLoading(false);
  }, [getToken, user]);

  const handleMarkArrived = useCallback(async () => {
    if (!trip || currentStopIndex >= (route?.stops?.length || 0)) return;
    const newIndex = currentStopIndex + 1;
    setCurrentStopIndex(newIndex);

    // Update localStorage
    localStore.updateTrip(trip._id, { currentStopIndex: newIndex, departedAt: new Date().toISOString() });
    setTrip(prev => prev ? { ...prev, currentStopIndex: newIndex } : prev);

    // Try API
    try {
      const token = getToken();
      if (token) {
        await fetch(`${API_URL}/trips/${trip._id}/progress`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ currentStopIndex: newIndex, departedAt: new Date().toISOString() })
        });
      }
    } catch { /* silent */ }
  }, [trip, route, currentStopIndex, getToken]);

  const handleReportDelay = useCallback(() => { setShowDelayModal(true); setDelayInput(''); }, []);

  const handleAddDelay = useCallback(async () => {
    const mins = parseInt(delayInput);
    if (!mins || mins <= 0 || !trip) return;
    const newDelay = delayMinutes + mins;
    setDelayMinutes(newDelay);
    setShowDelayModal(false);

    localStore.updateTrip(trip._id, { delayMinutes: newDelay });
    setTrip(prev => prev ? { ...prev, delayMinutes: newDelay } : prev);

    try {
      const token = getToken();
      if (token) {
        await fetch(`${API_URL}/trips/${trip._id}/delay`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ delayMinutes: newDelay })
        });
      }
    } catch { /* silent */ }
  }, [delayInput, delayMinutes, trip, getToken]);

  const stops = route?.stops || [];

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold mb-1">
        {driverName ? `Welcome, ${driverName.split(' ')[0]}` : 'Driver Dashboard'}
      </h1>
      <p className="text-sm text-gray-600 mb-4 md:mb-6">
        {driverId && `ID: ${driverId}`}{plateNumber && ` | Bus: ${plateNumber}`}
      </p>

      {/* Active Trip Card */}
      {trip ? (
        <div className="bg-white border border-gray-300 p-4 md:p-6 mb-4">
          <div className="flex flex-wrap justify-between items-start mb-3 gap-2">
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase">Current Trip</span>
              <h2 className="text-lg md:text-xl font-semibold mt-1">{trip.route?.name || 'Active Trip'}</h2>
            </div>
            <span className="border border-green-500 text-green-700 px-3 py-1 text-xs flex items-center gap-1 bg-green-50">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {currentStopIndex >= stops.length - 1 ? 'Completed' : 'In Progress'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm mb-3">
            <div><span className="text-gray-500 block text-xs">Trip ID</span><span className="font-medium font-mono">#{trip.tripId || trip._id?.slice(-6)}</span></div>
            <div><span className="text-gray-500 block text-xs">Next Stop</span><span className="font-medium">{stops[currentStopIndex]?.name || 'Arriving'}</span></div>
            <div><span className="text-gray-500 block text-xs">Status</span><span className="font-medium text-blue-600">{currentStopIndex < stops.length - 1 ? `En route to ${stops[currentStopIndex]?.name}` : 'Route Complete'}</span></div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-300 p-4 md:p-6 mb-4 text-center">
          <h2 className="text-lg font-semibold mb-2">No Active Trip</h2>
          <p className="text-sm text-gray-600 mb-3">No trip is currently assigned to you.</p>
          <button onClick={loadTrip} className="bg-blue-600 text-white px-6 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">Check Again</button>
        </div>
      )}

      {/* Realistic Live Map */}
      {trip && stops.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Live Route Tracking</h3>
            <Link to="/map" className="text-xs text-blue-600 hover:underline">Fullscreen Map</Link>
          </div>
          <RealMap
            stops={stops}
            currentStopIndex={currentStopIndex}
            delayMinutes={delayMinutes}
            busId={plateNumber}
            driverName={driverName}
            estimatedDuration={route?.estimatedDuration || 120}
            onMarkStopArrived={currentStopIndex < stops.length - 1 ? handleMarkArrived : null}
            onReportDelay={handleReportDelay}
            paused={currentStopIndex >= stops.length - 1}
          />
        </div>
      )}

      {/* Delay Modal */}
      {showDelayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={() => setShowDelayModal(false)}>
          <div className="bg-white border border-gray-300 p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-1">Report Delay</h3>
            <p className="text-sm text-gray-600 mb-4">Add minutes for traffic or other delays. ETAs will update.</p>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Minutes</label>
            <input type="number" min="1" value={delayInput} onChange={e => setDelayInput(e.target.value)}
              className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600 mb-4" placeholder="e.g. 15" autoFocus />
            <div className="flex gap-2">
              <button onClick={handleAddDelay} disabled={!delayInput || parseInt(delayInput) <= 0}
                className="flex-1 bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50">Add Delay</button>
              <button onClick={() => setShowDelayModal(false)}
                className="flex-1 border border-gray-400 text-gray-700 px-4 py-2 text-sm bg-white hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="w-full">
        <div className="bg-white border border-gray-300 p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase">Notifications</h3>
            <Link to="/notifications" className="text-xs text-blue-600 hover:underline">VIEW ALL</Link>
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No notifications yet.</p>
          ) : (
            <div className="space-y-3">
              {notifications.map(n => (
                <div key={n._id} className="flex items-start gap-3 text-sm border-b border-gray-100 pb-2 last:border-0">
                  <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <div><p className="font-medium">{n.title}</p><p className="text-gray-600 text-xs">{n.message}</p></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
