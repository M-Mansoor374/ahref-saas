// "Service by XYZ" branding component
import React from 'react';
import PropTypes from 'prop-types';

/**
 * BrandingText Component
 * 
 * Displays a subtle footer branding text in "Service by XYZ" format.
 * Can be used across all pages to show branding information.
 * 
 * @param {string} text - Branding text (e.g., "XYZ" or full text)
 * @param {string} companyName - Company name (defaults to text if not provided)
 * @param {string} websiteUrl - Optional company website URL
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles
 */
const BrandingText = ({
  text,
  companyName,
  websiteUrl,
  className = '',
  style = {},
}) => {
  // Determine the company name to display
  const displayCompany = companyName || text || 'XYZ';

  // Format the branding text
  const brandingText = text && text.toLowerCase().includes('service by')
    ? text // Use as-is if already formatted
    : `Service by ${displayCompany}`;

  // Base styles - small, subtle
  const baseStyles = {
    fontSize: '12px',
    color: '#999',
    textAlign: 'center',
    padding: '8px 0',
    margin: 0,
    fontFamily: 'inherit',
    lineHeight: 1.5,
  };

  // Combine styles
  const combinedStyles = {
    ...baseStyles,
    ...style,
  };

  // Render with or without link
  if (websiteUrl) {
    return (
      <p className={className} style={combinedStyles}>
        Service by{' '}
        <a
          href={websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#666',
            textDecoration: 'none',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.color = '#1976d2';
            e.target.style.textDecoration = 'underline';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = '#666';
            e.target.style.textDecoration = 'none';
          }}
        >
          {displayCompany}
        </a>
      </p>
    );
  }

  // Render without link
  return (
    <p className={className} style={combinedStyles}>
      {brandingText}
    </p>
  );
};

BrandingText.propTypes = {
  text: PropTypes.string,
  companyName: PropTypes.string,
  websiteUrl: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default BrandingText;
