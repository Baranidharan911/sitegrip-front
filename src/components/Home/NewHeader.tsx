import React, { useState, useEffect } from 'react';
import { Home, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

const NewHeader: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check for authenticated user
    const storedUser = localStorage.getItem('Sitegrip-user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const user = userData.user || userData;
        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
      }
    }
  }, []);

  const handleSignIn = () => {
    setLoading(true);
    router.push('/login');
  };

  const handleProfile = () => {
    setLoading(true);
    router.push('/profile');
  };

  const handleSignUp = () => {
    setLoading(true);
    router.push('/signup');
  };

  return (
    <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-6">
      <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/20 border border-gray-200/50 dark:border-white/10 rounded-2xl shadow-lg dark:shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-lg shadow-lg">
              <Home className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Site Grip</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 font-medium">
              Features
            </a>
            <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 font-medium">
              Pricing
            </a>
            <a href="#faq" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 font-medium">
              FAQ
            </a>
            <a href="#contact" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 font-medium">
              Contact
            </a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {currentUser ? (
              /* Authenticated user buttons */
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                    {currentUser.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <User className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium">
                    {currentUser.displayName || currentUser.email || 'User'}
                  </span>
                </div>
                <button 
                  onClick={handleProfile}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Dashboard'}
                </button>
              </div>
            ) : (
              /* Non-authenticated user buttons */
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleSignIn}
                  disabled={loading}
                  className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Sign In'}
                </button>
                <button 
                  onClick={handleSignUp}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Sign Up'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default NewHeader; 