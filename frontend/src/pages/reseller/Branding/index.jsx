// Reseller Admin Branding Management page
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useBranding } from '../../../contexts/BrandingContext';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import BrandingText from '../../../components/branding/BrandingText';

/**
 * Reseller Branding Management Component
 * 
 * Enterprise-grade branding management panel for Reseller Admins.
 * Enables white-label customization of branding that appears across users' dashboards.
 */
const ResellerBranding = () => {
  const { role } = useAuth();
  const { brandingText: contextBrandingText, brandingLink, setBranding } = useBranding();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Branding state
  const [brandingData, setBrandingData] = useState({
    text: '',
    logoUrl: null,
    logoType: null, // 'upload' | 'generated' | null
    generatedLogo: null, // SVG data URL
    primaryColor: '#1976d2',
    secondaryColor: '#424242',
    websiteUrl: '',
  });

  // Original branding data for change detection
  const [originalBrandingData, setOriginalBrandingData] = useState(null);

  // Form errors
  const [errors, setErrors] = useState({});

  // File input ref
  const fileInputRef = useRef(null);

  // Responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Character limit for branding text
  const BRANDING_TEXT_LIMIT = 50;

  // Max file size (2MB)
  const MAX_FILE_SIZE = 2 * 1024 * 1024;

  // Allowed file types
  const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];

  // Mock initial branding data
  const mockBrandingData = {
    text: 'ABC Solutions',
    logoUrl: null,
    logoType: null,
    generatedLogo: null,
    primaryColor: '#1976d2',
    secondaryColor: '#424242',
    websiteUrl: 'https://abcsolutions.com',
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load branding data on mount
  useEffect(() => {
    const loadBranding = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Use context branding text if available, otherwise use mock data
        const initialData = {
          ...mockBrandingData,
          text: contextBrandingText || mockBrandingData.text,
          websiteUrl: brandingLink || mockBrandingData.websiteUrl,
        };

        setBrandingData(initialData);
        setOriginalBrandingData(JSON.parse(JSON.stringify(initialData)));
      } catch (error) {
        console.error('Failed to load branding:', error);
        showNotification('Failed to load branding settings', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadBranding();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if there are changes
  const hasChanges = useMemo(() => {
    if (!originalBrandingData) return false;
    return JSON.stringify(brandingData) !== JSON.stringify(originalBrandingData);
  }, [brandingData, originalBrandingData]);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Validate branding text
  const validateText = (text) => {
    if (!text.trim()) {
      return 'Branding text is required';
    }
    if (text.length > BRANDING_TEXT_LIMIT) {
      return `Branding text must be ${BRANDING_TEXT_LIMIT} characters or less`;
    }
    return '';
  };

  // Handle branding text change
  const handleTextChange = (e) => {
    const value = e.target.value;
    const error = validateText(value);

    setBrandingData((prev) => ({ ...prev, text: value }));
    setErrors((prev) => ({ ...prev, text: error }));

    // Clear error if valid
    if (!error && errors.text) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.text;
        return newErrors;
      });
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      showNotification('Please upload a PNG, JPG, or SVG file', 'error');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      showNotification('File size must be less than 2MB', 'error');
      return;
    }

    // Read file and create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target.result;
      setBrandingData((prev) => ({
        ...prev,
        logoUrl: result,
        logoType: 'upload',
        generatedLogo: null,
      }));
      showNotification('Logo uploaded successfully', 'success');
    };
    reader.onerror = () => {
      showNotification('Failed to read file', 'error');
    };
    reader.readAsDataURL(file);
  };

  // Remove logo
  const handleRemoveLogo = () => {
    setBrandingData((prev) => ({
      ...prev,
      logoUrl: null,
      logoType: null,
      generatedLogo: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showNotification('Logo removed', 'success');
  };

  // Generate initials from branding text
  const getInitials = (text) => {
    if (!text) return 'BR';
    const words = text.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
  };

  // Generate color palette based on text hash (consistent colors)
  const generateColorPalette = (text) => {
    // Simple hash function for consistent color generation
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate a hue value (0-360)
    const hue = Math.abs(hash) % 360;

    // Generate complementary colors
    const primaryHue = hue;
    const secondaryHue = (hue + 180) % 360;

    // Convert HSL to hex (with fixed saturation and lightness for professional look)
    const hslToHex = (h, s, l) => {
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = l - c / 2;
      let r, g, b;

      if (h < 60) {
        r = c;
        g = x;
        b = 0;
      } else if (h < 120) {
        r = x;
        g = c;
        b = 0;
      } else if (h < 180) {
        r = 0;
        g = c;
        b = x;
      } else if (h < 240) {
        r = 0;
        g = x;
        b = c;
      } else if (h < 300) {
        r = x;
        g = 0;
        b = c;
      } else {
        r = c;
        g = 0;
        b = x;
      }

      const toHex = (val) => {
        const hex = Math.round((val + m) * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };

      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };

    return {
      primary: hslToHex(primaryHue, 0.7, 0.5),
      secondary: hslToHex(secondaryHue, 0.5, 0.4),
    };
  };

  // Generate SVG logo
  const generateLogo = () => {
    const initials = getInitials(brandingData.text);
    const colors = generateColorPalette(brandingData.text);

    // Create SVG logo
    const svg = `
      <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="55" fill="url(#logoGradient)" />
        <text
          x="60"
          y="75"
          font-family="Arial, sans-serif"
          font-size="42"
          font-weight="bold"
          fill="#ffffff"
          text-anchor="middle"
          dominant-baseline="middle"
        >${initials}</text>
      </svg>
    `.trim();

    // Convert SVG to data URL
    const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    // Convert to data URL for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setBrandingData((prev) => ({
        ...prev,
        generatedLogo: dataUrl,
        logoType: 'generated',
        logoUrl: dataUrl,
        primaryColor: colors.primary,
        secondaryColor: colors.secondary,
      }));
      showNotification('Logo generated successfully', 'success');
    };
    reader.readAsDataURL(svgBlob);

    // Cleanup
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  // Handle color change
  const handleColorChange = (colorType, value) => {
    setBrandingData((prev) => ({
      ...prev,
      [colorType]: value,
    }));
  };

  // Handle website URL change
  const handleWebsiteUrlChange = (e) => {
    const value = e.target.value;
    setBrandingData((prev) => ({ ...prev, websiteUrl: value }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const textError = validateText(brandingData.text);
    if (textError) {
      newErrors.text = textError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      showNotification('Please fix the errors before saving', 'error');
      return;
    }

    if (!hasChanges) {
      showNotification('No changes to save', 'error');
      return;
    }

    try {
      setSaving(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update context
      setBranding({
        text: brandingData.text,
        link: brandingData.websiteUrl || null,
      });

      // Update original data
      setOriginalBrandingData(JSON.parse(JSON.stringify(brandingData)));

      showNotification('Branding settings saved successfully', 'success');
    } catch (error) {
      console.error('Failed to save branding:', error);
      showNotification('Failed to save branding settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Reset to original
  const handleReset = () => {
    if (originalBrandingData) {
      setBrandingData(JSON.parse(JSON.stringify(originalBrandingData)));
      setErrors({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      showNotification('Changes reset', 'success');
    }
  };

  // Check if user is Reseller Admin
  if (role !== 'RESELLER' && role !== 'reseller' && role !== 'reseller_admin') {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card style={{ maxWidth: '500px', textAlign: 'center' }}>
          <h2 style={{ color: '#c62828', marginBottom: '16px' }}>Access Denied</h2>
          <p style={{ color: '#666' }}>
            This page is only accessible to Reseller Admin users.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Main Content */}
      <main
        style={{
          flex: 1,
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%',
          padding: '20px',
        }}
      >
        {/* Page Title */}
        <div style={{ marginBottom: '24px' }}>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#333',
              margin: '0 0 8px 0',
            }}
          >
            Branding Management
          </h1>
          <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>
            Customize white-label branding for your users' dashboards
          </p>
        </div>

        {/* Notification */}
        {notification.show && (
          <div
            style={{
              padding: '12px 20px',
              marginBottom: '20px',
              borderRadius: '4px',
              backgroundColor: notification.type === 'success' ? '#e8f5e9' : '#ffebee',
              color: notification.type === 'success' ? '#2e7d32' : '#c62828',
              border: `1px solid ${notification.type === 'success' ? '#c8e6c9' : '#ffcdd2'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification({ show: false, message: '', type: 'success' })}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '0 8px',
              }}
            >
              ×
            </button>
          </div>
        )}

        {loading ? (
          <Card>
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: '#999',
              }}
            >
              Loading branding settings...
            </div>
          </Card>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '20px',
            }}
          >
            {/* Left Column - Settings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Branding Text */}
              <Card title="Branding Text">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Input
                    type="text"
                    name="text"
                    label="Branding Text"
                    value={brandingData.text}
                    onChange={handleTextChange}
                    placeholder="e.g., ABC Solutions"
                    required
                    error={errors.text}
                    maxLength={BRANDING_TEXT_LIMIT}
                    disabled={saving}
                  />
                  <div
                    style={{
                      fontSize: '12px',
                      color: brandingData.text.length > BRANDING_TEXT_LIMIT ? '#c62828' : '#999',
                      textAlign: 'right',
                    }}
                  >
                    {brandingData.text.length}/{BRANDING_TEXT_LIMIT} characters
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#666',
                      padding: '12px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '4px',
                    }}
                  >
                    <strong>Preview:</strong>{' '}
                    <span style={{ color: '#999' }}>
                      Service by {brandingData.text || 'Your Company'}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Logo Management */}
              <Card title="Logo Management">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Logo Preview */}
                  {brandingData.logoUrl && (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '20px',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '8px',
                        border: '1px dashed #ddd',
                      }}
                    >
                      <div
                        style={{
                          width: '120px',
                          height: '120px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#fff',
                          borderRadius: '8px',
                          border: '1px solid #e0e0e0',
                          overflow: 'hidden',
                        }}
                      >
                        <img
                          src={brandingData.logoUrl}
                          alt="Logo preview"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      </div>
                      <Button
                        variant="danger"
                        size="small"
                        onClick={handleRemoveLogo}
                        disabled={saving}
                      >
                        Remove Logo
                      </Button>
                    </div>
                  )}

                  {/* Upload Logo */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#333',
                      }}
                    >
                      Upload Logo
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                      onChange={handleFileChange}
                      disabled={saving}
                      style={{ display: 'none' }}
                    />
                    <Button
                      variant="outline"
                      size="medium"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={saving}
                      style={{ width: '100%' }}
                    >
                      Choose File (PNG, JPG, SVG)
                    </Button>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#999',
                        marginTop: '8px',
                      }}
                    >
                      Maximum file size: 2MB
                    </div>
                  </div>

                  {/* Generate Logo */}
                  {!brandingData.logoUrl && (
                    <div>
                      <div
                        style={{
                          margin: '16px 0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            height: '1px',
                            backgroundColor: '#e0e0e0',
                          }}
                        />
                        <span style={{ color: '#999', fontSize: '14px' }}>OR</span>
                        <div
                          style={{
                            flex: 1,
                            height: '1px',
                            backgroundColor: '#e0e0e0',
                          }}
                        />
                      </div>
                      <Button
                        variant="secondary"
                        size="medium"
                        onClick={generateLogo}
                        disabled={saving || !brandingData.text.trim()}
                        style={{ width: '100%' }}
                      >
                        Generate Logo Automatically
                      </Button>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#999',
                          marginTop: '8px',
                        }}
                      >
                        Creates a professional logo using your branding text initials
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Theme Customization */}
              <Card title="Theme Customization">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#333',
                      }}
                    >
                      Primary Color
                    </label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={brandingData.primaryColor}
                        onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                        disabled={saving}
                        style={{
                          width: '60px',
                          height: '40px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          cursor: saving ? 'not-allowed' : 'pointer',
                        }}
                      />
                      <Input
                        type="text"
                        value={brandingData.primaryColor}
                        onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                        placeholder="#1976d2"
                        disabled={saving}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#333',
                      }}
                    >
                      Secondary Color
                    </label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={brandingData.secondaryColor}
                        onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                        disabled={saving}
                        style={{
                          width: '60px',
                          height: '40px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          cursor: saving ? 'not-allowed' : 'pointer',
                        }}
                      />
                      <Input
                        type="text"
                        value={brandingData.secondaryColor}
                        onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                        placeholder="#424242"
                        disabled={saving}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Website URL */}
              <Card title="Additional Settings">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Input
                    type="url"
                    name="websiteUrl"
                    label="Company Website URL (Optional)"
                    value={brandingData.websiteUrl}
                    onChange={handleWebsiteUrlChange}
                    placeholder="https://yourcompany.com"
                    disabled={saving}
                  />
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#666',
                    }}
                  >
                    If provided, your company name in the branding text will be clickable.
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Preview */}
            <div>
              <Card title="Live Preview">
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                  }}
                >
                  {/* Logo Preview */}
                  {brandingData.logoUrl && (
                    <div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#666',
                          marginBottom: '12px',
                        }}
                      >
                        Logo Preview
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '20px',
                          backgroundColor: '#f9f9f9',
                          borderRadius: '8px',
                          border: '1px solid #e0e0e0',
                        }}
                      >
                        <div
                          style={{
                            width: '80px',
                            height: '80px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#fff',
                            borderRadius: '4px',
                          }}
                        >
                          <img
                            src={brandingData.logoUrl}
                            alt="Logo"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer Preview */}
                  <div>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#666',
                        marginBottom: '12px',
                      }}
                    >
                      Footer Preview
                    </div>
                    <div
                      style={{
                        padding: '24px',
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        borderTop: '2px solid #e0e0e0',
                      }}
                    >
                      <div
                        style={{
                          minHeight: '200px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <BrandingText
                          text={brandingData.text}
                          websiteUrl={brandingData.websiteUrl || null}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Theme Preview */}
                  <div>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#666',
                        marginBottom: '12px',
                      }}
                    >
                      Theme Colors Preview
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '12px',
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          padding: '16px',
                          backgroundColor: brandingData.primaryColor,
                          borderRadius: '8px',
                          color: '#fff',
                          textAlign: 'center',
                          fontWeight: 500,
                        }}
                      >
                        Primary
                      </div>
                      <div
                        style={{
                          flex: 1,
                          padding: '16px',
                          backgroundColor: brandingData.secondaryColor,
                          borderRadius: '8px',
                          color: '#fff',
                          textAlign: 'center',
                          fontWeight: 500,
                        }}
                      >
                        Secondary
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!loading && (
          <Card>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <Button
                variant="outline"
                size="medium"
                onClick={handleReset}
                disabled={saving || !hasChanges}
              >
                Reset Changes
              </Button>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button
                  variant="primary"
                  size="medium"
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                >
                  {saving ? 'Saving...' : 'Save Branding Settings'}
                </Button>
              </div>
            </div>
            {hasChanges && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: '#fff3cd',
                  borderRadius: '4px',
                  fontSize: '13px',
                  color: '#856404',
                }}
              >
                You have unsaved changes. Don't forget to save your branding settings.
              </div>
            )}
          </Card>
        )}
      </main>
    </div>
  );
};

export default ResellerBranding;
