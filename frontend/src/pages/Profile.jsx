import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { user, logout } = useAuth();
  const userData = user?.user || user;

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto">
      <h1 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Profile</h1>
      <div className="bg-white border border-gray-300 p-4 md:p-6 mb-4 md:mb-6">
        <h2 className="text-base md:text-lg font-semibold mb-4">Account Information</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Full Name</span><span className="font-medium">{userData?.fullName || 'N/A'}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-medium">{userData?.phoneNumber || 'N/A'}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-medium">{userData?.email || 'N/A'}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Member Since</span><span className="font-medium">{userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}</span></div>
        </div>
      </div>

      <div className="bg-white border border-gray-300 p-4 md:p-6 mb-4 md:mb-6">
        <h2 className="text-base md:text-lg font-semibold mb-4">Account Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Change Password</label>
            <div className="flex gap-2">
              <input type="password" placeholder="New password" className="flex-1 border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-600" />
              <button className="border border-gray-400 text-gray-700 px-4 py-2 text-xs bg-white hover:bg-gray-50 transition-colors whitespace-nowrap">Update</button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Notification Preferences</label>
            <label className="flex items-center gap-2 text-sm mb-2"><input type="checkbox" defaultChecked className="w-4 h-4 border border-gray-300 rounded" /> Trip updates</label>
            <label className="flex items-center gap-2 text-sm mb-2"><input type="checkbox" defaultChecked className="w-4 h-4 border border-gray-300 rounded" /> Service alerts</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="w-4 h-4 border border-gray-300 rounded" /> Promotions</label>
          </div>
        </div>
      </div>

      <button onClick={logout} className="w-full bg-blue-600 text-white px-6 py-3 text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer flex items-center justify-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        LOG OUT
      </button>
    </div>
  );
}
