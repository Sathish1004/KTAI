import { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Check user session on reload
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.status === 'success') {
            setUser(res.data.user);
          } else {
            // Invalid session
            handleLogout();
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
          handleLogout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const handleLogin = async (email, password) => {
    try {
      const res = await authService.login(email, password);
      if (res.status === 'success' && res.token) {
        localStorage.setItem('token', res.token);
        setToken(res.token);
        setUser(res.data.user);
        return { success: true, role: res.data.user.role };
      }
      return { success: false, message: 'Invalid response structure' };
    } catch (error) {
      console.error("AuthContext Login error:", error);
      const message = error.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, message };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login: handleLogin, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
