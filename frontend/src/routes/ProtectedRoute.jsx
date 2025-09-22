import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to. This allows us to send them along to that page after they login.
        return <Navigate to="/" state={{ from: location, showLogin: true }} replace />;
    }

    // If a specific role is required and the user's role doesn't match, redirect
    if (requiredRole && user.role !== requiredRole) {
        // For example, redirect a user trying to access an organizer page to their own dashboard
        const destination = user.role === 'user' ? '/dashboard/user' : '/';
        return <Navigate to={destination} replace />;
    }

    return children;
};

export default ProtectedRoute;