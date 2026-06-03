import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function RouteDetails() {
  const { id } = useParams();
  const [route, setRoute] = useState(null);

  useEffect(() => { fetchRoute(); }, [id]);

  const fetchRoute = async () => {
    try {
      const res = await fetch(`${API_URL}/routes/${id}`);
      if (res.ok) { const data = await res.json(); setRoute(data); }
    } catch (e) { console.error(e); }
  };

  if (!route) return <div className="p-4 md:p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-xl md:text-2xl font-semibold mb-2">{route.name}</h1>
      <p className="text-sm text-gray-600 mb-4 md:mb-6">Route ID: {route.routeId}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white border border-gray-300 p-4 md:p-6 text-center">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</span>
          <p className="text-xl md:text-2xl font-bold mt-1">{route.distance} km</p>
        </div>
        <div className="bg-white border border-gray-300 p-4 md:p-6 text-center">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</span>
          <p className="text-xl md:text-2xl font-bold mt-1">{route.estimatedDuration} mins</p>
        </div>
        <div className="bg-white border border-gray-300 p-4 md:p-6 text-center">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fare</span>
          <p className="text-xl md:text-2xl font-bold mt-1 text-blue-600">#{route.fare?.toLocaleString() || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white border border-gray-300 p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold mb-4">Route Info</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Start Terminal</span><span className="font-medium">{route.startTerminal}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">End Terminal</span><span className="font-medium">{route.endTerminal}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="border border-gray-400 text-gray-700 px-3 py-1 text-xs uppercase">{route.status}</span></div>
          </div>
        </div>

        <div className="bg-white border border-gray-300 p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold mb-4">Stop Schedule</h2>
          <div className="space-y-2">
            {route.stops?.map((stop, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                <span className="font-medium flex-1">{stop.name}</span>
                <span className="text-gray-500 text-xs">{stop.estimatedArrival}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-300 mt-4 md:mt-6 p-4 md:p-6">
        <div className="bg-gray-100 h-48 md:h-64 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.447-.894L15 7m0 13V7" />
            </svg>
            <p className="text-gray-500 text-sm">Route Map View</p>
          </div>
        </div>
      </div>
    </div>
  );
}
