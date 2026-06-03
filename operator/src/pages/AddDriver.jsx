import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { localStore } from '../lib/localStore.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function generateAccessToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = 'TKD-';
  for (let i = 0; i < 12; i++) token += chars.charAt(Math.floor(Math.random() * chars.length));
  return token;
}

export default function AddDriver() {
  const { getToken } = useAuth();
  const [form, setForm] = useState({
    fullName: '', phoneNumber: '', email: '', plateNumber: '', busType: '',
    licenseNumber: '', licenseType: 'Commercial Driver License', yearsOfExperience: '', vehicleClass: ''
  });
  const [generatedToken, setGeneratedToken] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setGeneratedToken(null);
    setLoading(true);

    const driverData = {
      ...form,
      yearsOfExperience: parseInt(form.yearsOfExperience) || 0,
      accessToken: generateAccessToken(),
      status: 'active',
      standing: 'good standing',
      driverId: `TMS-DR-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    // Always save to localStore first (this is the source of truth when API is down)
    const saved = localStore.addDriver(driverData);

    // Also create a trip for this driver using the first available route
    const routes = localStore.getRoutes();
    if (routes.length > 0) {
      const route = routes[0];
      localStore.addTrip({
        routeId: route._id,
        route: route,
        driverId: saved._id,
        driver: { _id: saved._id, fullName: saved.fullName, plateNumber: saved.plateNumber },
        bus: { _id: 'bus_' + saved._id.slice(-4), plateNumber: saved.plateNumber, model: saved.busType || 'Bus', type: saved.busType || 'Standard' },
        tripId: 'TRIP-' + Math.floor(100 + Math.random() * 900),
        status: 'in_progress',
      });
    }

    // Try API too
    try {
      const token = getToken();
      if (token) {
        await fetch(`${API_URL}/drivers/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(driverData)
        });
      }
    } catch { /* API unavailable - localStore already has it */ }

    setGeneratedToken(saved.accessToken);
    setForm({ fullName: '', phoneNumber: '', email: '', plateNumber: '', busType: '', licenseNumber: '', licenseType: 'Commercial Driver License', yearsOfExperience: '', vehicleClass: '' });
    setLoading(false);
  };

  const copyToken = () => {
    navigator.clipboard?.writeText(generatedToken);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-xl md:text-2xl font-semibold mb-1">Add New Driver</h1>
      <p className="text-sm text-gray-600 mb-4 md:mb-6">Register a new driver to your fleet. A unique access token will be generated for them.</p>

      {generatedToken && (
        <div className="bg-green-50 border border-green-300 p-4 md:p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <h3 className="text-green-800 font-semibold">Driver Created Successfully!</h3>
          </div>
          <p className="text-green-700 text-sm mb-3">Share this access token with the driver. They will use it to log in and view their assignments.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 bg-white border border-green-300 px-4 py-3 font-mono text-sm text-green-900 select-all">
              {generatedToken}
            </div>
            <button onClick={copyToken} className="bg-green-600 text-white px-4 py-3 text-sm font-medium hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap">
              Copy Token
            </button>
          </div>
        </div>
      )}

      {error && <div className="bg-red-50 text-red-600 text-sm p-3 mb-4 rounded">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-300 p-4 md:p-6 space-y-4">
        <h2 className="text-base md:text-lg font-semibold mb-2">Driver Information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Full Name *</label>
            <input type="text" name="fullName" value={form.fullName} onChange={handleChange} required className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600" placeholder="e.g. Adewale Musa" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Phone Number *</label>
            <input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} required className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600" placeholder="e.g. +234 801 234 5678" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Email Address *</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600" placeholder="e.g. driver@email.com" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Bus Plate Number *</label>
            <input type="text" name="plateNumber" value={form.plateNumber} onChange={handleChange} required className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600" placeholder="e.g. LND472YK" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Bus Type</label>
            <select name="busType" value={form.busType} onChange={handleChange} className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600 bg-white">
              <option value="">Select bus type...</option>
              <option value="BRT">BRT (Bus Rapid Transit)</option>
              <option value="Danfo">Danfo</option>
              <option value="Luxury Coach">Luxury Coach</option>
              <option value="Mini Bus">Mini Bus</option>
              <option value="Shuttle">Shuttle</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">License Number</label>
            <input type="text" name="licenseNumber" value={form.licenseNumber} onChange={handleChange} className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600" placeholder="e.g. DRV-2024-001" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">License Type</label>
            <select name="licenseType" value={form.licenseType} onChange={handleChange} className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600 bg-white">
              <option value="Commercial Driver License">Commercial Driver License</option>
              <option value="Heavy Duty License">Heavy Duty License</option>
              <option value="Public Transport License">Public Transport License</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Vehicle Class</label>
            <select name="vehicleClass" value={form.vehicleClass} onChange={handleChange} className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600 bg-white">
              <option value="">Select class...</option>
              <option value="Class A">Class A</option>
              <option value="Class B">Class B</option>
              <option value="Class C">Class C</option>
              <option value="Class D">Class D</option>
            </select>
          </div>
        </div>

        <div className="sm:w-1/2">
          <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Years of Experience</label>
          <input type="number" name="yearsOfExperience" value={form.yearsOfExperience} onChange={handleChange} min="0" className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600" placeholder="e.g. 5" />
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-3 text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 w-full sm:w-auto">
            {loading ? 'Creating...' : 'Create Driver & Generate Token'}
          </button>
          {generatedToken && (
            <button type="button" onClick={() => { setGeneratedToken(null); setError(''); }} className="border border-gray-400 text-gray-700 px-6 py-3 text-sm bg-white hover:bg-gray-50 transition-colors cursor-pointer w-full sm:w-auto">
              Add Another Driver
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
