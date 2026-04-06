import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ProtectedRoute.css';


const ProtectedRoute = ({ children, minRole = 'viewer' }) => {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888' }}>Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!hasRole(minRole)) return <Navigate to="/dashboard" replace />;

  return children;
};

export default ProtectedRoute;