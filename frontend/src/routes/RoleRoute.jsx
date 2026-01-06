// Role-based route wrapper
import React, { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * RoleRoute Component
 * Protects routes based on user roles
 * Allows access only if user's role matches one of the allowed roles
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if role matches
 * @param {string|string[]} props.allowedRoles - Single role or array of allowed roles
 * @param {string} props.redirectTo - Path to redirect if role doesn't match (default: '/unauthorized')
 * @returns {React.ReactNode} Protected component or redirect
 */
const RoleRoute = ({ children, allowedRoles, redirectTo = '/unauthorized' }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Normalize allowedRoles to array and memoize (must be before any returns)
  const roles = useMemo(() => {
    return Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  }, [allowedRoles]);

  // Get user role from user object or localStorage (memoized)
  const userRole = useMemo(() => {
    return user?.role || localStorage.getItem('userRole');
  }, [user?.role]);

  // Wait for auth hydration to prevent redirect loops
  // Double-check loading state as safety net (primary check is in AppRoutes)
  if (isLoading) {
    return null;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user's role is in the allowed roles list
  if (!userRole || !roles.includes(userRole)) {
    // Role doesn't match, redirect to unauthorized page
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // User has required role, render protected content
  return children;
};

export default RoleRoute;
