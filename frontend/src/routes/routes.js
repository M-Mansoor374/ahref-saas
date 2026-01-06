import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';
import RestrictedRoute from './RestrictedRoute';

import AuthPage from '../pages/auth';
import Signup from '../pages/auth/Signup';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminUsers from '../pages/admin/Users';
import AdminResellers from '../pages/admin/Resellers';
import AdminSettings from '../pages/admin/Settings';
import AdminIPManagement from '../pages/admin/IPManagement';
import ResellerDashboard from '../pages/reseller/Dashboard';
import ResellerUsers from '../pages/reseller/Users';
import ResellerBranding from '../pages/reseller/Branding';
import ResellerSettings from '../pages/reseller/Settings';
import UserDashboard from '../pages/user/Dashboard';
import UserTool from '../pages/user/Tool';
import RestrictedSettings from '../pages/restricted/Settings';
import RestrictedProfile from '../pages/restricted/Profile';

const AppRoutes = () => {
  const { isLoading } = useAuth();

  // Unified loading gate - blocks all renders until auth is initialized
  // This prevents flicker during initial load and auth state transitions
  if (isLoading) {
    return null;
  }

  return (
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['super_admin', 'SUPER_ADMIN']}>
                <AdminDashboard />
              </RoleRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['super_admin', 'SUPER_ADMIN']}>
                <AdminUsers />
              </RoleRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/resellers"
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['super_admin', 'SUPER_ADMIN']}>
                <AdminResellers />
              </RoleRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['super_admin', 'SUPER_ADMIN']}>
                <AdminSettings />
              </RoleRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/ip-management"
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['super_admin', 'SUPER_ADMIN']}>
                <AdminIPManagement />
              </RoleRoute>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/reseller/dashboard"
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['reseller', 'RESELLER', 'reseller_admin']}>
                <ResellerDashboard />
              </RoleRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/reseller/users"
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['reseller', 'RESELLER', 'reseller_admin']}>
                <ResellerUsers />
              </RoleRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/reseller/branding"
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['reseller', 'RESELLER', 'reseller_admin']}>
                <ResellerBranding />
              </RoleRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/reseller/settings"
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['reseller', 'RESELLER', 'reseller_admin']}>
                <ResellerSettings />
              </RoleRoute>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/user/dashboard"
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['user', 'USER']}>
                <UserDashboard />
              </RoleRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/user/tool"
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={['user', 'USER']}>
                <UserTool />
              </RoleRoute>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/restricted/settings"
          element={
            <PrivateRoute>
              <RestrictedRoute>
                <RestrictedSettings />
              </RestrictedRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/restricted/profile"
          element={
            <PrivateRoute>
              <RestrictedRoute>
                <RestrictedProfile />
              </RestrictedRoute>
            </PrivateRoute>
          }
        />
        
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
  );
};

export default AppRoutes;
