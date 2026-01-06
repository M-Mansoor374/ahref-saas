// Branding context
import React, { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';

/**
 * Branding Context
 * 
 * Provides branding state and methods throughout the application.
 * Manages branding text and link for consistent display across all pages.
 */

// Create the Branding Context
const BrandingContext = createContext(undefined);

/**
 * BrandingProvider Component
 * 
 * Wraps the application and provides branding context to all children.
 * Manages branding text and link state, with optional persistence.
 * 
 * @param {ReactNode} children - Child components that will have access to branding context
 * @param {string} initialBrandingText - Initial branding text (optional)
 * @param {string} initialBrandingLink - Initial branding link (optional)
 * @param {boolean} persistToLocalStorage - Whether to persist branding to localStorage (default: false)
 */
export const BrandingProvider = ({
  children,
  initialBrandingText = null,
  initialBrandingLink = null,
  persistToLocalStorage = false,
}) => {
  const [brandingText, setBrandingTextState] = useState(initialBrandingText || null);
  const [brandingLink, setBrandingLinkState] = useState(initialBrandingLink || null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Initialize branding from localStorage if persistence is enabled
   */
  useEffect(() => {
    if (persistToLocalStorage) {
      const storedBrandingText = localStorage.getItem('brandingText');
      const storedBrandingLink = localStorage.getItem('brandingLink');

      if (storedBrandingText) {
        setBrandingTextState(storedBrandingText);
      }
      if (storedBrandingLink) {
        setBrandingLinkState(storedBrandingLink);
      }
    }
  }, [persistToLocalStorage]);

  /**
   * Set branding text and optionally persist to localStorage
   * 
   * @param {string} text - Branding text (e.g., "XYZ" or "Service by XYZ")
   */
  const setBrandingText = (text) => {
    setBrandingTextState(text);

    if (persistToLocalStorage) {
      if (text) {
        localStorage.setItem('brandingText', text);
      } else {
        localStorage.removeItem('brandingText');
      }
    }
  };

  /**
   * Set branding link and optionally persist to localStorage
   * 
   * @param {string} link - Branding link (e.g., "https://example.com")
   */
  const setBrandingLink = (link) => {
    setBrandingLinkState(link);

    if (persistToLocalStorage) {
      if (link) {
        localStorage.setItem('brandingLink', link);
      } else {
        localStorage.removeItem('brandingLink');
      }
    }
  };

  /**
   * Update both branding text and link at once
   * 
   * @param {Object} branding - Branding object with text and/or link
   * @param {string} branding.text - Branding text
   * @param {string} branding.link - Branding link
   */
  const setBranding = ({ text, link }) => {
    if (text !== undefined) {
      setBrandingText(text);
    }
    if (link !== undefined) {
      setBrandingLink(link);
    }
  };

  /**
   * Clear branding (remove text and link)
   */
  const clearBranding = () => {
    setBrandingTextState(null);
    setBrandingLinkState(null);

    if (persistToLocalStorage) {
      localStorage.removeItem('brandingText');
      localStorage.removeItem('brandingLink');
    }
  };

  /**
   * Fetch branding from backend API
   * Ready for future backend integration
   * 
   * @param {Function} fetchFunction - Optional async function to fetch branding from API
   * @returns {Promise<void>}
   */
  const fetchBranding = async (fetchFunction) => {
    if (!fetchFunction) {
      console.warn('fetchBranding: No fetch function provided');
      return;
    }

    try {
      setIsLoading(true);
      const branding = await fetchFunction();

      if (branding) {
        if (branding.text !== undefined) {
          setBrandingText(branding.text);
        }
        if (branding.link !== undefined) {
          setBrandingLink(branding.link);
        }
      }
    } catch (error) {
      console.error('Error fetching branding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Context value to provide
  const value = {
    // State
    brandingText,
    brandingLink,
    isLoading,

    // Methods
    setBrandingText,
    setBrandingLink,
    setBranding,
    clearBranding,
    fetchBranding,
  };

  return (
    <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>
  );
};

BrandingProvider.propTypes = {
  children: PropTypes.node.isRequired,
  initialBrandingText: PropTypes.string,
  initialBrandingLink: PropTypes.string,
  persistToLocalStorage: PropTypes.bool,
};

/**
 * useBranding Hook
 * 
 * Custom hook to access branding context.
 * Must be used within BrandingProvider.
 * 
 * @returns {Object} Branding context value
 * @throws {Error} If used outside BrandingProvider
 */
export const useBranding = () => {
  const context = useContext(BrandingContext);

  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }

  return context;
};

// Export the context for advanced use cases
export default BrandingContext;

/**
 * USAGE EXAMPLES:
 * 
 * 1. Wrap your app with BrandingProvider in App.jsx or index.js:
 * 
 *    import { BrandingProvider } from './contexts/BrandingContext';
 *    import { AuthProvider } from './contexts/AuthContext';
 *    import App from './App';
 *    
 *    function Root() {
 *      return (
 *        <AuthProvider>
 *          <BrandingProvider persistToLocalStorage={true}>
 *            <App />
 *          </BrandingProvider>
 *        </AuthProvider>
 *      );
 *    }
 * 
 * 2. Use branding in Footer component:
 * 
 *    import { useBranding } from '../../contexts/BrandingContext';
 *    import BrandingText from '../../components/branding/BrandingText';
 *    
 *    function Footer() {
 *      const { brandingText, brandingLink } = useBranding();
 *      
 *      return (
 *        <footer>
 *          {/* Other footer content *\/}
 *          <BrandingText
 *            text={brandingText}
 *            websiteUrl={brandingLink}
 *          />
 *        </footer>
 *      );
 *    }
 * 
 * 3. Update branding dynamically:
 * 
 *    import { useBranding } from '../contexts/BrandingContext';
 *    
 *    function BrandingSettings() {
 *      const { setBrandingText, setBrandingLink, setBranding } = useBranding();
 *      
 *      const handleUpdate = () => {
 *        // Update individually
 *        setBrandingText('MyCompany');
 *        setBrandingLink('https://mycompany.com');
 *        
 *        // Or update both at once
 *        setBranding({
 *          text: 'MyCompany',
 *          link: 'https://mycompany.com'
 *        });
 *      };
 *      
 *      return (
 *        <button onClick={handleUpdate}>Update Branding</button>
 *      );
 *    }
 * 
 * 4. Fetch branding from backend:
 * 
 *    import { useBranding } from '../contexts/BrandingContext';
 *    import api from '../services/api';
 *    
 *    function Dashboard() {
 *      const { fetchBranding, brandingText, isLoading } = useBranding();
 *      
 *      useEffect(() => {
 *        fetchBranding(async () => {
 *          const response = await api.get('/branding');
 *          return response.data.data; // { text: '...', link: '...' }
 *        });
 *      }, []);
 *      
 *      if (isLoading) return <div>Loading branding...</div>;
 *      
 *      return <div>Branding: {brandingText}</div>;
 *    }
 * 
 * 5. Clear branding:
 * 
 *    const { clearBranding } = useBranding();
 *    clearBranding(); // Removes branding text and link
 */
