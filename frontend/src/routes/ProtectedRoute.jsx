import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {

        return <Navigate to="/" state={{ from: location, showLogin: true }} replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        const destination = user.role === 'user' ? '/dashboard/user' : '/';
        return <Navigate to={destination} replace />;
    }

    return children;
};

export default ProtectedRoute;