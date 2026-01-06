// Modal component
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable Modal Component
 * 
 * A professional, accessible modal dialog component with backdrop, animations, and keyboard support.
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Function to close the modal
 * @param {string} title - Modal title/header text
 * @param {ReactNode} children - Modal body content
 * @param {ReactNode} footer - Optional footer content (buttons, etc.)
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles for modal content
 * @param {boolean} closeOnBackdropClick - Whether to close when clicking backdrop (default: true)
 * @param {boolean} closeOnEscape - Whether to close on Escape key (default: true)
 * @param {string} size - Modal size: 'small' | 'medium' | 'large' | 'full'
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className = '',
  style = {},
  closeOnBackdropClick = true,
  closeOnEscape = true,
  size = 'medium',
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Handle Escape key press
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle focus management and body scroll lock
  useEffect(() => {
    if (isOpen) {
      // Save the previously focused element
      previousActiveElement.current = document.activeElement;

      // Lock body scroll
      document.body.style.overflow = 'hidden';

      // Focus the modal when it opens
      if (modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        } else {
          modalRef.current.focus();
        }
      }
    } else {
      // Restore body scroll
      document.body.style.overflow = '';

      // Restore focus to previous element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      // Cleanup: restore body scroll
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (event) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  // Handle modal content click (prevent closing when clicking inside)
  const handleModalContentClick = (event) => {
    event.stopPropagation();
  };

  // Size styles
  const sizeStyles = {
    small: {
      maxWidth: '400px',
      width: '90%',
    },
    medium: {
      maxWidth: '600px',
      width: '90%',
    },
    large: {
      maxWidth: '900px',
      width: '90%',
    },
    full: {
      maxWidth: '95%',
      width: '95%',
      maxHeight: '95vh',
    },
  };

  // Base modal content styles
  const modalContentStyles = {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    outline: 'none',
    ...sizeStyles[size],
    ...style,
  };

  // Animation styles
  const backdropStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
    opacity: isOpen ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
    pointerEvents: isOpen ? 'auto' : 'none',
  };

  const contentStyles = {
    ...modalContentStyles,
    transform: isOpen ? 'scale(1)' : 'scale(0.95)',
    opacity: isOpen ? 1 : 0,
    transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
  };

  if (!isOpen) return null;

  return (
    <div
      style={backdropStyles}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      className={`modal-backdrop ${className}`}
    >
      <div
        ref={modalRef}
        style={contentStyles}
        onClick={handleModalContentClick}
        tabIndex={-1}
        className="modal-content"
      >
        {/* Header */}
        {title && (
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h2
              id="modal-title"
              style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: 600,
                color: '#333',
              }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                color: '#999',
                cursor: 'pointer',
                padding: '0',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                transition: 'background-color 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f5f5f5';
                e.target.style.color = '#333';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#999';
              }}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        )}

        {/* Body */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            flex: 1,
          }}
          className="modal-body"
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
            }}
            className="modal-footer"
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
  closeOnBackdropClick: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large', 'full']),
};

export default Modal;
