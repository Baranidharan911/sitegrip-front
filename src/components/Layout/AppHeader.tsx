'use client';

import { useEffect, useState, useRef } from 'react';
import { Rocket, LogOut, Moon, Sun, Menu, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';

const AppHeader = () => {
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toggleSidebar } = useSidebar();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('Sitegrip-user');
    window.location.href = '/login';
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
        backdrop-blur-md
        ${theme === 'dark' ? 'bg-black/30 text-white' : 'bg-white/60 text-gray-900'}
        shadow-md border-b border-white/10 transition-all
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-extrabold text-purple-600 dark:text-purple-300"
          >
            <Rocket className="w-6 h-6" />
            Site Grip
          </Link>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-purple-600" />
              )}
            </button>

            {/* Avatar Dropdown */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-9 h-9 rounded-full overflow-hidden border-2 border-indigo-500 dark:border-purple-300 bg-white dark:bg-gray-700 shadow-sm"
                  title="User menu"
                >
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt="Avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-indigo-700 dark:text-white">
                      {getInitial(displayName || email)}
                    </div>
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-2 z-50">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User size={16} />
                      Edit Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-100 dark:hover:bg-red-900 w-full transition"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Sidebar Toggle (Mobile) */}
            <button
              className="md:hidden p-2 rounded bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5 text-purple-600 dark:text-purple-300" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
