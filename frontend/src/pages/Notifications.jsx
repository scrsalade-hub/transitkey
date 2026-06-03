import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Notifications() {
  const { getToken } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/notifications`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (res.ok) { const data = await res.json(); setNotifications(data); }
    } catch (e) { console.error(e); }
  };

  const markAllRead = async () => {
    try {
      const token = getToken();
      await fetch(`${API_URL}/notifications/read-all`, { method: 'PUT', headers: token ? { Authorization: `Bearer ${token}` } : {} });
      fetchNotifications();
    } catch (e) { console.error(e); }
  };

  const filtered = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);

  const getIcon = (type) => {
    if (type === 'emergency') return <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
    if (type === 'route_update') return <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.447-.894L15 7m0 13V7" /></svg>;
    return <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Notifications</h1>
          <p className="text-sm text-gray-600">Stay updated with your latest transport alerts and status updates.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={markAllRead} className="border border-gray-400 text-gray-700 px-3 py-2 text-xs bg-white hover:bg-gray-50 transition-colors flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Mark all as read
          </button>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="border border-gray-300 px-3 py-2 text-xs outline-none focus:border-blue-600 bg-white">
            <option value="all">All</option>
            <option value="emergency">Emergency</option>
            <option value="route_update">Route Updates</option>
            <option value="system_alert">System Alerts</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(n => (
          <div key={n._id} className={`bg-white border p-4 ${n.type === 'emergency' ? 'border-red-500 bg-red-50' : 'border-gray-300'} ${!n.isRead ? 'border-l-4 border-l-blue-600' : ''}`}>
            <div className="flex items-start gap-3">
              {getIcon(n.type)}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-sm font-semibold">{n.title}</h3>
                  <span className="text-xs text-gray-500 flex-shrink-0">{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{n.message}</p>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="bg-white border border-gray-300 p-8 text-center text-gray-500 text-sm">No notifications to display.</div>
        )}
      </div>

      {notifications.length > 0 && (
        <button className="w-full mt-4 border border-gray-400 text-gray-700 px-6 py-2 text-sm bg-white hover:bg-gray-50 transition-colors">Load older notifications</button>
      )}
    </div>
  );
}
