'use client';

import { sidebarItems } from '@/lib/sidebarConfig';
import { useSidebar } from '@/context/SidebarContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { ChevronDown, ChevronRight } from 'lucide-react';

const AppSidebar = () => {
  const [mounted, setMounted] = useState(false);
  const { isOpen } = useSidebar();
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>('Indexing');
  const { theme } = useTheme();

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use default theme during SSR to prevent hydration mismatch
  const isDark = mounted ? theme === 'dark' : false;

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen w-64 p-6
        ${
          isDark
            ? 'bg-gradient-to-br from-white/10 to-white/5'
            : 'bg-gradient-to-br from-[#f4f4f5]/60 to-[#e2e8f0]/30'
        }
        backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.1)] border-r border-white/10
        rounded-r-3xl overflow-hidden
        transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        text-sm text-gray-900 dark:text-white
      `}
    >
      {/* Optional background accents */}
      <div className="absolute top-[-80px] left-[-60px] w-60 h-60 bg-purple-400 opacity-20 rounded-full blur-3xl z-[-1]" />
      <div className="absolute bottom-[-60px] right-[-60px] w-72 h-72 bg-pink-400 opacity-10 rounded-full blur-3xl z-[-1]" />

      {/* Brand */}
      <h2 className="text-2xl font-extrabold mb-6 drop-shadow-sm">SiteGrip</h2>

      <div className="space-y-5">
        {sidebarItems.map((section) => {
          const SectionIcon = section.icon;

          return (
            <div key={section.name}>
              <button
                onClick={() => setOpen(open === section.name ? null : section.name)}
                className="flex items-center justify-between w-full text-left px-3 py-2 rounded-xl font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition"
              >
                <span className="flex items-center gap-3">
                  <SectionIcon size={18} className="text-purple-500 dark:text-purple-300" />
                  <span>{section.name}</span>
                </span>
                {open === section.name ? (
                  <ChevronDown size={18} className="text-gray-900 dark:text-white" />
                ) : (
                  <ChevronRight size={18} className="text-gray-900 dark:text-white" />
                )}
              </button>

              {open === section.name && (
                <div className="ml-6 mt-2 space-y-1">
                  {section.subItems.map((item) => {
                    const SubIcon = item.icon;
                    const isActive = pathname === item.path;

                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
                          isActive
                            ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-300 dark:bg-purple-200/20 dark:text-purple-200 dark:ring-purple-400'
                            : 'text-gray-700 hover:bg-black/5 hover:text-black dark:text-white dark:hover:text-white/90'
                        }`}
                      >
                        <SubIcon size={16} className="text-purple-500 dark:text-purple-300" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default AppSidebar;
