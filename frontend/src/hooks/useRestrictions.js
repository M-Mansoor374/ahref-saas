// useRestrictions hook
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * User Roles Constants
 */
const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  RESELLER: 'reseller',
  USER: 'user',
};

/**
 * Restricted Pages Configuration
 * Defines which roles can access which pages
 */
const RESTRICTED_PAGES = {
  settings: {
    allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.RESELLER],
    restrictedRoles: [USER_ROLES.USER],
  },
  profile: {
    allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.RESELLER],
    restrictedRoles: [USER_ROLES.USER],
  },
};

/**
 * useRestrictions Custom Hook
 * 
 * Checks if a user is allowed to access restricted pages (Settings, Profile)
 * based on their role. Provides access control logic for role-based routing.
 * 
 * @param {Object} options - Hook options
 * @param {string} options.userRole - Current user role (optional, can be fetched from useAuth)
 * @param {string} options.page - Page name to check ('settings', 'profile', or custom)
 * @param {string[]} options.allowedRoles - Custom allowed roles for the page (optional)
 * @param {string[]} options.restrictedRoles - Custom restricted roles for the page (optional)
 * @param {Function} options.authHook - useAuth hook result (optional, for automatic role detection)
 * @param {boolean} options.enableRedirect - Whether to enable redirect function (default: true)
 * @param {Function} options.customRedirect - Custom redirect function (optional)
 * @returns {Object} Access control state and functions
 */
const useRestrictions = ({
  userRole = null,
  page = null,
  allowedRoles = null,
  restrictedRoles = null,
  authHook = null,
  enableRedirect = true,
  customRedirect = null,
} = {}) => {
  // Always call useNavigate (React hooks must be called unconditionally)
  // Only use it if enableRedirect is true and no custom redirect is provided
  const navigateHook = useNavigate();
  const navigate = enableRedirect && !customRedirect ? navigateHook : null;
  const [role, setRole] = useState(userRole);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Get user role from authHook or localStorage
   */
  useEffect(() => {
    if (authHook && authHook.user) {
      setRole(authHook.user.role);
    } else if (!userRole) {
      // Fallback to localStorage
      const storedRole = localStorage.getItem('userRole');
      if (storedRole) {
        setRole(storedRole);
      }
    } else {
      setRole(userRole);
    }
  }, [userRole, authHook]);

  /**
   * Get allowed and restricted roles for a page
   */
  const getPageRestrictions = useCallback(
    (pageName) => {
      // If custom roles are provided, use them
      if (allowedRoles || restrictedRoles) {
        return {
          allowedRoles: allowedRoles || [],
          restrictedRoles: restrictedRoles || [],
        };
      }

      // Otherwise, use predefined restrictions
      if (pageName && RESTRICTED_PAGES[pageName]) {
        return RESTRICTED_PAGES[pageName];
      }

      // Default: no restrictions (allow all)
      return {
        allowedRoles: [],
        restrictedRoles: [],
      };
    },
    [allowedRoles, restrictedRoles]
  );

  /**
   * Check if user can access a page
   * 
   * @param {string} pageName - Page name to check
   * @param {string} userRoleToCheck - User role to check (optional, uses current role)
   * @returns {boolean} True if user can access the page
   */
  const canAccess = useCallback(
    (pageName = page, userRoleToCheck = role) => {
      // If no role provided, deny access
      if (!userRoleToCheck) {
        return false;
      }

      // If no page specified, allow access (no restrictions)
      if (!pageName) {
        return true;
      }

      const restrictions = getPageRestrictions(pageName);

      // If restricted roles are defined, check if user's role is restricted
      if (
        restrictions.restrictedRoles &&
        restrictions.restrictedRoles.length > 0
      ) {
        if (restrictions.restrictedRoles.includes(userRoleToCheck)) {
          return false; // User's role is restricted
        }
      }

      // If allowed roles are defined, check if user's role is allowed
      if (
        restrictions.allowedRoles &&
        restrictions.allowedRoles.length > 0
      ) {
        return restrictions.allowedRoles.includes(userRoleToCheck);
      }

      // No restrictions defined, allow access
      return true;
    },
    [page, role, getPageRestrictions]
  );

  /**
   * Get dashboard path based on user role
   * 
   * @param {string} userRoleToCheck - User role (optional, uses current role)
   * @returns {string} Dashboard path
   */
  const getDashboardPath = useCallback(
    (userRoleToCheck = role) => {
      switch (userRoleToCheck) {
        case USER_ROLES.SUPER_ADMIN:
          return '/admin/dashboard';
        case USER_ROLES.RESELLER:
          return '/reseller/dashboard';
        case USER_ROLES.USER:
          return '/user/dashboard';
        default:
          return '/user/dashboard';
      }
    },
    [role]
  );

  /**
   * Redirect to appropriate dashboard
   * 
   * @param {string} userRoleToCheck - User role (optional, uses current role)
   */
  const redirectToDashboard = useCallback(
    (userRoleToCheck = role) => {
      if (customRedirect) {
        customRedirect(getDashboardPath(userRoleToCheck));
        return;
      }

      if (navigate) {
        const dashboardPath = getDashboardPath(userRoleToCheck);
        navigate(dashboardPath, { replace: true });
      } else {
        // Fallback to window.location if navigate is not available
        const dashboardPath = getDashboardPath(userRoleToCheck);
        window.location.href = dashboardPath;
      }
    },
    [role, navigate, customRedirect, getDashboardPath]
  );

  /**
   * Check access for current page and role
   */
  const currentCanAccess = useMemo(() => {
    return canAccess(page, role);
  }, [canAccess, page, role]);

  /**
   * Get access message for denied access
   */
  const getAccessDeniedMessage = useCallback(
    (pageName = page) => {
      const restrictions = getPageRestrictions(pageName);
      if (restrictions.restrictedRoles && restrictions.restrictedRoles.includes(role)) {
        return `Access denied. This page is restricted for ${role} role.`;
      }
      return 'Access denied. You do not have permission to access this page.';
    },
    [page, role, getPageRestrictions]
  );

  return {
    // State
    userRole: role,
    isLoading,

    // Access control
    canAccess: currentCanAccess,
    canAccessPage: canAccess, // Function to check specific page

    // Helper functions
    redirectToDashboard,
    getDashboardPath,
    getAccessDeniedMessage,

    // Constants
    USER_ROLES,
    RESTRICTED_PAGES,
  };
};

export default useRestrictions;

/**
 * USAGE EXAMPLES:
 * 
 * 1. Basic usage with page name:
 * 
 *    import useRestrictions from '../hooks/useRestrictions';
 *    import { useAuth } from '../hooks/useAuth';
 *    
 *    function SettingsPage() {
 *      const { user } = useAuth();
 *      const { canAccess, redirectToDashboard } = useRestrictions({
 *        userRole: user?.role,
 *        page: 'settings'
 *      });
 *      
 *      useEffect(() => {
 *        if (!canAccess) {
 *          redirectToDashboard();
 *        }
 *      }, [canAccess, redirectToDashboard]);
 *      
 *      if (!canAccess) {
 *        return <div>Redirecting...</div>;
 *      }
 *      
 *      return <div>Settings Page</div>;
 *    }
 * 
 * 2. Usage with useAuth integration:
 * 
 *    import useRestrictions from '../hooks/useRestrictions';
 *    import { useAuth } from '../hooks/useAuth';
 *    import { Navigate } from 'react-router-dom';
 *    
 *    function ProfilePage() {
 *      const auth = useAuth();
 *      const { canAccess, getDashboardPath } = useRestrictions({
 *        authHook: auth,
 *        page: 'profile'
 *      });
 *      
 *      if (!canAccess) {
 *         return <Navigate to={getDashboardPath()} replace />;
 *       }
 *       
 *       return <div>Profile Page</div>;
 *     }
 * 
 * 3. Usage with custom roles:
 * 
 *    function CustomRestrictedPage() {
 *      const { user } = useAuth();
 *      const { canAccess } = useRestrictions({
 *        userRole: user?.role,
 *        allowedRoles: ['super_admin'], // Only super admin can access
 *      });
 *      
 *      if (!canAccess) {
 *        return <div>Access Denied</div>;
 *      }
 *      
 *      return <div>Admin Only Page</div>;
 *    }
 * 
 * 4. Usage in a route wrapper component:
 * 
 *    import useRestrictions from '../hooks/useRestrictions';
 *    import { useAuth } from '../hooks/useAuth';
 *    import { Navigate } from 'react-router-dom';
 *    
 *    function RestrictedRoute({ children, page }) {
 *      const auth = useAuth();
 *      const { canAccess, getDashboardPath } = useRestrictions({
 *        authHook: auth,
 *        page: page
 *      });
 *      
 *      if (auth.isLoading) {
 *        return <div>Loading...</div>;
 *      }
 *      
 *      if (!auth.isAuthenticated) {
 *        return <Navigate to="/login" replace />;
 *      }
 *      
 *      if (!canAccess) {
 *        return <Navigate to={getDashboardPath()} replace />;
 *      }
 *      
 *      return children;
 *    }
 *    
 *    // Usage:
 *    <RestrictedRoute page="settings">
 *      <SettingsPage />
 *    </RestrictedRoute>
 * 
 * 5. Usage with custom redirect:
 * 
 *    function SettingsPage() {
 *      const { user } = useAuth();
 *      const navigate = useNavigate();
 *      
 *      const { canAccess } = useRestrictions({
 *        userRole: user?.role,
 *        page: 'settings',
 *        customRedirect: (path) => {
 *           navigate(path, { replace: true });
 *           // Or show a modal, toast notification, etc.
 *         }
 *       });
 *       
 *       useEffect(() => {
 *         if (!canAccess) {
 *           // Custom handling
 *           alert('You do not have access to this page');
 *           navigate('/dashboard');
 *         }
 *       }, [canAccess, navigate]);
 *       
 *       if (!canAccess) {
 *         return null; // Or show error message
 *       }
 *       
 *       return <div>Settings</div>;
 *     }
 * 
 * 6. Check multiple pages:
 * 
 *    function NavigationComponent() {
 *      const { user } = useAuth();
 *      const { canAccessPage } = useRestrictions({
 *        userRole: user?.role
 *      });
 *      
 *      const canAccessSettings = canAccessPage('settings');
 *      const canAccessProfile = canAccessPage('profile');
 *      
 *      return (
 *        <nav>
 *          {canAccessSettings && <Link to="/settings">Settings</Link>}
 *          {canAccessProfile && <Link to="/profile">Profile</Link>}
 *        </nav>
 *      );
 *    }
 */
