// Input component
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable Input Component
 * 
 * A flexible input component that supports various types and states.
 * Can be used with inline styles, CSS modules, or Tailwind classes via className prop.
 * 
 * @param {string} type - Input type: 'text' | 'email' | 'password' | etc.
 * @param {string} name - Input name attribute
 * @param {string} value - Input value (controlled)
 * @param {function} onChange - Change handler function
 * @param {string} placeholder - Placeholder text
 * @param {boolean} disabled - Disabled state
 * @param {boolean} required - Required field
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles object
 * @param {string} error - Error message to display
 * @param {string} label - Label text
 */
const Input = ({
  type = 'text',
  name,
  value,
  onChange,
  placeholder = '',
  disabled = false,
  required = false,
  className = '',
  style = {},
  error = '',
  label = '',
  ...rest
}) => {
  // Base styles
  const baseStyles = {
    width: '100%',
    padding: '10px 12px',
    fontSize: '16px',
    fontFamily: 'inherit',
    border: `1px solid ${error ? '#d32f2f' : '#ccc'}`,
    borderRadius: '4px',
    outline: 'none',
    transition: 'all 0.2s ease-in-out',
    backgroundColor: disabled ? '#f5f5f5' : '#ffffff',
    color: disabled ? '#999' : '#333',
  };

  // Focus styles
  const focusStyles = {
    borderColor: error ? '#d32f2f' : '#1976d2',
    boxShadow: `0 0 0 2px ${error ? 'rgba(211, 47, 47, 0.2)' : 'rgba(25, 118, 210, 0.2)'}`,
  };

  // Combine styles
  const combinedStyles = {
    ...baseStyles,
    ...style,
  };

  // Combine classNames
  const combinedClassName = [
    'input',
    error && 'input-error',
    disabled && 'input-disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div style={{ width: '100%', marginBottom: '16px' }}>
      {label && (
        <label
          htmlFor={name}
          style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#333',
          }}
        >
          {label}
          {required && (
            <span style={{ color: '#d32f2f', marginLeft: '4px' }}>*</span>
          )}
        </label>
      )}
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={combinedClassName}
        style={combinedStyles}
        onFocus={(e) => {
          Object.assign(e.target.style, focusStyles);
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? '#d32f2f' : '#ccc';
          e.target.style.boxShadow = 'none';
        }}
        {...rest}
      />
      {error && (
        <div
          style={{
            marginTop: '4px',
            fontSize: '12px',
            color: '#d32f2f',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

Input.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  error: PropTypes.string,
  label: PropTypes.string,
};

export default Input;
