// Layout component
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

/**
 * Layout Component
 * 
 * Professional layout wrapper that combines Header, Sidebar, and Footer.
 * Provides a consistent layout structure for all pages with responsive design.
 * 
 * @param {ReactNode} children - Page content to render
 * @param {object} user - User object with name, email, and role (optional)
 * @param {boolean} showSidebar - Whether to show sidebar (default: true)
 * @param {boolean} showHeader - Whether to show header (default: true)
 * @param {boolean} showFooter - Whether to show footer (default: true)
 * @param {object} headerProps - Additional props to pass to Header component
 * @param {object} sidebarProps - Additional props to pass to Sidebar component
 * @param {object} footerProps - Additional props to pass to Footer component
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles
 */
const Layout = ({
  children,
  user: userProp,
  showSidebar = true,
  showHeader = true,
  showFooter = true,
  headerProps = {},
  sidebarProps = {},
  footerProps = {},
  className = '',
  style = {},
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [user, setUser] = useState(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Close sidebar when switching to desktop
      if (!mobile) {
        setSidebarOpen(false);
      }
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
      } else {
        setUser({
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: userRole || 'user',
        });
      }
    }
  }, [userProp]);

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Close sidebar
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Base layout container styles (flexbox column for sticky footer)
  const layoutContainerStyles = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    width: '100%',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #ffffff 50%, #f8f9ff 100%)',
    backgroundColor: '#f8f9ff',
    ...style,
  };

  // Main content wrapper styles (flexbox row for sidebar + content)
  const contentWrapperStyles = {
    display: 'flex',
    flex: 1,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  };

  // Main content area styles
  const mainContentStyles = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0, // Prevents flex item from overflowing
    backgroundColor: 'transparent',
    background: 'transparent',
    transition: isMobile ? 'none' : 'margin-left 0.3s ease',
    marginLeft: showSidebar && !isMobile ? '280px' : '0',
  };

  // Content area styles (scrollable)
  const contentAreaStyles = {
    flex: 1,
    padding: isMobile ? '20px' : '32px',
    overflowY: 'auto',
    overflowX: 'hidden',
    background: 'transparent',
  };

  // Hamburger menu button styles (shown on mobile when sidebar is enabled)
  const hamburgerStyles = {
    position: 'fixed',
    top: '16px',
    left: '16px',
    zIndex: 1001,
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    width: '40px',
    height: '40px',
    display: isMobile && showSidebar ? 'flex' : 'none',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease',
  };

  // Hamburger line styles
  const hamburgerLineStyles = {
    width: '20px',
    height: '2px',
    backgroundColor: '#333',
    transition: 'all 0.3s ease',
    borderRadius: '2px',
  };

  return (
    <div className={`layout ${className}`} style={layoutContainerStyles}>
      {/* Header */}
      {showHeader && (
        <Header
          user={user}
          {...headerProps}
        />
      )}

      {/* Hamburger Menu Button (Mobile Only) */}
      {showSidebar && (
        <button
          style={hamburgerStyles}
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          aria-expanded={sidebarOpen}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f5f5f5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
          }}
        >
          <span
            style={{
              ...hamburgerLineStyles,
              transform: sidebarOpen ? 'rotate(45deg) translateY(6px)' : 'none',
            }}
          />
          <span
            style={{
              ...hamburgerLineStyles,
              opacity: sidebarOpen ? 0 : 1,
            }}
          />
          <span
            style={{
              ...hamburgerLineStyles,
              transform: sidebarOpen ? 'rotate(-45deg) translateY(-6px)' : 'none',
            }}
          />
        </button>
      )}

      {/* Content Wrapper (Sidebar + Main Content) */}
      <div style={contentWrapperStyles}>
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar
            user={user}
            isOpen={sidebarOpen}
            onClose={closeSidebar}
            {...sidebarProps}
          />
        )}

        {/* Main Content Area */}
        <main style={mainContentStyles} role="main">
          <div style={contentAreaStyles}>
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      {showFooter && (
        <Footer
          sticky={true}
          {...footerProps}
        />
      )}
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.oneOf(['super_admin', 'reseller', 'user']),
  }),
  showSidebar: PropTypes.bool,
  showHeader: PropTypes.bool,
  showFooter: PropTypes.bool,
  headerProps: PropTypes.object,
  sidebarProps: PropTypes.object,
  footerProps: PropTypes.object,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Layout;
