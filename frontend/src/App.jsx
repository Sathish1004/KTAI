import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';

// Route protection for authenticated users
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono text-slate-500 text-sm">
        Verifying user credentials...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Route protection specifically for Employee role
const EmployeeRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono text-slate-500 text-sm">
        Verifying employee credentials...
      </div>
    );
  }

  if (!user || user.role !== 'employee') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

// Route protection specifically for Admin role
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono text-slate-500 text-sm">
        Verifying administrative rights...
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Auto redirect at root path based on user login state and role
const RootRedirect = () => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono text-slate-500 text-sm">
        Initializing workspace...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Employee Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <EmployeeRoute>
                  <EmployeeDashboard />
                </EmployeeRoute>
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Dashboard Route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              </ProtectedRoute>
            }
          />

          {/* Fallback Redirect */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </Router>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </AuthProvider>
  );
}

export default App;
