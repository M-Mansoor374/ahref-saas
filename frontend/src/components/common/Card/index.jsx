// Card component
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable Card Component
 * 
 * A flexible card component for displaying content in a contained box.
 * 
 * @param {ReactNode} children - Card content
 * @param {string} title - Card title (optional)
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles
 * @param {ReactNode} header - Custom header content (optional)
 * @param {ReactNode} footer - Custom footer content (optional)
 */
const Card = ({
  children,
  title,
  className = '',
  style = {},
  header,
  footer,
}) => {
  // Base styles
  const baseStyles = {
    backgroundColor: '#ffffff',
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(17, 153, 142, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
    border: '1px solid rgba(17, 153, 142, 0.08)',
    padding: '28px',
    marginBottom: '24px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  // Combine styles
  const combinedStyles = {
    ...baseStyles,
    ...style,
  };

  // Combine classNames
  const combinedClassName = ['card', className].filter(Boolean).join(' ');

  return (
    <div className={combinedClassName} style={combinedStyles}>
      {/* Header */}
      {(header || title) && (
        <div
          style={{
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '2px solid rgba(17, 153, 142, 0.1)',
          }}
        >
          {header || (
            <h3
              style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: '#11998e',
              }}
            >
              {title}
            </h3>
          )}
        </div>
      )}

      {/* Content */}
      <div>{children}</div>

      {/* Footer */}
      {footer && (
        <div
          style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '2px solid rgba(17, 153, 142, 0.1)',
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  header: PropTypes.node,
  footer: PropTypes.node,
};

export default Card;
