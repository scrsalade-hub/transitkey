import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { user, logout } = useAuth();
  const operatorData = user?.user || {};

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto">
      <h1 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Profile</h1>
      <div className="bg-white border border-gray-300 p-4 md:p-6 mb-4 md:mb-6">
        <h2 className="text-base md:text-lg font-semibold mb-4">Operator Information</h2>
        <div className="space-y-3 text-sm">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1"><span className="text-gray-500">Company Name</span><span className="font-medium">{operatorData.companyName || 'N/A'}</span></div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1"><span className="text-gray-500">Operator ID</span><span className="font-medium">{operatorData.operatorId || 'N/A'}</span></div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1"><span className="text-gray-500">Phone</span><span className="font-medium">{operatorData.phoneNumber || 'N/A'}</span></div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1"><span className="text-gray-500">Email</span><span className="font-medium">{operatorData.email || 'N/A'}</span></div>
        </div>
      </div>

      <div className="bg-white border border-gray-300 p-4 md:p-6 mb-4 md:mb-6">
        <h2 className="text-base md:text-lg font-semibold mb-4">Account Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Change Password</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input type="password" className="border border-gray-300 px-4 py-3 w-full text-sm outline-none focus:border-blue-600 transition-colors flex-1" placeholder="New password" />
              <button className="border border-gray-400 text-gray-700 px-4 py-2 text-xs bg-white hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap w-full sm:w-auto">Update</button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Notification Preferences</label>
            <label className="flex items-center gap-2 text-sm mb-2"><input type="checkbox" defaultChecked className="w-4 h-4" /> Driver alerts</label>
            <label className="flex items-center gap-2 text-sm mb-2"><input type="checkbox" defaultChecked className="w-4 h-4" /> System alerts</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="w-4 h-4" /> Revenue reports</label>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-300 p-4 md:p-6 mb-4 md:mb-6">
        <h2 className="text-base md:text-lg font-semibold mb-4">Company Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Company Name</label>
            <input type="text" className="border border-gray-300 px-4 py-3 w-full text-sm outline-none focus:border-blue-600 transition-colors" defaultValue={operatorData.companyName || ''} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Phone Number</label>
            <input type="tel" className="border border-gray-300 px-4 py-3 w-full text-sm outline-none focus:border-blue-600 transition-colors" defaultValue={operatorData.phoneNumber || ''} />
          </div>
          <button className="border border-gray-400 text-gray-700 px-6 py-2 text-xs bg-white hover:bg-gray-50 transition-colors cursor-pointer w-full sm:w-auto">Save Changes</button>
        </div>
      </div>

      <button onClick={logout} className="bg-blue-600 text-white px-6 py-3 text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer w-full flex items-center justify-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        LOG OUT
      </button>
    </div>
  );
}
