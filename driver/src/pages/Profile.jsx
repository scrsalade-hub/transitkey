import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { user, logout } = useAuth();
  const driverData = user?.user || {};

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
        <div className="md:col-span-2 bg-white border border-gray-300 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-14 h-14 md:w-20 md:h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap justify-between items-start mb-4 gap-2">
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase block">Driver Identity</span>
                  <h2 className="text-lg md:text-xl font-semibold">{driverData.fullName || '--'}</h2>
                </div>
                <span className="border border-gray-400 text-gray-700 px-3 py-1 text-xs flex items-center gap-1 flex-shrink-0">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> ACTIVE DRIVER
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-sm">
                <div><span className="text-gray-500 text-xs block">Driver ID</span><span className="font-medium">{driverData.driverId || '--'}</span></div>
                <div><span className="text-gray-500 text-xs block">License Type</span><span className="font-medium">{driverData.licenseType || '--'}</span></div>
                <div><span className="text-gray-500 text-xs block">License Number</span><span className="font-medium">{driverData.licenseNumber || '--'}</span></div>
                <div><span className="text-gray-500 text-xs block">Expiry Date</span><span className="font-medium">{driverData.licenseExpiry ? new Date(driverData.licenseExpiry).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '--'}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-300 p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            <h3 className="text-base md:text-lg font-semibold">Assigned Vehicle</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Bus Plate Number</span><span className="font-medium">{driverData.plateNumber || '--'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Vehicle Model</span><span className="font-medium">{driverData.busType || '--'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Passenger Capacity</span><span className="font-medium">{driverData.assignedBus?.capacity ? `${driverData.assignedBus.capacity} Seats` : '--'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Vehicle Class</span><span className="font-medium">{driverData.vehicleClass || '--'}</span></div>
          </div>
          <button disabled className="w-full mt-4 border border-gray-300 text-gray-400 px-4 py-2 text-xs bg-gray-50 cursor-not-allowed">VEHICLE DETAILS</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
        <div className="bg-white border border-gray-300 p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            <h3 className="text-base md:text-lg font-semibold">Performance Summary</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="border border-gray-300 p-3 md:p-4"><span className="text-xs text-gray-500">Total Distance Traveled</span><p className="text-lg md:text-xl font-bold mt-1">{driverData.performance?.totalDistance ? `${driverData.performance.totalDistance.toLocaleString()} km` : '--'}</p></div>
            <div className="border border-gray-300 p-3 md:p-4"><span className="text-xs text-gray-500">Passenger Rating</span><p className="text-lg md:text-xl font-bold mt-1">{driverData.performance?.passengerRating ? `${driverData.performance.passengerRating}/5` : '--'}</p></div>
          </div>
          <div className="mt-4"><span className="text-xs text-gray-500 block mb-1">Completed Trips</span><p className="text-lg md:text-xl font-bold">{driverData.performance?.completedTrips ?? '--'}</p></div>
          <a href="#" className="text-blue-600 text-sm hover:underline mt-4 block">View Detailed Trip History</a>
        </div>

        <div className="bg-white border border-gray-300 p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <h3 className="text-base md:text-lg font-semibold">Account Settings</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="text-xs text-gray-500 block mb-1">Password</label><span className="text-lg">&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;</span></div>
              <div><label className="text-xs text-gray-500 block mb-1">Language</label><select className="w-full border border-gray-300 px-3 py-2 text-xs outline-none focus:border-blue-600 bg-white"><option>English (US)</option></select></div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-2">Notification Preferences</label>
              <label className="flex items-center gap-2 text-sm mb-2"><input type="checkbox" defaultChecked className="w-4 h-4 border border-gray-300 rounded" /> Route Assignment Alerts</label>
              <label className="flex items-center gap-2 text-sm mb-2"><input type="checkbox" defaultChecked className="w-4 h-4 border border-gray-300 rounded" /> Vehicle Maintenance Reminders</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="w-4 h-4 border border-gray-300 rounded" /> Promotions & System Updates</label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 max-w-md ml-auto">
        <button className="w-full border border-gray-400 text-gray-700 px-4 py-3 text-sm bg-white hover:bg-gray-50 transition-colors flex items-center justify-between">
          <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Contact Support</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
        <button onClick={logout} className="w-full bg-blue-600 text-white px-6 py-3 text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          LOG OUT
        </button>
      </div>
    </div>
  );
}
