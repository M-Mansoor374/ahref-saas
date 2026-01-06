import React, { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import useRestrictions from '../hooks/useRestrictions';

const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  RESELLER: 'reseller',
  USER: 'user',
};

const getDashboardPath = (userRole) => {
  switch (userRole) {
    case USER_ROLES.SUPER_ADMIN:
    case 'SUPER_ADMIN':
      return '/admin/dashboard';
    case USER_ROLES.RESELLER:
    case 'RESELLER':
    case 'reseller':
      return '/reseller/dashboard';
    case USER_ROLES.USER:
    case 'USER':
    case 'user':
      return '/user/dashboard';
    default:
      return '/user/dashboard';
  }
};

const isRestrictedRole = (role) => {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  return normalizedRole === 'user';
};

const isAllowedRole = (role) => {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  return normalizedRole === 'super_admin' || normalizedRole === 'reseller' || normalizedRole === 'reseller_admin';
};

const RestrictedRoute = ({ children }) => {
  const auth = useAuth();
  const { isAuthenticated, role, user, isLoading } = auth;
  const location = useLocation();
  const { canAccess } = useRestrictions({ authHook: auth, page: 'settings' });

  const userRole = useMemo(() => {
    return role || user?.role || localStorage.getItem('userRole');
  }, [role, user?.role]);

  const redirectPath = useMemo(() => {
    if (isRestrictedRole(userRole)) {
      return getDashboardPath(userRole);
    }
    return '/user/dashboard';
  }, [userRole]);

  // Wait for auth hydration to prevent redirect loops
  // Double-check loading state as safety net (primary check is in AppRoutes)
  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isRestrictedRole(userRole)) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (isAllowedRole(userRole)) {
    return children;
  }

  return <Navigate to={redirectPath} state={{ from: location }} replace />;
};

export default RestrictedRoute;
