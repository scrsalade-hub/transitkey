import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('driver_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('driver_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('driver_user', JSON.stringify(userData));
    localStorage.setItem('driver_token', userData.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('driver_user');
    localStorage.removeItem('driver_token');
  };

  const getToken = () => localStorage.getItem('driver_token');

  const verifyToken = async (accessToken) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/drivers/verify-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    login({ token: data.token, user: { ...data.user, role: 'driver' } });
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, getToken, verifyToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
