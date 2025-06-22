'use client';

import { useState, useEffect } from 'react';
import { Rocket, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="fixed w-full z-50 bg-white bg-opacity-80 dark:bg-gray-900 dark:bg-opacity-90 backdrop-blur-md py-4 shadow-lg rounded-b-xl">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <a
          href="/"
          className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center"
        >
          <Rocket className="w-8 h-8 mr-2 text-purple-600 dark:text-purple-400" />
          WebWatch Pro
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-8 text-lg font-medium">
          {['features', 'pricing', 'about', 'contact'].map((link) => (
            <a
              key={link}
              href={`#${link}`}
              className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors"
            >
              {link.charAt(0).toUpperCase() + link.slice(1)}
            </a>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-purple-600" />
              )}
            </button>
          )}

          {/* Sign Up (Desktop Only) */}
          <a
            href="/login"
            className="hidden md:inline-block bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Sign up for free →
          </a>

          {/* Mobile Menu Icon */}
          <button className="md:hidden text-gray-800 dark:text-white" onClick={toggleMenu}>
            {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 px-6 pt-4 pb-6 space-y-4 border-t border-gray-200 dark:border-gray-700">
          {['features', 'pricing', 'about', 'contact'].map((link) => (
            <a
              key={link}
              href={`#${link}`}
              onClick={() => setIsOpen(false)}
              className="block text-gray-800 dark:text-gray-200 text-lg"
            >
              {link.charAt(0).toUpperCase() + link.slice(1)}
            </a>
          ))}
          <a
            href="/login"
            className="block text-white font-semibold text-lg mt-2 bg-purple-600 hover:bg-purple-700 rounded-full px-4 py-2 text-center"
          >
            Sign up for free
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;
