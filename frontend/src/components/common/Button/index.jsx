// Button component
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable Button Component
 * 
 * A flexible button component that supports various types, states, and styling options.
 * Can be used with inline styles, CSS modules, or Tailwind classes via className prop.
 * 
 * @param {string} type - Button type: 'button' | 'submit' | 'reset'
 * @param {function} onClick - Click handler function
 * @param {ReactNode} children - Button content
 * @param {boolean} disabled - Disabled state
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles object
 * @param {string} variant - Button variant: 'primary' | 'secondary' | 'danger' | 'outline'
 * @param {string} size - Button size: 'small' | 'medium' | 'large'
 */
const Button = ({
  type = 'button',
  onClick,
  children,
  disabled = false,
  className = '',
  style = {},
  variant = 'primary',
  size = 'medium',
  ...rest
}) => {
  // Base styles
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 500,
    textAlign: 'center',
    textDecoration: 'none',
    border: 'none',
    borderRadius: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    userSelect: 'none',
    fontFamily: 'inherit',
    lineHeight: 1.5,
  };

  // Variant styles
  const variantStyles = {
    primary: {
      backgroundColor: disabled ? '#9e9e9e' : '#1976d2',
      color: '#ffffff',
      border: '1px solid transparent',
    },
    secondary: {
      backgroundColor: disabled ? '#9e9e9e' : '#424242',
      color: '#ffffff',
      border: '1px solid transparent',
    },
    danger: {
      backgroundColor: disabled ? '#9e9e9e' : '#d32f2f',
      color: '#ffffff',
      border: '1px solid transparent',
    },
    outline: {
      backgroundColor: 'transparent',
      color: disabled ? '#9e9e9e' : '#1976d2',
      border: `1px solid ${disabled ? '#9e9e9e' : '#1976d2'}`,
    },
  };

  // Size styles
  const sizeStyles = {
    small: {
      padding: '6px 12px',
      fontSize: '14px',
      minHeight: '32px',
    },
    medium: {
      padding: '10px 20px',
      fontSize: '16px',
      minHeight: '40px',
    },
    large: {
      padding: '14px 28px',
      fontSize: '18px',
      minHeight: '48px',
    },
  };

  // Hover styles (applied via className or inline)
  const hoverStyles = !disabled
    ? {
        ':hover': {
          opacity: 0.9,
          transform: 'translateY(-1px)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        },
        ':active': {
          transform: 'translateY(0)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        },
      }
    : {};

  // Check if style prop has background/backgroundImage to avoid conflicts
  const hasBackgroundStyle = style.background || style.backgroundImage;
  
  // Combine all styles
  const combinedStyles = {
    ...baseStyles,
    ...variantStyles[variant],
    ...sizeStyles[size],
    // If background/backgroundImage is provided, remove backgroundColor from variant
    ...(hasBackgroundStyle ? { backgroundColor: undefined } : {}),
    ...style,
    opacity: disabled ? 0.6 : 1,
    boxShadow: disabled ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
  };

  // Handle hover effect
  const handleMouseEnter = (e) => {
    if (!disabled && !style.onMouseEnter) {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
      e.currentTarget.style.opacity = '0.95';
    }
  };

  const handleMouseLeave = (e) => {
    if (!disabled && !style.onMouseLeave) {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      e.currentTarget.style.opacity = '1';
    }
  };

  // Combine classNames
  const combinedClassName = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    disabled && 'btn-disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      className={combinedClassName}
      style={combinedStyles}
      aria-disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'outline']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
};

export default Button;
