import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import RealMap from '../components/RealMap.jsx';
import { localStore } from '../lib/localStore.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function MapView() {
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [route, setRoute] = useState(null);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [delayMinutes, setDelayMinutes] = useState(0);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [delayInput, setDelayInput] = useState('');
  const [loading, setLoading] = useState(true);

  const driverName = user?.user?.fullName || user?.fullName || '';
  const plateNumber = user?.user?.plateNumber || '';

  const loadTrip = useCallback(async () => {
    setLoading(true);
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
    } catch { /* silent */ }

    if (!foundTrip) {
      const localTrips = localStore.getTrips();
      foundTrip = localTrips.find(t => t.status === 'in_progress');
      if (foundTrip?.route) setRoute(foundTrip.route);
    }

    if (foundTrip) {
      setTrip(foundTrip);
      setCurrentStopIndex(foundTrip.currentStopIndex || 0);
      setDelayMinutes(foundTrip.delayMinutes || 0);
    }
    setLoading(false);
  }, [getToken]);

  useEffect(() => { loadTrip(); }, [loadTrip]);

  const stops = route?.stops || [];

  const handleMarkArrived = useCallback(async () => {
    if (!trip || currentStopIndex >= stops.length) return;
    const newIndex = currentStopIndex + 1;
    setCurrentStopIndex(newIndex);
    localStore.updateTrip(trip._id, { currentStopIndex: newIndex });
    setTrip(prev => prev ? { ...prev, currentStopIndex: newIndex } : prev);
    try {
      const token = getToken();
      if (token) {
        await fetch(`${API_URL}/trips/${trip._id}/progress`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ currentStopIndex: newIndex })
        });
      }
    } catch { /* silent */ }
  }, [trip, currentStopIndex, stops.length, getToken]);

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

  if (loading) return <div className="p-8 text-center text-gray-500">Loading map...</div>;
  if (!trip) return (
    <div className="p-8 max-w-2xl mx-auto text-center">
      <h1 className="text-xl font-semibold mb-2">No Active Trip</h1>
      <p className="text-gray-600 mb-4">No trip assigned yet. Your operator will assign one.</p>
      <button onClick={loadTrip} className="bg-blue-600 text-white px-6 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">Refresh</button>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Live Route Map</h1>
          <p className="text-sm text-gray-600">{trip.route?.name || 'Route'} - Fullscreen tracking</p>
        </div>
        <span className="bg-gray-800 text-white text-xs px-3 py-1.5 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>LIVE
        </span>
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

      {/* Delay Modal */}
      {showDelayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={() => setShowDelayModal(false)}>
          <div className="bg-white border border-gray-300 p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-1">Report Delay</h3>
            <p className="text-sm text-gray-600 mb-4">Add minutes for traffic/delays. All ETAs update.</p>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Additional Minutes</label>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        <button onClick={() => navigate('/report')} className="w-full border border-gray-400 text-gray-700 px-6 py-3 text-sm bg-white hover:bg-gray-50 transition-colors">REPORT AN ISSUE</button>
        <button onClick={() => navigate('/report')} className="w-full border border-red-400 text-red-600 px-6 py-3 text-sm bg-white hover:bg-red-50 transition-colors">EMERGENCY REPORT</button>
      </div>
    </div>
  );
}
