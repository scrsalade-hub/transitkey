import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import RealMap from '../components/RealMap.jsx';
import api from '../lib/api.js';

export default function Trip() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  // Form states
  const [seatInput, setSeatInput] = useState('');
  const [timeInput, setTimeInput] = useState('');
  const [showSeatForm, setShowSeatForm] = useState(false);
  const [showTimeForm, setShowTimeForm] = useState(false);
  const [showDelayForm, setShowDelayForm] = useState(false);
  const [delayInput, setDelayInput] = useState('');

  const driverName = user?.user?.fullName || user?.fullName || '';
  const plateNumber = user?.user?.plateNumber || '';

  const fetchTrip = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getTrip(tripId);
      setTrip(data);
      if (data.route) setRoute(data.route);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, [tripId]);

  useEffect(() => { fetchTrip(); }, [fetchTrip]);

  const handleStart = async () => {
    try {
      const data = await api.startTrip(tripId, { startedAt: new Date().toISOString() });
      setTrip(data);
      setActionMsg('Trip started successfully!');
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) { setError(err.message); }
  };

  const handleEnd = async () => {
    try {
      const data = await api.endTrip(tripId);
      setTrip(data);
      setActionMsg('Trip ended successfully!');
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) { setError(err.message); }
  };

  const handleMarkStop = async (stopIndex) => {
    try {
      const data = await api.updateTripProgress(tripId, {
        currentStopIndex: stopIndex,
        stopDepartures: [...(trip.stopDepartures || []), { stopIndex, departedAt: new Date().toISOString() }],
      });
      setTrip(data);
    } catch (err) { setError(err.message); }
  };

  const handleUpdateSeats = async () => {
    const seats = parseInt(seatInput);
    if (isNaN(seats) || seats < 0) return;
    try {
      const data = await api.updateSeats(tripId, seats);
      setTrip(data);
      setShowSeatForm(false);
      setSeatInput('');
      setActionMsg(`Available seats updated to ${seats}`);
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) { setError(err.message); }
  };

  const handleAdjustTime = async () => {
    const mins = parseInt(timeInput);
    if (isNaN(mins) || mins <= 0) return;
    try {
      const data = await api.adjustTime(tripId, mins);
      setTrip(data);
      setShowTimeForm(false);
      setTimeInput('');
      setActionMsg(`Estimated time adjusted to ${mins} minutes`);
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) { setError(err.message); }
  };

  const handleReportDelay = async () => {
    const mins = parseInt(delayInput);
    if (isNaN(mins) || mins <= 0) return;
    try {
      const data = await api.reportDelay(tripId, (trip.delayMinutes || 0) + mins);
      setTrip(data);
      setShowDelayForm(false);
      setDelayInput('');
      setActionMsg(`Delay of ${mins} minutes reported`);
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) { setError(err.message); }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading trip...</div>;
  if (error) return (
    <div className="p-8 max-w-2xl mx-auto text-center">
      <div className="bg-red-50 text-red-600 text-sm p-3 mb-4 rounded">{error}</div>
      <button onClick={fetchTrip} className="bg-blue-600 text-white px-6 py-2 text-sm font-medium hover:bg-blue-700 transition-colors mr-2">Retry</button>
      <Link to="/dashboard" className="border border-gray-400 text-gray-700 px-6 py-2 text-sm bg-white hover:bg-gray-50 transition-colors">Back</Link>
    </div>
  );
  if (!trip) return (
    <div className="p-8 max-w-2xl mx-auto text-center">
      <p className="text-gray-600 mb-4">Trip not found.</p>
      <Link to="/dashboard" className="bg-blue-600 text-white px-6 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">Back to Dashboard</Link>
    </div>
  );

  const stops = route?.stops || [];
  const currentStopIndex = trip.currentStopIndex || 0;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-4">
        <div>
          <Link to="/dashboard" className="text-xs text-blue-600 hover:underline mb-1 inline-block">&larr; Back to Dashboard</Link>
          <h1 className="text-xl md:text-2xl font-semibold">{route?.name || 'Trip Details'}</h1>
          <p className="text-sm text-gray-600">Trip #{trip.tripId || trip._id?.slice(-6)} | Bus: {plateNumber || '--'}</p>
        </div>
        <span className={`px-3 py-1 text-xs font-medium ${trip.status === 'in_progress' ? 'bg-green-100 text-green-700 border border-green-300' : trip.status === 'scheduled' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-600 border border-gray-300'}`}>
          {trip.status?.toUpperCase()}
        </span>
      </div>

      {actionMsg && <div className="bg-green-50 text-green-700 text-sm p-3 mb-4 rounded">{actionMsg}</div>}

      {/* Trip Info Card */}
      <div className="bg-white border border-gray-300 p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div><span className="text-xs text-gray-500 uppercase block">From</span><span className="font-semibold">{route?.startTerminal || '--'}</span></div>
          <div><span className="text-xs text-gray-500 uppercase block">To</span><span className="font-semibold">{route?.endTerminal || '--'}</span></div>
          <div><span className="text-xs text-gray-500 uppercase block">Fare</span><span className="font-semibold">#{route?.fare || '--'}</span></div>
          <div><span className="text-xs text-gray-500 uppercase block">Distance</span><span className="font-semibold">{route?.distance ? `${route.distance} km` : '--'}</span></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mt-3 pt-3 border-t border-gray-100">
          <div><span className="text-xs text-gray-500 uppercase block">Available Seats</span><span className="font-semibold text-lg">{trip.availableSeats ?? '--'}</span></div>
          <div><span className="text-xs text-gray-500 uppercase block">Est. Duration</span><span className="font-semibold">{trip.adjustedDuration || route?.estimatedDuration || '--'} min</span></div>
          <div><span className="text-xs text-gray-500 uppercase block">Delay</span><span className={`font-semibold ${trip.delayMinutes > 0 ? 'text-red-600' : ''}`}>{trip.delayMinutes > 0 ? `+${trip.delayMinutes} min` : 'None'}</span></div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {trip.status === 'scheduled' && (
          <button onClick={handleStart} className="bg-green-600 text-white px-4 py-2 text-sm font-medium hover:bg-green-700 transition-colors">START TRIP</button>
        )}
        {trip.status === 'in_progress' && (
          <button onClick={handleEnd} className="bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700 transition-colors">END TRIP</button>
        )}
        {trip.status === 'in_progress' && (
          <>
            <button onClick={() => { setShowSeatForm(!showSeatForm); setShowTimeForm(false); setShowDelayForm(false); }} className="border border-gray-400 text-gray-700 px-4 py-2 text-sm bg-white hover:bg-gray-50 transition-colors">Update Seats</button>
            <button onClick={() => { setShowTimeForm(!showTimeForm); setShowSeatForm(false); setShowDelayForm(false); }} className="border border-gray-400 text-gray-700 px-4 py-2 text-sm bg-white hover:bg-gray-50 transition-colors">Adjust Time</button>
            <button onClick={() => { setShowDelayForm(!showDelayForm); setShowSeatForm(false); setShowTimeForm(false); }} className="border border-red-400 text-red-600 px-4 py-2 text-sm bg-white hover:bg-red-50 transition-colors">Report Delay</button>
          </>
        )}
      </div>

      {/* Seat Update Form */}
      {showSeatForm && (
        <div className="bg-white border border-gray-300 p-4 mb-4">
          <h3 className="text-sm font-medium mb-2">Update Available Seats</h3>
          <div className="flex gap-2">
            <input type="number" min="0" value={seatInput} onChange={e => setSeatInput(e.target.value)} placeholder="Number of seats" className="border border-gray-300 px-4 py-2 text-sm flex-1 outline-none focus:border-blue-600" />
            <button onClick={handleUpdateSeats} className="bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">Update</button>
            <button onClick={() => setShowSeatForm(false)} className="border border-gray-400 text-gray-700 px-4 py-2 text-sm bg-white hover:bg-gray-50 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Time Adjust Form */}
      {showTimeForm && (
        <div className="bg-white border border-gray-300 p-4 mb-4">
          <h3 className="text-sm font-medium mb-2">Adjust Estimated Duration (minutes)</h3>
          <div className="flex gap-2">
            <input type="number" min="1" value={timeInput} onChange={e => setTimeInput(e.target.value)} placeholder="Duration in minutes" className="border border-gray-300 px-4 py-2 text-sm flex-1 outline-none focus:border-blue-600" />
            <button onClick={handleAdjustTime} className="bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">Update</button>
            <button onClick={() => setShowTimeForm(false)} className="border border-gray-400 text-gray-700 px-4 py-2 text-sm bg-white hover:bg-gray-50 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Delay Form */}
      {showDelayForm && (
        <div className="bg-white border border-gray-300 p-4 mb-4">
          <h3 className="text-sm font-medium mb-2">Report Delay (additional minutes)</h3>
          <div className="flex gap-2">
            <input type="number" min="1" value={delayInput} onChange={e => setDelayInput(e.target.value)} placeholder="Minutes" className="border border-gray-300 px-4 py-2 text-sm flex-1 outline-none focus:border-blue-600" />
            <button onClick={handleReportDelay} className="bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700 transition-colors">Add Delay</button>
            <button onClick={() => setShowDelayForm(false)} className="border border-gray-400 text-gray-700 px-4 py-2 text-sm bg-white hover:bg-gray-50 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Map - ONLY shown when trip is in_progress */}
      {trip.status === 'in_progress' && stops.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-medium text-gray-500 uppercase mb-2">Live Route Map</h2>
          <RealMap
            stops={stops}
            currentStopIndex={currentStopIndex}
            delayMinutes={trip.delayMinutes || 0}
            busId={plateNumber}
            driverName={driverName}
            estimatedDuration={trip.adjustedDuration || route?.estimatedDuration || 120}
            onMarkStopArrived={currentStopIndex < stops.length - 1 ? () => handleMarkStop(currentStopIndex + 1) : null}
            paused={trip.status !== 'in_progress'}
          />
        </div>
      )}

      {/* Stop Timeline - shown for all trip statuses */}
      {stops.length > 0 && (
        <div className="bg-white border border-gray-300 p-4">
          <h2 className="text-sm font-medium text-gray-500 uppercase mb-3">Stops</h2>
          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${trip.status === 'completed' ? 100 : (currentStopIndex / Math.max(stops.length - 1, 1)) * 100}%` }} />
          </div>
          <div className="space-y-3">
            {stops.map((stop, i) => {
              const isCompleted = trip.status === 'completed' || i < currentStopIndex;
              const isCurrent = trip.status === 'in_progress' && i === currentStopIndex;
              const isUpcoming = !isCompleted && !isCurrent;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 border-2 ${isCompleted ? 'bg-green-500 border-green-500' : isCurrent ? 'bg-blue-500 border-blue-500 animate-pulse' : 'bg-white border-gray-300'}`} />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className={`text-sm font-medium ${isCurrent ? 'text-blue-700' : isCompleted ? 'text-green-700 line-through' : 'text-gray-900'}`}>{stop.name}</p>
                      {isCurrent && trip.status === 'in_progress' && (
                        <button onClick={() => handleMarkStop(i)} className="text-xs bg-blue-600 text-white px-2 py-1 hover:bg-blue-700 transition-colors">Mark Arrived</button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{stop.estimatedArrival || ''}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
