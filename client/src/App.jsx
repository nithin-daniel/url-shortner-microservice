import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  const isAdmin = () => {
    const user = localStorage.getItem('user');
    if (!user || user === 'undefined') return false;
    try {
      const parsedUser = JSON.parse(user);
      return parsedUser.role === 'admin';
    } catch {
      return false;
    }
  };

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
  };

  const AdminRoute = ({ children }) => {
    return isAuthenticated() && isAdmin() ? children : <Navigate to="/dashboard" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
