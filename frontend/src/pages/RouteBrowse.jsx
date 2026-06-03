import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function RouteBrowse() {
  const [routes, setRoutes] = useState([]);
  const [filter, setFilter] = useState({ search: '', start: '', end: '' });

  useEffect(() => { fetchRoutes(); }, []);

  const fetchRoutes = async () => {
    try {
      const res = await fetch(`${API_URL}/routes?status=active`);
      if (res.ok) { const data = await res.json(); setRoutes(data); }
    } catch (e) { console.error(e); }
  };

  const filteredRoutes = routes.filter(r => {
    if (filter.search && !r.name?.toLowerCase().includes(filter.search.toLowerCase())) return false;
    if (filter.start && !r.startTerminal?.toLowerCase().includes(filter.start.toLowerCase())) return false;
    if (filter.end && !r.endTerminal?.toLowerCase().includes(filter.end.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-xl md:text-2xl font-semibold mb-2">Browse Routes</h1>
      <p className="text-sm text-gray-600 mb-4 md:mb-6">Explore available transit routes and schedules.</p>

      <div className="bg-white border border-gray-300 p-4 mb-4 md:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Search</label>
            <input type="text" placeholder="Route name..." value={filter.search} onChange={e => setFilter(p => ({ ...p, search: e.target.value }))} className="w-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-600" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">From</label>
            <input type="text" placeholder="Start terminal..." value={filter.start} onChange={e => setFilter(p => ({ ...p, start: e.target.value }))} className="w-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-600" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">To</label>
            <input type="text" placeholder="End terminal..." value={filter.end} onChange={e => setFilter(p => ({ ...p, end: e.target.value }))} className="w-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {filteredRoutes.map(route => (
          <div key={route._id} className="bg-white border border-gray-300 p-4 md:p-6">
            <div className="flex flex-wrap justify-between items-start mb-3 gap-2">
              <h3 className="text-base md:text-lg font-semibold">{route.name}</h3>
              <span className="border border-gray-400 text-gray-700 px-3 py-1 text-xs uppercase">{route.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div><span className="text-gray-500 block text-xs">From</span><span className="font-medium">{route.startTerminal}</span></div>
              <div><span className="text-gray-500 block text-xs">To</span><span className="font-medium">{route.endTerminal}</span></div>
              <div><span className="text-gray-500 block text-xs">Distance</span><span className="font-medium">{route.distance} km</span></div>
              <div><span className="text-gray-500 block text-xs">Duration</span><span className="font-medium">{route.estimatedDuration} mins</span></div>
              <div><span className="text-gray-500 block text-xs">Fare</span><span className="font-medium text-blue-600">#{route.fare?.toLocaleString() || 0}</span></div>
              <div><span className="text-gray-500 block text-xs">Stops</span><span className="font-medium">{route.stops?.length || 0}</span></div>
            </div>
            <div className="mb-4">
              <span className="text-gray-500 text-xs block mb-1">Stops:</span>
              <div className="flex flex-wrap gap-2">
                {route.stops?.map((stop, i) => (
                  <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-1">{stop.name}</span>
                ))}
              </div>
            </div>
            <Link to={`/routes/${route._id}`} className="block w-full text-center bg-blue-600 text-white px-6 py-3 text-sm font-medium hover:bg-blue-700 transition-colors">View Details</Link>
          </div>
        ))}
        {filteredRoutes.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 bg-white border border-gray-300">No routes match your filters.</div>
        )}
      </div>
    </div>
  );
}
