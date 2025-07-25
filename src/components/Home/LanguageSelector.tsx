import React, { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'ru', label: 'Русский' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '简体中文' },
  { code: 'ko', label: '한국어' },
  // Add more as needed
];

export default function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(LANGUAGES[0]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative z-40">
      <button
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/90 dark:bg-slate-900/90 text-white font-medium shadow-lg hover:bg-slate-700/90 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Globe className="w-5 h-5" />
        <span>{selected.label}</span>
      </button>
      {open && (
        <div className="absolute bottom-12 right-0 min-w-[180px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl py-2 animate-fadeIn">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className={`w-full text-left px-5 py-2.5 font-medium text-base rounded-lg transition-all flex items-center gap-2 ${selected.code === lang.code ? 'bg-blue-100 dark:bg-slate-700 text-blue-700 dark:text-blue-300' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100'}`}
              onClick={() => { setSelected(lang); setOpen(false); }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
