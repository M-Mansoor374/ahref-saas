// Sidebar component
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * Sidebar Component
 * 
 * Professional sidebar navigation component with role-based menu items,
 * active route highlighting, and responsive design.
 * 
 * @param {object} user - User object with name, email, and role
 * @param {array} menuItems - Custom menu items (optional, overrides role-based menus)
 * @param {boolean} showProfile - Whether to show profile section (default: true)
 * @param {boolean} isOpen - Whether sidebar is open (for mobile)
 * @param {function} onClose - Function to close sidebar (for mobile)
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles
 */
const Sidebar = ({
  user: userProp,
  menuItems: customMenuItems,
  showProfile = true,
  isOpen = true,
  onClose,
  className = '',
  style = {},
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [expandedItems, setExpandedItems] = useState({});

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get user info from props or localStorage
  useEffect(() => {
    if (userProp) {
      setUser(userProp);
    } else {
      const storedUser = localStorage.getItem('user');
      const userRole = localStorage.getItem('userRole');
      const token = localStorage.getItem('token');

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser({
            ...parsedUser,
            role: parsedUser.role || userRole || 'user',
          });
        } catch (e) {
          setUser({
            name: 'User',
            email: 'user@example.com',
            role: userRole || 'user',
          });
        }
      } else if (token && userRole) {
        setUser({
          name: 'Admin',
          email: 'admin@example.com',
          role: userRole,
        });
      } else {
        setUser({
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: userRole || 'user',
        });
      }
    }
  }, [userProp]);

  // Role-based menu configuration
  const getMenuItemsByRole = (role) => {
    if (!role) return [];
    // Normalize role to lowercase and handle both SUPER_ADMIN and super_admin
    const normalizedRole = role?.toLowerCase().replace(/-/g, '_') || 'user';
    
    const menus = {
      super_admin: [
        {
          label: 'Dashboard',
          path: '/admin/dashboard',
          icon: '📊',
        },
        {
          label: 'Users',
          path: '/admin/users',
          icon: '👥',
        },
        {
          label: 'Resellers',
          path: '/admin/resellers',
          icon: '🏢',
        },
        {
          label: 'IP Management',
          path: '/admin/ip-management',
          icon: '🌐',
        },
        {
          label: 'Settings',
          path: '/admin/settings',
          icon: '⚙️',
        },
      ],
      reseller: [
        {
          label: 'Dashboard',
          path: '/reseller/dashboard',
          icon: '📊',
        },
        {
          label: 'Users',
          path: '/reseller/users',
          icon: '👥',
        },
        {
          label: 'Branding',
          path: '/reseller/branding',
          icon: '🎨',
        },
        {
          label: 'Settings',
          path: '/reseller/settings',
          icon: '⚙️',
        },
      ],
      user: [
        {
          label: 'Dashboard',
          path: '/user/dashboard',
          icon: '📊',
        },
        {
          label: 'Tool',
          path: '/user/tool',
          icon: '🔧',
        },
      ],
    };

    return menus[normalizedRole] || menus.user;
  };

  // Get menu items (custom or role-based)
  const getMenuItems = () => {
    if (customMenuItems) return customMenuItems;
    if (user && user.role) {
      const items = getMenuItemsByRole(user.role);
      if (items && items.length > 0) return items;
    }
    // Fallback: if on admin route, show admin menu
    if (location.pathname.startsWith('/admin/')) {
      return getMenuItemsByRole('super_admin');
    }
    // Fallback: if on reseller route, show reseller menu
    if (location.pathname.startsWith('/reseller/')) {
      return getMenuItemsByRole('reseller');
    }
    return getMenuItemsByRole('user');
  };
  
  const menuItems = getMenuItems();

  // Format role for display
  const formatRole = (role) => {
    if (!role) return 'User';
    return role
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Check if a menu item is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Handle menu item click
  const handleMenuItemClick = (e, path) => {
    e.preventDefault();
    e.stopPropagation();
    if (path) {
      navigate(path);
      // Close sidebar on mobile after navigation
      if (isMobile && onClose) {
        onClose();
      }
    }
  };

  // Toggle expanded state for items with submenus
  const toggleExpanded = (itemLabel) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemLabel]: !prev[itemLabel],
    }));
  };

  // Base sidebar styles
  const sidebarStyles = {
    width: isMobile ? '100%' : '280px',
    background: 'linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%)',
    borderRight: '1px solid rgba(17, 153, 142, 0.1)',
    height: isMobile ? '100vh' : '100%',
    display: isMobile ? (isOpen ? 'flex' : 'none') : 'flex',
    flexDirection: 'column',
    position: isMobile ? 'fixed' : 'relative',
    top: isMobile ? 0 : 'auto',
    left: isMobile ? 0 : 'auto',
    zIndex: isMobile ? 1000 : 'auto',
    overflowY: 'auto',
    boxShadow: isMobile ? 'none' : '2px 0 12px rgba(17, 153, 142, 0.08)',
    ...style,
  };

  // Profile section styles
  const profileStyles = {
    padding: '28px 20px',
    borderBottom: '1px solid rgba(17, 153, 142, 0.1)',
    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    color: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
  };

  const avatarStyles = {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '14px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  };

  // Menu container styles
  const menuStyles = {
    flex: 1,
    padding: '16px 0',
  };

  // Menu item styles
  const getMenuItemStyles = (item, active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 20px',
    color: active ? '#11998e' : '#4a5568',
    backgroundColor: active 
      ? 'linear-gradient(90deg, rgba(17, 153, 142, 0.1) 0%, rgba(56, 239, 125, 0.05) 100%)' 
      : 'transparent',
    background: active 
      ? 'linear-gradient(90deg, rgba(17, 153, 142, 0.1) 0%, rgba(56, 239, 125, 0.05) 100%)' 
      : 'transparent',
    borderLeft: active ? '4px solid #11998e' : '4px solid transparent',
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: active ? 600 : 500,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: active ? '0 12px 12px 0' : '0',
    marginRight: active ? '8px' : '0',
    position: 'relative',
  });

  // Icon styles
  const iconStyles = {
    fontSize: '18px',
    width: '20px',
    textAlign: 'center',
  };

  // Mobile backdrop
  const backdropStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
    display: isMobile && isOpen ? 'block' : 'none',
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div
          style={backdropStyles}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${className}`}
        style={sidebarStyles}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Profile Section */}
        {showProfile && user && (
          <div style={profileStyles}>
            <div style={avatarStyles}>
              {getUserInitials(user.name || user.email)}
            </div>
            <div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#ffffff',
                  marginBottom: '6px',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
              >
                {user.name || user.email?.split('@')[0] || 'User'}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  textTransform: 'capitalize',
                  fontWeight: 500,
                  marginBottom: '4px',
                }}
              >
                {formatRole(user.role)}
              </div>
              {user.email && (
                <div
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.75)',
                    marginTop: '4px',
                  }}
                >
                  {user.email}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Menu Items */}
        <nav style={menuStyles}>
          {menuItems.map((item, index) => {
            const active = isActive(item.path);
            return (
              <div
                key={index}
                style={getMenuItemStyles(item, active)}
                onClick={(e) => handleMenuItemClick(e, item.path)}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'rgba(17, 153, 142, 0.06)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleMenuItemClick(e, item.path);
                  }
                }}
                aria-current={active ? 'page' : undefined}
              >
                {item.icon && <span style={iconStyles}>{item.icon}</span>}
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

Sidebar.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.oneOf(['super_admin', 'reseller', 'user']),
  }),
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      icon: PropTypes.string,
    })
  ),
  showProfile: PropTypes.bool,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Sidebar;
