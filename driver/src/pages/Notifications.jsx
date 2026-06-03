import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Notifications() {
  const { getToken } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/notifications`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (res.ok) { const data = await res.json(); setNotifications(data); }
    } catch (e) { console.error(e); }
  };

  const markAllRead = async () => {
    try { await fetch(`${API_URL}/notifications/read-all`, { method: 'PUT', headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {} }); fetchNotifications(); }
    catch (e) { console.error(e); }
  };

  const getSection = (type) => {
    switch (type) { case 'emergency': return 'EMERGENCY ALERT'; case 'route_update': return 'TRIP UPDATES'; case 'operator_message': return 'OPERATOR MESSAGES'; case 'delay': return 'DELAYS'; default: return 'UPDATES'; }
  };

  const grouped = notifications.reduce((acc, n) => { const k = n.type; if (!acc[k]) acc[k] = []; acc[k].push(n); return acc; }, {});

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Notifications</h1>
          <p className="text-sm text-gray-600">Stay updated with your latest transport alerts and status updates.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={markAllRead} className="border border-gray-400 text-gray-700 px-3 py-2 text-xs bg-white hover:bg-gray-50 transition-colors flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Mark all as read
          </button>
          <button className="border border-gray-400 text-gray-700 px-3 py-2 text-xs bg-white hover:bg-gray-50 transition-colors flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>Filter
          </button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white border border-gray-300 p-8 text-center"><p className="text-gray-500 text-sm">No notifications yet.</p></div>
      ) : (
      <div className="space-y-6">
        {Object.entries(grouped).map(([type, items]) => (
          <div key={type}>
            <div className="flex items-center gap-2 mb-3">
              {type === 'emergency' && <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
              {type === 'route_update' && <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.447-.894L15 7m0 13V7" /></svg>}
              {type === 'operator_message' && <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}
              {type === 'delay' && <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              <h3 className={`text-xs md:text-sm font-semibold uppercase ${type === 'emergency' ? 'text-red-600' : 'text-gray-700'}`}>{getSection(type)}</h3>
            </div>
            <div className="space-y-2">
              {items.map(item => (
                <div key={item._id} className={`bg-white border p-3 md:p-4 ${type === 'emergency' ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}>
                  <div className="flex justify-between items-start gap-2">
                    <h4 className={`text-xs md:text-sm font-semibold ${type === 'emergency' ? 'text-red-700' : ''}`}>{item.title}</h4>
                    <span className="text-xs text-gray-500 flex-shrink-0">{item.createdAt ? (Date.now() - new Date(item.createdAt).getTime() < 3600000 ? `${Math.ceil((Date.now() - new Date(item.createdAt).getTime()) / 60000)}m ago` : `${Math.ceil((Date.now() - new Date(item.createdAt).getTime()) / 3600000)}hr ago`) : ''}</span>
                  </div>
                  <p className={`text-xs md:text-sm mt-1 ${type === 'emergency' ? 'text-red-700' : 'text-gray-600'}`}>{item.message}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      )}

      {notifications.length > 0 && (
        <button className="w-full mt-4 md:mt-6 border border-gray-400 text-gray-700 px-6 py-2 text-sm bg-white hover:bg-gray-50 transition-colors">Load older notifications</button>
      )}
    </div>
  );
}
