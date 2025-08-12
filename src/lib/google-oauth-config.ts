// Google OAuth Configuration with Verification Fix
export const GOOGLE_OAUTH_CONFIG = {
  // Production OAuth Settings
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
  
  // OAuth Scopes (minimal for verification)
  scopes: [
    // Use only non-sensitive scopes for sign-in/sign-up to avoid the
    // "Google hasn’t verified this app" interstitial. Access to
    // Google APIs like Search Console, Indexing, and Analytics should
    // be performed via the service account configured below.
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ],
  
  // Verification Settings
  appName: 'SiteGrip',
  appHomepage: 'https://www.sitegrip.com',
  appPrivacyPolicy: 'https://www.sitegrip.com/privacy',
  appTermsOfService: 'https://www.sitegrip.com/terms',
  developerEmail: 'sitegrip@gmail.com',
  
  // Service Account Fallback
  serviceAccountJson: process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
  
  // Environment Detection
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // Verification Status
  isVerified: false, // Set to true after Google verification
  useServiceAccountFallback: true, // Use service account if OAuth fails
};

// OAuth URL Generator with Verification Fix
export function generateOAuthUrl(state?: string): string {
  const { clientId, redirectUri, scopes, isDevelopment } = GOOGLE_OAUTH_CONFIG;

  if (!clientId || !redirectUri) {
    throw new Error('GOOGLE_CLIENT_ID or GOOGLE_REDIRECT_URI is not configured');
  }

  const params = new URLSearchParams();
  params.set('client_id', clientId);
  params.set('redirect_uri', redirectUri);
  params.set('response_type', 'code');
  params.set('scope', scopes.join(' '));
  params.set('access_type', 'offline');
  // Only request consent when necessary; default behavior avoids
  // extra interstitials for returning users.

  if (state) {
    params.set('state', state);
  }

  // Add verification bypass for development
  if (isDevelopment) {
    params.set('prompt', 'consent');
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

// Service Account Authentication
export function getServiceAccountAuth() {
  if (!GOOGLE_OAUTH_CONFIG.serviceAccountJson) {
    throw new Error('Service account JSON not configured');
  }
  
  const serviceAccount = JSON.parse(GOOGLE_OAUTH_CONFIG.serviceAccountJson);
  
  return {
    type: 'service_account',
    project_id: serviceAccount.project_id,
    private_key_id: serviceAccount.private_key_id,
    private_key: serviceAccount.private_key,
    client_email: serviceAccount.client_email,
    client_id: serviceAccount.client_id,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: serviceAccount.client_x509_cert_url,
  };
}

// Hybrid Authentication Strategy
export async function authenticateWithFallback(userId?: string) {
  try {
    // Try OAuth first if user has valid credentials
    if (userId) {
      const oauthClient = await getOAuthClient(userId);
      if (oauthClient) {
        return oauthClient;
      }
    }
  } catch (error) {
    console.log('OAuth authentication failed, using service account fallback');
  }
  
  // Fallback to service account
  return getServiceAccountAuth();
}

// Helper function to get OAuth client (implement based on your storage)
async function getOAuthClient(userId: string) {
  // Implementation depends on how you store OAuth tokens
  // This is a placeholder - implement based on your token storage
  return null;
} 