import React, { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { changeLanguage, languageOptions, getCurrentLanguage } from '@/lib/i18n';

export default function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(() => {
    const current = getCurrentLanguage();
    return languageOptions.find(l => l.code === current) || languageOptions[0];
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (lang: typeof selected) => {
    setSelected(lang);
    setOpen(false);
    changeLanguage(lang.code);
  };

  return (
    <div ref={ref} className="relative z-40">
      <button
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/90 dark:bg-slate-900/90 text-white font-medium shadow-lg hover:bg-slate-700/90 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Globe className="w-5 h-5" />
        <span>{selected.name}</span>
      </button>
      {open && (
        <div className="absolute bottom-12 right-0 min-w-[180px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl py-2 animate-fadeIn">
          {languageOptions.map((lang) => (
            <button
              key={lang.code}
              className={`w-full text-left px-5 py-2.5 font-medium text-base rounded-lg transition-all flex items-center gap-2 ${selected.code === lang.code ? 'bg-blue-100 dark:bg-slate-700 text-blue-700 dark:text-blue-300' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100'}`}
              onClick={() => handleSelect(lang)}
            >
              <span className="mr-2">{lang.flag}</span> {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
