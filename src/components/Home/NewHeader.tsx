import React, { useState, useEffect } from 'react';
import { Home, User, Search, BellRing, FileText, Gauge, Code, CheckCircle, TrendingUp, Grid, Users, Briefcase, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

const featuresDropdown = [
  {
    section: 'Core Features',
    items: [
      {
        icon: <Search className="w-6 h-6 text-purple-500" />, title: 'Deep Dive SEO Audits', desc: 'Uncover hidden SEO issues and optimize your site for search engines.'
      },
      {
        icon: <BellRing className="w-6 h-6 text-blue-500" />, title: 'Reliable Uptime Monitoring', desc: '24/7 monitoring and instant alerts for maximum uptime.'
      },
    ]
  },
  {
    section: 'SEO Tools',
    items: [
      { icon: <FileText className="w-5 h-5 text-purple-500" />, title: 'On-Page SEO Analysis', desc: 'Analyze titles, meta descriptions, headers, and content quality.' },
      { icon: <Gauge className="w-5 h-5 text-blue-500" />, title: 'Site Speed & Vitals', desc: 'Monitor Core Web Vitals and get speed recommendations.' },
      { icon: <Code className="w-5 h-5 text-cyan-500" />, title: 'Broken Link Checker', desc: 'Scan for broken internal and external links.' },
      { icon: <CheckCircle className="w-5 h-5 text-green-500" />, title: 'Uptime Monitoring', desc: 'Get instant alerts if your site goes down.' },
      { icon: <TrendingUp className="w-5 h-5 text-orange-500" />, title: 'Keyword Tracking', desc: 'Track your Google search rankings for key terms.' },
      { icon: <Grid className="w-5 h-5 text-red-500" />, title: 'Sitemap Manager', desc: 'Generate, validate, and submit your XML sitemap.' },
    ]
  },
  {
    section: 'Who We Serve',
    items: [
      { icon: <Users className="w-5 h-5 text-purple-500" />, title: 'Bloggers & Publishers', desc: 'Get your content seen by Google immediately.' },
      { icon: <Briefcase className="w-5 h-5 text-blue-500" />, title: 'SaaS & Startups', desc: 'Fast indexing and monitoring for new features and sites.' },
      { icon: <Globe className="w-5 h-5 text-emerald-500" />, title: 'Marketing Agencies', desc: 'Manage multiple client sites and deliver bulletproof reports.' },
    ]
  }
];

// Helper: Card for dropdown feature
const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-white/80 dark:bg-gray-900/70 rounded-lg p-3 flex flex-col items-start shadow-sm group-hover:shadow-md border border-gray-200 dark:border-gray-800 hover:border-purple-400 transition-all duration-200 cursor-pointer">
    <div className="mb-2">{icon}</div>
    <div className="font-semibold text-gray-900 dark:text-white text-xs mb-1 leading-tight">{title}</div>
    <div className="text-xs text-gray-600 dark:text-gray-300 leading-tight line-clamp-2">{desc}</div>
  </div>
);

const NewHeader: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only access localStorage after component is mounted
    if (!mounted) return;
    
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
  }, [mounted]);

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

  // Render auth buttons with loading state until mounted
  const renderAuthButtons = () => {
    if (!mounted) {
      return (
        <div className="flex items-center space-x-3">
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-10 w-16"></div>
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-10 w-20"></div>
        </div>
      );
    }

    if (currentUser) {
      return (
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
      );
    } else {
      return (
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
      );
    }
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
          
          <nav className="hidden md:flex items-center space-x-8 relative">
            <div className="relative group">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 font-medium cursor-pointer">
                Features
              </a>
              {/* Dropdown */}
              <div className="absolute left-0 top-full mt-3 w-[600px] bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50 p-6 space-y-6">
                {featuresDropdown.map(section => (
                  <div key={section.section}>
                    <div className="text-xs font-bold text-purple-500 uppercase mb-3 tracking-wider">{section.section}</div>
                    <div className="grid grid-cols-3 gap-3">
                      {section.items.map(item => (
                        <FeatureCard key={item.title} icon={item.icon} title={item.title} desc={item.desc} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
            {renderAuthButtons()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default NewHeader; 