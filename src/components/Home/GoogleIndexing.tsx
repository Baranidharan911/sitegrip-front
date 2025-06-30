import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useIndexingBackend } from '@/hooks/useIndexingBackend';
import GoogleAuthButton from '../Indexing/GoogleAuthButton';

const GoogleIndexing: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  const {
    loading,
    authState,
    getGoogleAuthUrl,
    revokeGoogleAccess,
    refreshAuthStatus,
  } = useIndexingBackend();

  const features = [
    {
      title: 'New Content:',
      description: 'Get your new blog posts and pages discovered instantly.',
    },
    {
      title: 'Updated Pages:',
      description: 'Push content updates to Google to reflect changes faster.',
    },
    {
      title: 'Batch Submissions:',
      description: 'Submit up to 200 URLs per day with our Pro plan.',
    },
  ];

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only access localStorage after component is mounted
    if (!mounted) return;
    
    // Load user from localStorage
    const storedUser = localStorage.getItem('Sitegrip-user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const user = userData.user || userData;
        setCurrentUser(user);
        
        // Refresh auth status when component mounts
        if (user?.uid) {
          refreshAuthStatus();
        }
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
      }
    }
  }, [mounted, refreshAuthStatus]);

  const handleConnectGoogle = async () => {
    try {
      if (!currentUser?.uid) {
        // If user is not logged in, show auth dialog
        setShowAuthDialog(true);
        return;
      }
      
      const authUrl = await getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to get Google auth URL:', error);
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      await revokeGoogleAccess();
      await refreshAuthStatus();
    } catch (error) {
      console.error('Failed to disconnect Google:', error);
    }
  };

  const handleCloseAuthDialog = () => {
    setShowAuthDialog(false);
  };

  // Don't render auth-dependent content until mounted to prevent hydration mismatch
  const renderAuthButton = () => {
    if (!mounted) {
      return (
        <div className="mt-8 animate-pulse">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-12 w-full"></div>
        </div>
      );
    }
    
    return (
      <div className="mt-8">
        <GoogleAuthButton 
          isAuthenticated={authState?.isAuthenticated || false}
          properties={authState?.properties || []}
          onConnect={handleConnectGoogle}
          onDisconnect={handleDisconnectGoogle}
          loading={loading}
          user={authState?.user || currentUser}
        />
      </div>
    );
  };

  return (
    <section className="relative z-10 px-6 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-20 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-8">
              Instant <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">Google Indexing</span>,<br />
              Guaranteed
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
              Tired of waiting for Google to discover your new pages or updates? We connect directly to Google's own Indexing API, telling them about your pages the moment you publish. Get indexed in hours, not days or weeks.
            </p>
            
            <div className="space-y-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <span className="text-gray-900 dark:text-white font-semibold text-lg">{feature.title}</span>
                    <span className="text-gray-600 dark:text-gray-300 ml-2 text-lg">{feature.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative order-1 lg:order-2">
            <div className="bg-white/90 dark:bg-gray-900/20 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-white/10 overflow-hidden shadow-2xl">
              <div className="bg-gray-100/80 dark:bg-gray-800/50 px-6 py-4 border-b border-gray-200/50 dark:border-white/10">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              
              <div className="p-8 font-mono text-sm">
                <div className="text-purple-400 mb-2">POST</div>
                <div className="text-gray-700 dark:text-gray-300 mb-2">/v3/urlNotifications:publish HTTP/1.1</div>
                <div className="text-gray-700 dark:text-gray-300 mb-2">Host: indexing.googleapis.com</div>
                <div className="text-gray-700 dark:text-gray-300 mb-6">Content-Type: application/json</div>
                
                <div className="text-gray-700 dark:text-gray-300 mb-2">&#123;</div>
                <div className="text-gray-700 dark:text-gray-300 ml-4 mb-2">
                  <span className="text-blue-400">"url"</span>: 
                  <span className="text-green-400">"https://your-website.com/new-page/"</span>,
                </div>
                <div className="text-gray-700 dark:text-gray-300 ml-4 mb-2">
                  <span className="text-blue-400">"type"</span>: 
                  <span className="text-green-400">"URL_UPDATED"</span>
                </div>
                <div className="text-gray-700 dark:text-gray-300">&#125;</div>
              </div>
              
              <div className="bg-gray-50/80 dark:bg-gray-800/30 px-8 py-6 border-t border-gray-200/50 dark:border-white/10">
                <div className="text-gray-900 dark:text-white font-semibold mb-2">Direct API Connection</div>
                <div className="text-gray-600 dark:text-gray-400">We handle the technical side so you don't have to.</div>
              </div>
            </div>
            
            {renderAuthButton()}
          </div>
        </div>
      </div>

      {/* Login Required Modal */}
      {showAuthDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Login Required
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You need to be logged in to connect your Google Search Console account. Please sign in first.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleCloseAuthDialog}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleCloseAuthDialog();
                  window.location.href = '/login';
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GoogleIndexing; 
