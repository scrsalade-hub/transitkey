import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';

export default function RouteManage() {
  const [routes, setRoutes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '', startTerminal: '', endTerminal: '', distance: '', estimatedDuration: '', fare: '',
    stops: [{ name: '', estimatedArrival: '' }]
  });

  useEffect(() => { fetchRoutes(); }, []);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const data = await api.getRoutes();
      setRoutes(data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleAddStop = () => {
    setForm(p => ({ ...p, stops: [...p.stops, { name: '', estimatedArrival: '' }] }));
  };

  const handleStopChange = (i, field, value) => {
    const newStops = [...form.stops];
    newStops[i][field] = value;
    setForm(p => ({ ...p, stops: newStops }));
  };

  const handleRemoveStop = (i) => {
    if (form.stops.length <= 1) return;
    setForm(p => ({ ...p, stops: p.stops.filter((_, idx) => idx !== i) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const routeData = {
      name: form.name,
      routeId: 'RTE-' + Math.floor(100 + Math.random() * 900),
      startTerminal: form.startTerminal,
      endTerminal: form.endTerminal,
      distance: parseFloat(form.distance),
      estimatedDuration: parseFloat(form.estimatedDuration),
      fare: parseFloat(form.fare),
      status: 'active',
      stops: form.stops.filter(s => s.name.trim()),
    };
    try {
      await api.createRoute(routeData);
      await fetchRoutes();
      setShowForm(false);
      setForm({ name: '', startTerminal: '', endTerminal: '', distance: '', estimatedDuration: '', fare: '', stops: [{ name: '', estimatedArrival: '' }] });
    } catch (err) { alert('Failed to create route: ' + err.message); }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-xl md:text-2xl font-semibold">Route Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-1 w-full sm:w-auto justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Add New Route
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-300 p-4 md:p-6 mb-6 space-y-4">
          <h3 className="text-base md:text-lg font-semibold">Create New Route</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><label className="block text-xs font-medium text-gray-500 uppercase mb-1">Route Name</label><input type="text" className="border border-gray-300 px-4 py-3 w-full text-sm outline-none focus:border-blue-600" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
            <div><label className="block text-xs font-medium text-gray-500 uppercase mb-1">Start Terminal</label><input type="text" className="border border-gray-300 px-4 py-3 w-full text-sm outline-none focus:border-blue-600" value={form.startTerminal} onChange={e => setForm(p => ({ ...p, startTerminal: e.target.value }))} required /></div>
            <div><label className="block text-xs font-medium text-gray-500 uppercase mb-1">End Terminal</label><input type="text" className="border border-gray-300 px-4 py-3 w-full text-sm outline-none focus:border-blue-600" value={form.endTerminal} onChange={e => setForm(p => ({ ...p, endTerminal: e.target.value }))} required /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className="block text-xs font-medium text-gray-500 uppercase mb-1">Distance (km)</label><input type="number" step="0.1" className="border border-gray-300 px-4 py-3 w-full text-sm outline-none focus:border-blue-600" value={form.distance} onChange={e => setForm(p => ({ ...p, distance: e.target.value }))} required /></div>
            <div><label className="block text-xs font-medium text-gray-500 uppercase mb-1">Duration (mins)</label><input type="number" className="border border-gray-300 px-4 py-3 w-full text-sm outline-none focus:border-blue-600" value={form.estimatedDuration} onChange={e => setForm(p => ({ ...p, estimatedDuration: e.target.value }))} required /></div>
            <div><label className="block text-xs font-medium text-gray-500 uppercase mb-1">Fare (#)</label><input type="number" className="border border-gray-300 px-4 py-3 w-full text-sm outline-none focus:border-blue-600" value={form.fare} onChange={e => setForm(p => ({ ...p, fare: e.target.value }))} required /></div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Stops</label>
            {form.stops.map((stop, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2 items-end">
                <input type="text" className="border border-gray-300 px-4 py-3 w-full text-sm outline-none focus:border-blue-600" placeholder="Stop name" value={stop.name} onChange={e => handleStopChange(i, 'name', e.target.value)} />
                <input type="text" className="border border-gray-300 px-4 py-3 w-full text-sm outline-none focus:border-blue-600" placeholder="ETA e.g. 08:30 AM" value={stop.estimatedArrival} onChange={e => handleStopChange(i, 'estimatedArrival', e.target.value)} />
                <button type="button" onClick={() => handleRemoveStop(i)} className="text-red-600 text-sm hover:underline text-left">Remove</button>
              </div>
            ))}
            <button type="button" onClick={handleAddStop} className="text-blue-600 text-sm hover:underline mt-1">+ Add another stop</button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="submit" className="bg-blue-600 text-white px-6 py-3 text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer w-full sm:w-auto">Create Route</button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-gray-400 text-gray-700 px-6 py-3 text-sm bg-white hover:bg-gray-50 transition-colors cursor-pointer w-full sm:w-auto">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white border border-gray-300 p-4 md:p-6 overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-2">Route ID</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-2">Name</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-2">Start</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-2">End</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-2">Stops</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-2">Fare</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {routes.map(route => (
              <tr key={route._id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-2 text-sm font-mono">{route.routeId}</td>
                <td className="py-3 px-2 text-sm font-medium">{route.name}</td>
                <td className="py-3 px-2 text-sm">{route.startTerminal}</td>
                <td className="py-3 px-2 text-sm">{route.endTerminal}</td>
                <td className="py-3 px-2 text-sm">{route.stops?.length || 0}</td>
                <td className="py-3 px-2 text-sm">#{route.fare?.toLocaleString() || 0}</td>
                <td className="py-3 px-2"><span className={`border px-2 py-0.5 text-xs ${route.status === 'active' ? 'border-green-500 text-green-700' : 'border-gray-400 text-gray-700'}`}>{route.status}</span></td>
              </tr>
            ))}
            {routes.length === 0 && (
              <tr><td colSpan="7" className="py-8 text-center text-gray-500 text-sm">{loading ? 'Loading routes...' : 'No routes created yet. Click "Add New Route" to get started.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
