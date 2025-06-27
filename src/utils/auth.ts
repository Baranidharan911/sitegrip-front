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
 * Get user data from localStorage with proper error handling
 */
export const getStoredUser = (): StoredUser | null => {
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