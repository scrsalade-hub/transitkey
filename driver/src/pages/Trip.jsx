import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import RealMap from '../components/RealMap.jsx';
import { localStore } from '../lib/localStore.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Trip() {
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [route, setRoute] = useState(null);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [delayMinutes, setDelayMinutes] = useState(0);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [delayInput, setDelayInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [complaintForm, setComplaintForm] = useState({ category: '', description: '', urgency: 'low' });
  const [complaintMsg, setComplaintMsg] = useState('');

  const driverName = user?.user?.fullName || user?.fullName || '';
  const plateNumber = user?.user?.plateNumber || '';
  const driverId = user?.user?.driverId || user?.driverId || '';

  const loadTrip = useCallback(async () => {
    setLoading(true);
    const myDriverId = user?.user?._id || user?.user?.driverId || user?._id || user?.driverId;
    let foundTrip = null;
    let foundRoute = null;

    // 1. Try API first
    try {
      const token = getToken();
      if (token) {
        const res = await fetch(`${API_URL}/trips?status=in_progress`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          const myTrip = data.trips?.find(t =>
            t.driver?._id === myDriverId || t.driverId === myDriverId
          );
          if (myTrip) {
            foundTrip = myTrip;
            if (myTrip.route?._id) {
              const rRes = await fetch(`${API_URL}/routes/${myTrip.route._id}`, { headers: { Authorization: `Bearer ${token}` } });
              if (rRes.ok) foundRoute = await rRes.json();
            } else { foundRoute = myTrip.route; }
          }
        }
      }
    } catch { /* API unavailable */ }

    // 2. Fallback to localStore
    if (!foundTrip) {
      const localTrips = localStore.getTrips();
      foundTrip = localTrips.find(t =>
        t.status === 'in_progress' &&
        (t.driverId === myDriverId || t.driver?._id === myDriverId)
      );
      if (!foundTrip) {
        // Show any active trip (for demo/operator-assigned trips)
        foundTrip = localTrips.find(t => t.status === 'in_progress');
      }
      if (foundTrip?.route) foundRoute = foundTrip.route;
    }

    if (foundTrip) {
      setTrip(foundTrip);
      setCurrentStopIndex(foundTrip.currentStopIndex || 0);
      setDelayMinutes(foundTrip.delayMinutes || 0);
    }
    if (foundRoute) setRoute(foundRoute);

    setLoading(false);
  }, [getToken, user]);

  useEffect(() => { loadTrip(); }, [loadTrip]);

  const stops = route?.stops || [];

  const handleMarkArrived = useCallback(async () => {
    if (!trip || currentStopIndex >= stops.length - 1) return;
    const newIndex = currentStopIndex + 1;
    setCurrentStopIndex(newIndex);

    // Persist to localStore
    localStore.updateTrip(trip._id, { currentStopIndex: newIndex });
    setTrip(prev => prev ? { ...prev, currentStopIndex: newIndex } : prev);

    // Try API
    try {
      const token = getToken();
      if (token) {
        await fetch(`${API_URL}/trips/${trip._id}/progress`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ delayMinutes: newDelay })
        });
      }
    } catch { /* silent */ }
  }, [delayInput, delayMinutes, trip, getToken]);

  // Submit complaint - saves to localStore + API
  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    const complaintData = {
      ...complaintForm,
      reporterId: driverId,
      reporterName: driverName,
      reporterRole: 'driver',
      plateNumber: plateNumber,
    };
    // Save to localStore immediately
    localStore.addComplaint(complaintData);
    setComplaintMsg('Complaint submitted successfully.');
    setComplaintForm({ category: '', description: '', urgency: 'low' });
    // Try API
    try {
      const token = getToken();
      if (token) {
        await fetch(`${API_URL}/complaints`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(complaintData)
        });
      }
    } catch { /* silent - localStore already has it */ }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading trip data...</div>;
  if (!trip) return (
    <div className="p-8 max-w-2xl mx-auto text-center">
      <h1 className="text-xl font-semibold mb-2">No Active Trip</h1>
      <p className="text-gray-600 mb-4">You don&apos;t have an assigned trip. Contact your operator.</p>
      <button onClick={loadTrip} className="bg-blue-600 text-white px-6 py-2 text-sm font-medium hover:bg-blue-700 transition-colors mr-2">Refresh</button>
      <Link to="/dashboard" className="border border-gray-400 text-gray-700 px-6 py-2 text-sm bg-white hover:bg-gray-50 transition-colors">Back to Home</Link>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">{trip.route?.name || 'My Trip'}</h1>
          <p className="text-sm text-gray-600">Trip #{trip.tripId || trip._id?.slice(-6)} | Bus: {plateNumber || '--'}</p>
        </div>
        <span className="bg-gray-800 text-white text-xs px-3 py-1.5 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>LIVE
        </span>
      </div>

      {/* Route Summary */}
      <div className="bg-white border border-gray-300 p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div><span className="text-xs text-gray-500 uppercase block">From</span><span className="font-semibold">{trip.route?.startTerminal || '--'}</span></div>
          <div><span className="text-xs text-gray-500 uppercase block">To</span><span className="font-semibold">{trip.route?.endTerminal || '--'}</span></div>
          <div><span className="text-xs text-gray-500 uppercase block">Status</span>
            <span className={`font-medium ${currentStopIndex >= stops.length - 1 ? 'text-green-600' : 'text-blue-600'}`}>
              {currentStopIndex >= stops.length - 1 ? 'Completed' : `Stop ${currentStopIndex + 1} of ${stops.length}`}
            </span>
          </div>
        </div>
      </div>

      {/* Realistic Live Map */}
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
            <p className="text-sm text-gray-600 mb-4">Add minutes for traffic/delays. All ETAs will adjust.</p>
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

      {/* Submit Complaint Section */}
      <div className="bg-white border border-gray-300 p-4 md:p-6 mt-4">
        <h2 className="text-base md:text-lg font-semibold mb-1">Submit a Complaint</h2>
        <p className="text-sm text-gray-600 mb-4">Report issues and they will appear on the operator dashboard.</p>
        {complaintMsg && <div className="bg-green-50 text-green-700 text-sm p-3 mb-4 rounded">{complaintMsg}</div>}
        <form onSubmit={handleComplaintSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Category</label>
            <select value={complaintForm.category} onChange={e => setComplaintForm(p => ({ ...p, category: e.target.value }))} required className="w-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-600 bg-white">
              <option value="">Select...</option>
              <option value="vehicle_issue">Vehicle Issue</option>
              <option value="route_issue">Route Issue</option>
              <option value="passenger_incident">Passenger Incident</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Description</label>
            <textarea rows="3" value={complaintForm.description} onChange={e => setComplaintForm(p => ({ ...p, description: e.target.value }))} required className="w-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-600 resize-y" placeholder="Describe the issue..." />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">Submit Complaint</button>
            <button type="button" onClick={() => setComplaintForm({ category: '', description: '', urgency: 'low' })} className="border border-gray-400 text-gray-700 px-6 py-2 text-sm bg-white hover:bg-gray-50 transition-colors">Clear</button>
          </div>
        </form>
      </div>
    </div>
  );
}
