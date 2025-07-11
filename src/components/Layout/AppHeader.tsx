'use client';

import { useEffect, useState, useRef } from 'react';
import { Rocket, LogOut, Moon, Sun, Menu, User, Settings, Bell, Search, Crown, Sparkles } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';

const AppHeader = () => {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const { toggleSidebar } = useSidebar();
  const { isDark, toggleTheme } = useTheme();
  const pathname = usePathname();

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only access localStorage after component is mounted
    if (!mounted) return;
    
    const fetchUser = async () => {
      try {
        const stored = localStorage.getItem('Sitegrip-user');
        if (stored) {
          const parsed = JSON.parse(stored);
          
          // Handle both nested and direct user object structures
          let userObj = parsed.user || parsed;
          
          // Just use the stored user data directly
          if (userObj && userObj.uid) {
            setUser(userObj);
          } else {
            console.warn('Invalid user data in localStorage');
            localStorage.removeItem('Sitegrip-user');
          }
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid data
        localStorage.removeItem('Sitegrip-user');
      }
    };

    fetchUser();

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mounted]);

  const handleLogout = () => {
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.removeItem('Sitegrip-user');
      window.location.href = '/login';
    }
  };

  const getInitial = (nameOrEmail: string | undefined) =>
    nameOrEmail?.trim()?.charAt(0)?.toUpperCase() || '?';

  // Defensive checks for avatar
  const avatarSrc = user?.avatar && 
    (typeof user.avatar === 'string') && 
    (user.avatar.startsWith('data:') || user.avatar.startsWith('http'))
      ? user.avatar
      : null;

  // Defensive fallback for displayName and email
  const displayName = user?.displayName || '';
  const email = user?.email || '';

  return (
    <header
      className={`
        sticky top-0 left-0 w-full z-50
        backdrop-blur-xl
        ${isDark ? 'bg-slate-900/80 text-white' : 'bg-white/80 text-slate-900'}
        shadow-lg border-b border-slate-200/50 dark:border-slate-700/50 transition-all duration-300
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left section */}
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle (Mobile) */}
            <button
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent"
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              SiteGrip
            </Link>
          </div>

          {/* Center section - Search */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8" ref={searchRef}>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search tools, reports, keywords..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Search (Mobile) */}
            <button
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>

            {/* Notifications */}
            <button
              className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {/* Upgrade Button */}
            <Link
              href="/pricing"
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Crown className="w-4 h-4" />
              <span>Upgrade</span>
            </Link>

            {/* Avatar Dropdown - Only render after mounted to prevent hydration mismatch */}
            {mounted && user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200"
                  title="User menu"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm">
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-slate-700 dark:text-slate-300">
                        {getInitial(displayName || email)}
                      </div>
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {displayName || 'User'}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {email}
                    </div>
                  </div>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-2xl py-2 z-50">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700">
                          {avatarSrc ? (
                            <img
                              src={avatarSrc}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-slate-700 dark:text-slate-300">
                              {getInitial(displayName || email)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {displayName || 'User'}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {email}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-2">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-200"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User size={16} className="text-slate-500 dark:text-slate-400" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-200"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Settings size={16} className="text-slate-500 dark:text-slate-400" />
                        <span>Settings</span>
                      </Link>
                      <Link
                        href="/pricing"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-all duration-200"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Crown size={16} className="text-slate-500 dark:text-slate-400" />
                        <span>Upgrade Plan</span>
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-slate-200/50 dark:border-slate-700/50 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-all duration-200"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile search overlay */}
        {searchOpen && (
          <div className="md:hidden py-4 border-t border-slate-200/50 dark:border-slate-700/50">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search tools, reports, keywords..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
