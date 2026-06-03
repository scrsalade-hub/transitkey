import { useState, useEffect } from 'react';
import { localStore } from '../lib/localStore.js';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const notifs = localStore.getNotifications().filter(n => !n.targetRole || n.targetRole === 'operator');
    setNotifications(notifs);
    setLoading(false);
  }, []);

  const markAllRead = () => {
    localStore.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Notifications</h1>
          <p className="text-sm text-gray-600">System alerts and complaint notifications.</p>
        </div>
        <button onClick={markAllRead} className="border border-gray-400 text-gray-700 px-4 py-2 text-xs bg-white hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-1 w-full sm:w-auto justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.length > 0 ? notifications.map(n => (
          <div key={n._id} className={`bg-white border p-4 ${n.type === 'emergency' || n.type === 'complaint' ? 'border-red-500 bg-red-50' : 'border-gray-300'} ${n.read ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-3">
              {n.type === 'emergency' || n.type === 'complaint' ? (
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              ) : (
                <svg className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h3 className={`text-sm font-semibold ${n.type === 'emergency' || n.type === 'complaint' ? 'text-red-700' : ''}`}>{n.title}</h3>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${n.type === 'emergency' || n.type === 'complaint' ? 'text-red-700' : 'text-gray-600'}`}>{n.message}</p>
              </div>
            </div>
          </div>
        )) : (
          <div className="bg-white border border-gray-300 p-8 text-center">
            <p className="text-gray-500 text-sm">{loading ? 'Loading...' : 'No notifications yet.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
