'use client';

import { GSCProperty } from '@/types/indexing';

interface GoogleAuthButtonProps {
  isAuthenticated: boolean;
  properties: GSCProperty[];
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  loading: boolean;
  user?: {
    email?: string;
    display_name?: string;
  };
}

export default function GoogleAuthButton({
  isAuthenticated,
  properties,
  onConnect,
  onDisconnect,
  loading,
  user
}: GoogleAuthButtonProps) {
  
  const handleConnect = async () => {
    await onConnect();
  };

  const handleDisconnect = async () => {
    await onDisconnect();
  };

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg border ${
      isAuthenticated 
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            isAuthenticated ? 'bg-green-500' : 'bg-blue-500'
          }`}></div>
          <h3 className={`font-semibold ${
            isAuthenticated 
              ? 'text-green-800 dark:text-green-200'
              : 'text-blue-800 dark:text-blue-200'
          }`}>
            Google Search Console Integration
          </h3>
        </div>
      </div>

      {isAuthenticated ? (
        <div className="space-y-3">
          <div className="space-y-2">
            <p className="text-green-700 dark:text-green-300">
              ✅ <strong>Connected:</strong> {user?.email || user?.display_name || 'Unknown'}
            </p>
            <p className="text-green-700 dark:text-green-300">
              🔗 Connected to Google Search Console API
            </p>
            
            {properties.length > 0 && (
              <div className="mt-3">
                <p className="font-medium mb-1 text-green-800 dark:text-green-200">Search Console Properties:</p>
                <ul className="text-xs space-y-1 ml-4">
                  {properties.map((prop, index) => (
                    <li key={index} className="flex items-center gap-1 text-green-700 dark:text-green-300">
                      <span>{prop.verified ? '✅' : '❌'}</span>
                      <span>{prop.property_url || prop.site_url}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <button
            onClick={handleDisconnect}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Disconnecting...
              </>
            ) : (
              <>
                <img src="/google-logo.png" alt="Google" className="w-4 h-4" />
                Disconnect Google Search Console
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <img src="/google-logo.png" alt="Google" className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                  Connect Google Search Console
                </h4>
                <p className="text-xs text-blue-600 dark:text-blue-300">
                  Get your content indexed faster
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                <div className="text-lg font-bold text-blue-700 dark:text-blue-300">200</div>
                <div className="text-xs text-blue-600 dark:text-blue-400">URLs/day</div>
              </div>
              <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                <div className="text-lg font-bold text-green-700 dark:text-green-300">Hours</div>
                <div className="text-xs text-green-600 dark:text-green-400">Not weeks</div>
              </div>
            </div>
            
            <ul className="text-xs space-y-1 mb-4 text-gray-700 dark:text-gray-300">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                Access your Search Console properties
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                Submit URLs for instant indexing
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                Monitor indexing status in real-time
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                Track coverage and performance stats
              </li>
            </ul>
            
            <button
              onClick={handleConnect}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <img src="/google-logo.png" alt="Google" className="w-5 h-5" />
                  Connect with Google Search Console
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 
