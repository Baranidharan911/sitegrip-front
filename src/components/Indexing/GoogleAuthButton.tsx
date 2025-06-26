'use client';

import { useState, useEffect } from 'react';
import { 
  Check, 
  AlertCircle, 
  ExternalLink, 
  Shield,
  User,
  Settings,
  Loader
} from 'lucide-react';

interface GoogleAuthButtonProps {
  className?: string;
}

export default function GoogleAuthButton({ className = '' }: GoogleAuthButtonProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    setLoading(true);
    setAuthStatus('checking');

    // Simulate checking auth status
    setTimeout(() => {
      const storedUser = localStorage.getItem('Sitegrip-user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData.user || userData);
        setAuthStatus('connected');
      } else {
        setAuthStatus('disconnected');
      }
      setLoading(false);
    }, 1000);
  };

  const handleGoogleAuth = () => {
    setLoading(true);
    
    // Simulate Google authentication
    setTimeout(() => {
      const mockUser = {
        uid: 'mock-user-123',
        email: 'user@example.com',
        display_name: 'Demo User',
        photo_url: null,
        google_auth_enabled: true,
        search_console_properties: [
          { property_url: 'https://example.com', verified: true },
          { property_url: 'https://blog.example.com', verified: true },
        ]
      };

      localStorage.setItem('Sitegrip-user', JSON.stringify({
        user: mockUser,
        success: true,
        google_integration: true,
        message: 'Successfully connected to Google APIs'
      }));

      setUser(mockUser);
      setAuthStatus('connected');
      setLoading(false);
    }, 2000);
  };

  const handleDisconnect = () => {
    localStorage.removeItem('Sitegrip-user');
    setUser(null);
    setAuthStatus('disconnected');
  };

  if (authStatus === 'checking') {
    return (
      <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex items-center justify-center">
          <Loader className="w-6 h-6 animate-spin text-purple-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Checking authentication status...</span>
        </div>
      </div>
    );
  }

  if (authStatus === 'connected' && user) {
    return (
      <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Google Integration Active
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Connected as <strong>{user.email}</strong>
              </p>
              
              {/* Connected Services */}
              <div className="space-y-2">
                <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                  <Shield className="w-4 h-4 mr-2" />
                  Google Search Console access enabled
                </div>
                <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                  <Settings className="w-4 h-4 mr-2" />
                  Mock indexing API connected
                </div>
              </div>

              {/* Properties */}
              {user.search_console_properties && user.search_console_properties.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Verified Properties ({user.search_console_properties.length})
                  </h4>
                  <div className="space-y-1">
                    {user.search_console_properties.slice(0, 3).map((prop: any, index: number) => (
                      <div key={index} className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                        <ExternalLink className="w-3 h-3 mr-2" />
                        {prop.property_url}
                      </div>
                    ))}
                    {user.search_console_properties.length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        +{user.search_console_properties.length - 3} more properties
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleDisconnect}
            className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Disconnect
          </button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center text-blue-800 dark:text-blue-200">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Demo Mode Active</span>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            This is a mock implementation for demonstration purposes. No real indexing requests are being sent to Google.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="text-center">
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <User className="w-8 h-8 text-gray-400" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Connect to Google APIs
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Connect your Google account to enable real-time indexing monitoring and Google Search Console integration.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg mb-6 text-left">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            What you'll get:
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Google Search Console integration</li>
            <li>• Mock indexing API access (demo)</li>
            <li>• Domain verification & management</li>
            <li>• Real-time status monitoring</li>
          </ul>
        </div>

        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <Loader className="w-5 h-5 animate-spin text-gray-400" />
          ) : (
            <img src="/google-logo.png" alt="Google" className="w-5 h-5" />
          )}
          <span className="text-gray-700 font-medium">
            {loading ? 'Connecting...' : 'Connect with Google'}
          </span>
        </button>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          Real-time indexing is now enabled for your domains
        </p>
      </div>
    </div>
  );
} 