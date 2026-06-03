import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import TokenEntry from './pages/TokenEntry.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import Trip from './pages/Trip.jsx';
import MapView from './pages/MapView.jsx';
import Expenses from './pages/Expenses.jsx';
import LogExpense from './pages/LogExpense.jsx';
import Report from './pages/Report.jsx';
import Notifications from './pages/Notifications.jsx';
import Profile from './pages/Profile.jsx';

export default function App() {
  const location = useLocation();
  const isAuthPage = ['/', '/login'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthPage && <Navbar />}
      <div className={isAuthPage ? 'flex-1' : 'flex-1 md:ml-56'}>
        <Routes>
          <Route path="/" element={<TokenEntry />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/trip/:tripId" element={<ProtectedRoute><Trip /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute><MapView /></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
          <Route path="/expenses/new" element={<ProtectedRoute><LogExpense /></ProtectedRoute>} />
          <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </div>
      {!isAuthPage && <div className="md:ml-56"><Footer /></div>}
    </div>
  );
}
