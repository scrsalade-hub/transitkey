import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import RouteBrowse from './pages/RouteBrowse.jsx';
import RouteDetails from './pages/RouteDetails.jsx';
import MapView from './pages/MapView.jsx';
import Report from './pages/Report.jsx';
import Notifications from './pages/Notifications.jsx';
import Profile from './pages/Profile.jsx';

export default function App() {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthPage && <Navbar />}
      <div className={isAuthPage ? 'flex-1' : 'flex-1 md:ml-56'}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/routes" element={<RouteBrowse />} />
          <Route path="/routes/:id" element={<RouteDetails />} />
          <Route path="/details" element={<RouteBrowse />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </div>
      {!isAuthPage && <div className="md:ml-56"><Footer /></div>}
    </div>
  );
}
