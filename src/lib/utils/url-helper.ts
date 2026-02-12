/**
 * URL Helper Utilities
 * Handles dynamic URL generation for both localhost and production environments
 */

/**
 * Get the base URL of the application
 * Works for localhost, Vercel, and custom domains
 */
export function getBaseUrl(): string {
  // Browser environment
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Server environment
  // Priority: NEXT_PUBLIC_APP_URL > VERCEL_URL > localhost
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Fallback to localhost
  return `http://localhost:${process.env.PORT || 3000}`;
}

/**
 * Get API base URL
 */
export function getApiUrl(path: string): string {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running on localhost
 */
export function isLocalhost(): boolean {
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
  }
  
  return !process.env.VERCEL_URL && !process.env.NEXT_PUBLIC_APP_URL;
}

/**
 * Get CORS origin for video services
 */
export function getCorsOrigin(): string {
  const baseUrl = getBaseUrl();
  
  // In development, allow all origins for easier testing
  if (!isProduction()) {
    return "*";
  }
  
  return baseUrl;
}
