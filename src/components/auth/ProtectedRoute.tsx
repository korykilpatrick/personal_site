import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import useAuth hook

// Remove the local useAuth hook
// const useAuthLocal = () => {
//   const token = localStorage.getItem('authToken');
//   return !!token; 
// };

interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ redirectPath = '/login' }) => {
  const { isAuthenticated, isLoading } = useAuth(); // Use context
  const location = useLocation();

  if (isLoading) {
    // Show loading indicator while checking auth status
    return <div>Loading authentication status...</div>; 
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <Outlet />; // Render child routes/components if authenticated
};

export default ProtectedRoute; 