import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function MapView() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/routes?status=active`).then(r => r.ok ? r.json() : []).then(data => { setRoutes(data); if (data.length > 0) setSelectedRoute(data[0]); }).catch(() => {});
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Live Map</h1>
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:h-[500px]">
        <div className="flex-1 bg-white border border-gray-300 p-0 overflow-hidden relative min-h-[300px] lg:min-h-0">
          <div className="bg-gray-100 h-full min-h-[300px] lg:min-h-0 flex items-center justify-center">
            <svg className="w-16 h-16 md:w-20 md:h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.447-.894L15 7m0 13V7" />
            </svg>
          </div>
          <div className="absolute top-4 left-4 bg-white border border-gray-300 py-2 px-3">
            <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Fleet Overlay</h3>
            <label className="flex items-center gap-2 text-xs mb-1"><input type="checkbox" defaultChecked className="w-3 h-3" /> Active Routes</label>
            <label className="flex items-center gap-2 text-xs mb-1"><input type="checkbox" defaultChecked className="w-3 h-3" /> Traffic Density</label>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" className="w-3 h-3" /> Station Nodes</label>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
            {routes.map(r => (
              <button key={r._id} onClick={() => setSelectedRoute(r)} className={`text-xs px-3 py-1 ${selectedRoute?._id === r._id ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300'}`}>{r.routeId}</button>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-80 bg-white border border-gray-300 p-4 md:p-6 overflow-y-auto">
          {selectedRoute ? (
            <>
              <h2 className="text-base md:text-lg font-semibold mb-1">{selectedRoute.name}</h2>
              <p className="text-xs md:text-sm text-gray-600 mb-4">Route ID: {selectedRoute.routeId}</p>
              <div className="space-y-2 md:space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">From</span><span className="font-medium">{selectedRoute.startTerminal}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">To</span><span className="font-medium">{selectedRoute.endTerminal}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Distance</span><span className="font-medium">{selectedRoute.distance} km</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Fare</span><span className="font-medium text-blue-600">#{selectedRoute.fare?.toLocaleString() || 0}</span></div>
              </div>
              <div className="mt-4">
                <span className="text-xs font-medium text-gray-500 uppercase">Stops</span>
                <div className="mt-2 space-y-1">
                  {selectedRoute.stops?.map((stop, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs flex-shrink-0">{i + 1}</span>
                      <span>{stop.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">Select a route to view details</p>
          )}
        </div>
      </div>
    </div>
  );
}
