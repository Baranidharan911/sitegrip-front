/**
 * Authentication utility functions for consistent user data management
 */

export interface StoredUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  idToken?: string;
  googleAuthEnabled?: boolean;
  properties?: any[];
  avatar?: string;
  preferences?: any;
}

/**
 * Check if we're in a browser environment
 */
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

/**
 * Get user data from localStorage with proper error handling
 */
export const getStoredUser = (): StoredUser | null => {
  if (!isBrowser) return null;
  
  try {
    const userData = localStorage.getItem('Sitegrip-user');
    if (!userData) return null;
    
    const parsed = JSON.parse(userData);
    
    // Handle both direct and nested user structures
    const user = parsed.user || parsed;
    
    // Validate required fields
    if (!user.uid) {
      console.warn('Invalid user data: missing uid');
      return null;
    }
    
    return {
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || user.display_name || null,
      photoURL: user.photoURL || user.photo_url || null,
      idToken: user.idToken || user.token || undefined,
      googleAuthEnabled: user.googleAuthEnabled || user.google_auth_enabled || false,
      properties: user.properties || user.search_console_properties || [],
      avatar: user.avatar || undefined,
      preferences: user.preferences || undefined
    };
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    return null;
  }
};

/**
 * Store user data in localStorage
 */
export const storeUser = (user: StoredUser): boolean => {
  if (!isBrowser) return false;
  
  try {
    localStorage.setItem('Sitegrip-user', JSON.stringify(user));
    return true;
  } catch (error) {
    console.error('Error storing user data:', error);
    return false;
  }
};

/**
 * Clear stored user data
 */
export const clearStoredUser = (): void => {
  if (!isBrowser) return;
  
  try {
    localStorage.removeItem('Sitegrip-user');
    localStorage.removeItem('Sitegrip-temp-user-id');
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};

/**
 * Get user ID from stored data
 */
export const getStoredUserId = (): string | null => {
  const user = getStoredUser();
  return user?.uid || null;
};

/**
 * Get auth token from stored data
 */
export const getStoredAuthToken = (): string | null => {
  const user = getStoredUser();
  return user?.idToken || null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const user = getStoredUser();
  return user !== null && user.uid !== null;
};

/**
 * Check if user has Google auth enabled
 */
export const hasGoogleAuth = (): boolean => {
  const user = getStoredUser();
  return user?.googleAuthEnabled === true;
}; 

/**
 * Clear all authentication-related storage data
 * This function clears all Sitegrip-related items from localStorage and sessionStorage
 */
export const clearAllAuthData = (): void => {
  if (!isBrowser) return;
  
  try {
    // Clear specific known authentication items
    localStorage.removeItem('Sitegrip-user');
    localStorage.removeItem('Sitegrip-temp-user-id');
    localStorage.removeItem('Sitegrip-user-tier-updated');
    localStorage.removeItem('processed-oauth-codes');
    sessionStorage.removeItem('redirectAfterLogin');
    
    // Clear any other Sitegrip-related items
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('Sitegrip-')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear dashboard-related data that might contain user-specific information
    localStorage.removeItem('dashboard-widgets');
    localStorage.removeItem('dashboard-layouts');
    
    // Reset theme to light mode
    localStorage.setItem('theme', 'light');
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
    }
    
    console.log('🧹 All authentication data cleared from storage');
  } catch (error) {
    console.error('Error clearing authentication data:', error);
  }
}; 
