// Footer component
import React from 'react';
import PropTypes from 'prop-types';
import BrandingText from '../../branding/BrandingText';

/**
 * Footer Component
 * 
 * Professional footer component with branding text and optional navigation links.
 * Designed to be sticky at the bottom of pages with responsive design.
 * 
 * @param {string} brandingText - Branding text to display (e.g., "XYZ")
 * @param {string} brandingWebsiteUrl - Optional website URL for branding link
 * @param {array} links - Array of link objects: { label, href, target }
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles
 * @param {boolean} sticky - Whether footer should stick to bottom (default: true)
 * @param {string} copyrightText - Custom copyright text
 */
const Footer = ({
  brandingText,
  brandingWebsiteUrl,
  links = [],
  className = '',
  style = {},
  sticky = true,
  copyrightText,
}) => {
  // Default links if none provided
  const defaultLinks = [
    { label: 'About', href: '/about', target: '_self' },
    { label: 'Contact', href: '/contact', target: '_self' },
    { label: 'Terms of Service', href: '/terms', target: '_self' },
    { label: 'Privacy Policy', href: '/privacy', target: '_self' },
  ];

  // Use provided links or defaults
  const footerLinks = links.length > 0 ? links : defaultLinks;

  // Base footer styles
  const footerStyles = {
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e0e0e0',
    padding: '24px 20px',
    marginTop: sticky ? 'auto' : '0',
    width: '100%',
    ...style,
  };

  // Container styles for sticky footer
  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  // Links container styles
  const linksContainerStyles = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    justifyContent: 'center',
    alignItems: 'center',
  };

  // Link styles
  const linkStyles = {
    color: '#666',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 400,
    transition: 'color 0.2s ease',
    padding: '4px 0',
  };

  // Copyright styles
  const copyrightStyles = {
    fontSize: '12px',
    color: '#999',
    margin: 0,
    textAlign: 'center',
  };

  // Handle link click
  const handleLinkClick = (href, target) => {
    if (target === '_self' && href.startsWith('/')) {
      // Internal navigation would use React Router
      // For now, we'll use window.location or let the link handle it
      return;
    }
  };

  return (
    <footer
      className={`footer ${className}`}
      style={footerStyles}
    >
      <div style={containerStyles}>
        {/* Navigation Links */}
        {footerLinks.length > 0 && (
          <nav
            style={linksContainerStyles}
            aria-label="Footer navigation"
          >
            {footerLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                target={link.target || '_self'}
                rel={link.target === '_blank' ? 'noopener noreferrer' : undefined}
                style={linkStyles}
                onClick={() => handleLinkClick(link.href, link.target)}
                onMouseEnter={(e) => {
                  e.target.style.color = '#1976d2';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#666';
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        {/* Copyright Text */}
        {copyrightText && (
          <p style={copyrightStyles}>
            {copyrightText}
          </p>
        )}

        {/* Branding Text */}
        <BrandingText
          text={brandingText}
          websiteUrl={brandingWebsiteUrl}
          style={{
            marginTop: copyrightText ? '0' : '8px',
          }}
        />
      </div>
    </footer>
  );
};

Footer.propTypes = {
  brandingText: PropTypes.string,
  brandingWebsiteUrl: PropTypes.string,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
      target: PropTypes.oneOf(['_self', '_blank']),
    })
  ),
  className: PropTypes.string,
  style: PropTypes.object,
  sticky: PropTypes.bool,
  copyrightText: PropTypes.string,
};

export default Footer;
