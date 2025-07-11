import React, { useState, useEffect } from 'react';
import { Home, User, Search, BellRing, FileText, Gauge, Code, CheckCircle, TrendingUp, Grid, Users, Briefcase, Globe, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { useTranslation } from 'react-i18next';

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
      { icon: <Code className="w-5 h-5 text-cyan-500" />, title: 'Broken Link Checker', desc: 'Scan for broken internal and external links.', badge: 'New' },
      { icon: <CheckCircle className="w-5 h-5 text-green-500" />, title: 'Uptime Monitoring', desc: 'Get instant alerts if your site goes down.' },
      { icon: <TrendingUp className="w-5 h-5 text-orange-500" />, title: 'Keyword Tracking', desc: 'Track your Google search rankings for key terms.' },
      { icon: <Grid className="w-5 h-5 text-red-500" />, title: 'Sitemap Manager', desc: 'Generate, validate, and submit your XML sitemap.', badge: 'Beta' },
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

const languages = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
];

const LanguageSelector = () => {
  const [mounted, setMounted] = useState(false);
  const { i18n } = useTranslation();
  const current = i18n.language || 'en';
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="relative group">
        <button className="flex items-center px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/60 shadow hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Globe className="w-6 h-6 mr-2 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-100 mr-1">English</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    );
  }
  return (
    <div className="relative group">
      <button className="flex items-center px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/60 shadow hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <Globe className="w-6 h-6 mr-2 text-purple-600 dark:text-purple-400" />
        <span className="text-sm font-medium text-gray-800 dark:text-gray-100 mr-1">{languages.find(l => l.code === current)?.label || 'English'}</span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>
      <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded shadow-lg z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200">
        {languages.map(lang => (
          <button
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-purple-100 dark:hover:bg-gray-800 ${current === lang.code ? 'bg-purple-50 dark:bg-gray-800 font-semibold' : ''}`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const NewHeader: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { t } = useTranslation();

  // Fallback function for when translations are not available
  const translate = (key: string) => {
    if (!mounted) {
      // Return the key as fallback during SSR
      return key;
    }
    try {
      return t(key);
    } catch {
      // Return the key as fallback if translation fails
      return key;
    }
  };

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
            {loading ? translate('Loading...') : translate('Sign in')}
          </button>
          <button 
            onClick={handleSignUp}
            disabled={loading}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50"
          >
            {loading ? translate('Loading...') : translate('Sign up')}
          </button>
        </div>
      );
    }
  };

  // Dropdown hover handlers with delay for smoothness
  const handleDropdownEnter = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setShowDropdown(true);
    setDropdownVisible(true);
  };
  const handleDropdownLeave = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    dropdownTimeout.current = setTimeout(() => {
      setShowDropdown(false);
      setDropdownVisible(false);
    }, 120); // Small delay to allow moving between link and dropdown
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
            <div
              className="relative group"
              onMouseEnter={handleDropdownEnter}
              onMouseLeave={handleDropdownLeave}
            >
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 font-medium cursor-pointer">
                {translate('Product')}
              </a>
              {/* Dropdown: always rendered, smooth transition */}
              <div
                className={`absolute left-0 top-full mt-2 w-[900px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl z-50 p-8 transition-all duration-300 ease-in-out
                  ${showDropdown ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
              >
                <div className="grid grid-cols-3 gap-10">
                  {featuresDropdown.map(section => (
                    <div key={section.section}>
                      <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-4 tracking-wider pl-2">{section.section}</div>
                      <div className="flex flex-col gap-3">
                        {section.items.map(item => (
                          <a
                            key={item.title}
                            href="#"
                            className="group flex items-start gap-3 rounded-lg px-2 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                          >
                            <span className="mt-1">{item.icon}</span>
                            <span className="flex flex-col">
                              <span className="font-semibold text-gray-900 dark:text-white text-base group-hover:text-purple-700 dark:group-hover:text-purple-300">{item.title}
                                {item.badge && (
                                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold align-middle ${item.badge === 'New' ? 'bg-yellow-200 text-yellow-800' : 'bg-purple-200 text-purple-800'}`}>{item.badge}</span>
                                )}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-300 mt-0.5">{item.desc}</span>
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 font-medium">
              {translate('Pricing')}
            </a>
            <a href="#faq" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 font-medium">
              {translate('Resources')}
            </a>
            <a href="#contact" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 font-medium">
              {translate('Enterprise')}
            </a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <LanguageSelector />
            {renderAuthButtons()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default NewHeader; 
