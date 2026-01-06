// Header component
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Button from '../../common/Button';
import api from '../../../services/api';

/**
 * Header Component
 * 
 * Professional header component with logo, user info, and logout functionality.
 * Responsive design that adapts to different screen sizes.
 * 
 * @param {string} logo - Logo image source (optional, uses default if not provided)
 * @param {string} logoAlt - Alt text for logo
 * @param {function} onLogout - Custom logout handler (optional)
 * @param {object} user - User object with name and role (optional, falls back to localStorage)
 */
const Header = ({
  logo,
  logoAlt = 'Logo',
  onLogout,
  user: userProp,
  className = '',
}) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      // Close mobile menu when switching to desktop
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
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
      // Fallback to localStorage for mock data
      const storedUser = localStorage.getItem('user');
      const userRole = localStorage.getItem('userRole');
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (e) {
          // If parsing fails, create mock user from role
          setUser({
            name: 'User',
            email: 'user@example.com',
            role: userRole || 'user',
          });
        }
      } else {
        // Mock user data for development
        setUser({
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: userRole || 'user',
        });
      }
    }
  }, [userProp]);

  /**
   * Handle logout
   * Clears authentication data and redirects to login
   */
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Call custom logout handler if provided
      if (onLogout) {
        await onLogout();
      } else {
        // Default logout: call API and clear storage
        try {
          await api.post('/auth/logout');
        } catch (error) {
          // Continue with logout even if API call fails
          console.warn('Logout API call failed, continuing with local logout:', error);
        }

        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
      }

      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear storage and redirect on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  /**
   * Format role name for display
   */
  const formatRole = (role) => {
    if (!role) return 'User';
    return role
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  /**
   * Get user initials for avatar
   */
  const getUserInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Default logo path
  const defaultLogo = '/assets/images/logo.png';

  return (
    <header
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 12px rgba(17, 153, 142, 0.08)',
        borderBottom: '1px solid rgba(17, 153, 142, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
        backdropFilter: 'blur(10px)',
      }}
      className={className}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
        }}
      >
        {/* Logo Section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/')}
        >
          {logo || defaultLogo ? (
            <img
              src={logo || defaultLogo}
              alt={logoAlt}
              style={{
                height: '40px',
                width: 'auto',
                objectFit: 'contain',
              }}
              onError={(e) => {
                // Fallback to text logo if image fails to load
                e.target.style.display = 'none';
                if (!e.target.nextSibling) {
                  const textLogo = document.createElement('div');
                  textLogo.textContent = 'Ahrefs SaaS';
                  textLogo.style.cssText = 'font-size: 20px; font-weight: bold; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;';
                  e.target.parentNode.appendChild(textLogo);
                }
              }}
            />
          ) : (
            <div
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Ahrefs SaaS
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav
          style={{
            display: isMobile ? 'none' : 'flex',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          {/* User Info */}
          {user && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 16px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(17, 153, 142, 0.08) 0%, rgba(56, 239, 125, 0.05) 100%)',
                backgroundColor: 'rgba(17, 153, 142, 0.05)',
                border: '1px solid rgba(17, 153, 142, 0.1)',
              }}
            >
              {/* User Avatar */}
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  backgroundColor: '#11998e',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 8px rgba(17, 153, 142, 0.3)',
                }}
              >
                {getUserInitials(user.name || user.email)}
              </div>

              {/* User Details */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#2d3748',
                  }}
                >
                  {user.name || user.email?.split('@')[0] || 'User'}
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    color: '#11998e',
                    textTransform: 'capitalize',
                    fontWeight: 500,
                  }}
                >
                  {formatRole(user.role)}
                </span>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <Button
            variant="outline"
            size="small"
            onClick={handleLogout}
            disabled={isLoggingOut}
            style={{
              minWidth: '100px',
            }}
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          style={{
            display: isMobile ? 'flex' : 'none',
            flexDirection: 'column',
            gap: '4px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
          }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span
            style={{
              width: '24px',
              height: '2px',
              backgroundColor: '#333',
              transition: 'all 0.3s',
              transform: isMobileMenuOpen ? 'rotate(45deg) translateY(8px)' : 'none',
            }}
          />
          <span
            style={{
              width: '24px',
              height: '2px',
              backgroundColor: '#333',
              transition: 'all 0.3s',
              opacity: isMobileMenuOpen ? 0 : 1,
            }}
          />
          <span
            style={{
              width: '24px',
              height: '2px',
              backgroundColor: '#333',
              transition: 'all 0.3s',
              transform: isMobileMenuOpen ? 'rotate(-45deg) translateY(-8px)' : 'none',
            }}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && isMobile && (
        <div
          style={{
            padding: '20px',
            borderTop: '1px solid rgba(17, 153, 142, 0.1)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
            backgroundColor: '#f8f9ff',
          }}
        >
          {user && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    backgroundColor: '#11998e',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(17, 153, 142, 0.3)',
                  }}
                >
                  {getUserInitials(user.name || user.email)}
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '16px',
                      fontWeight: 500,
                      color: '#333',
                    }}
                  >
                    {user.name || user.email?.split('@')[0] || 'User'}
                  </span>
                  <span
                    style={{
                      fontSize: '14px',
                      color: '#666',
                      textTransform: 'capitalize',
                    }}
                  >
                    {formatRole(user.role)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="medium"
            onClick={handleLogout}
            disabled={isLoggingOut}
            style={{
              width: '100%',
            }}
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      )}
    </header>
  );
};

Header.propTypes = {
  logo: PropTypes.string,
  logoAlt: PropTypes.string,
  onLogout: PropTypes.func,
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
  }),
  className: PropTypes.string,
};

export default Header;
