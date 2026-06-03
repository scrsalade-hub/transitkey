import { useState } from 'react';

const delays = [
  { route: 'ROUTE S-09', delay: '+14m', reason: 'Mechanical failure reported near Central St.', critical: true },
  { route: 'ROUTE S-09', delay: '+14m', reason: 'Mechanical failure reported near Central St.', critical: false },
];

const drivers = [
  { name: 'Adewale Musa', id: 'ID 402', status: 'Active' },
  { name: 'Yakubu Lawal', id: 'ID 118', status: 'Active' },
  { name: 'Chinedu Eze', id: 'ID 889', status: 'Idle' },
];

export default function MapView() {
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
        <div className="w-full lg:w-2/3 bg-white border border-gray-300 overflow-hidden relative" style={{ minHeight: '400px' }}>
          <div className="bg-gray-100 h-full flex items-center justify-center absolute inset-0">
            <svg className="w-16 h-16 md:w-20 md:h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.447-.894L15 7m0 13V7" />
            </svg>
          </div>
          <div className="absolute top-4 left-4 bg-white border border-gray-300 py-3 px-4 z-10 max-w-[180px]">
            <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Fleet Overlay</h3>
            <label className="flex items-center gap-2 text-sm mb-1"><input type="checkbox" defaultChecked className="w-3 h-3" /> Active Routes</label>
            <label className="flex items-center gap-2 text-sm mb-1"><input type="checkbox" defaultChecked className="w-3 h-3" /> Traffic Density</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="w-3 h-3" /> Station Nodes</label>
          </div>
          <div className="absolute top-1/3 left-1/4 z-10">
            <button onClick={() => setSelectedVehicle('R-102')} className="bg-gray-800 text-white text-xs px-2 py-1 flex items-center gap-1">
              R-102 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            </button>
          </div>
          <div className="absolute bottom-1/3 left-1/4 z-10">
            <button onClick={() => setSelectedVehicle('S-09')} className="bg-red-600 text-white text-xs px-2 py-1 flex items-center gap-1">
              S-09 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </button>
          </div>
          <div className="absolute top-1/2 right-1/3 z-10">
            <button onClick={() => setSelectedVehicle('X-45')} className="bg-white border border-gray-300 text-xs px-2 py-1 flex items-center gap-1">
              X-45 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            </button>
          </div>
        </div>

        <div className="w-full lg:w-1/3 space-y-4 overflow-y-auto">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-medium text-gray-500 uppercase">Current Delays</h3>
              <span className="border border-red-500 text-red-600 px-2 py-0.5 text-xs">3 CRITICAL</span>
            </div>
            <div className="space-y-2">
              {delays.map((d, i) => (
                <div key={i} className={`bg-white border p-3 ${d.critical ? 'border-red-500' : 'border-gray-300'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="text-sm font-medium">{d.route}</span>
                    </div>
                    <span className="text-sm text-red-600 font-medium">{d.delay}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{d.reason}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">Driver Status</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white border border-gray-300 p-3 text-center">
                <p className="text-xl md:text-2xl font-bold">42</p>
                <p className="text-xs text-gray-500 uppercase">Active</p>
              </div>
              <div className="bg-white border border-gray-300 p-3 text-center">
                <p className="text-xl md:text-2xl font-bold">08</p>
                <p className="text-xs text-gray-500 uppercase">Idle</p>
              </div>
            </div>
            <div className="space-y-2">
              {drivers.map((d, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span>{d.name} ({d.id})</span>
                  <span className={d.status === 'Active' ? 'text-green-600' : 'text-gray-500'}>{d.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-300 p-4 md:p-6">
            <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Selected Route Details</h3>
            {selectedVehicle ? (
              <div className="text-sm">
                <p className="font-medium">Vehicle: {selectedVehicle}</p>
                <p className="text-gray-600">Route details will appear here when a vehicle is selected on the map.</p>
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-4">Select a vehicle on the map to view details</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
