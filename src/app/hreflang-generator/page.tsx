'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Copy, Check, Globe2, Code } from 'lucide-react';

interface HreflangEntry {
  id: string;
  url: string;
  hreflang: string;
}

const languageCodes = [
  { code: 'x-default', label: 'Default (x-default)' },
  { code: 'en', label: 'English' },
  { code: 'en-US', label: 'English (United States)' },
  { code: 'en-GB', label: 'English (United Kingdom)' },
  { code: 'es', label: 'Spanish' },
  { code: 'es-ES', label: 'Spanish (Spain)' },
  { code: 'es-MX', label: 'Spanish (Mexico)' },
  { code: 'fr', label: 'French' },
  { code: 'fr-FR', label: 'French (France)' },
  { code: 'fr-CA', label: 'French (Canada)' },
  { code: 'de', label: 'German' },
  { code: 'de-DE', label: 'German (Germany)' },
  { code: 'it', label: 'Italian' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'pt-BR', label: 'Portuguese (Brazil)' },
  { code: 'ru', label: 'Russian' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'zh', label: 'Chinese' },
  { code: 'zh-CN', label: 'Chinese (Simplified)' },
  { code: 'zh-TW', label: 'Chinese (Traditional)' },
  { code: 'ar', label: 'Arabic' },
  { code: 'hi', label: 'Hindi' },
  { code: 'nl', label: 'Dutch' },
  { code: 'sv', label: 'Swedish' },
  { code: 'da', label: 'Danish' },
  { code: 'no', label: 'Norwegian' },
  { code: 'fi', label: 'Finnish' },
  { code: 'pl', label: 'Polish' },
  { code: 'tr', label: 'Turkish' },
  { code: 'th', label: 'Thai' },
  { code: 'vi', label: 'Vietnamese' },
];

export default function HreflangGeneratorPage() {
  const [entries, setEntries] = useState<HreflangEntry[]>([
    { id: '1', url: 'https://example.com/', hreflang: 'x-default' },
    { id: '2', url: 'https://example.com/en/', hreflang: 'en' },
  ]);
  const [copied, setCopied] = useState(false);

  const addEntry = () => {
    const newEntry: HreflangEntry = {
      id: Date.now().toString(),
      url: '',
      hreflang: 'en'
    };
    setEntries([...entries, newEntry]);
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const updateEntry = (id: string, field: keyof HreflangEntry, value: string) => {
    setEntries(entries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const generateHreflangTags = () => {
    return entries
      .filter(entry => entry.url && entry.hreflang)
      .map(entry => `<link rel="alternate" hreflang="${entry.hreflang}" href="${entry.url}" />`)
      .join('\n');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateHreflangTags());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#f0f4ff] to-[#f8fafc] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
              <Globe2 className="text-white" size={28} />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent drop-shadow-lg">
              Hreflang Tag Generator
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-xl mx-auto">
            Generate hreflang tags for international SEO and multilingual websites
          </p>
        </motion.div>

        {/* Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">URL & Language Mapping</h3>
              <button
                onClick={addEntry}
                className="flex items-center gap-2 px-6 py-2 text-base bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-xl font-semibold"
              >
                <Plus size={18} />
                Add Entry
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <AnimatePresence>
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex gap-4 items-center p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-600 shadow"
                >
                  <div className="flex-1">
                    <input
                      type="url"
                      value={entry.url}
                      onChange={(e) => updateEntry(entry.id, 'url', e.target.value)}
                      placeholder="https://example.com/page"
                      className="w-full px-5 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base shadow"
                    />
                  </div>
                  <div className="w-56">
                    <select
                      value={entry.hreflang}
                      onChange={(e) => updateEntry(entry.id, 'hreflang', e.target.value)}
                      className="w-full px-5 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base shadow"
                    >
                      {languageCodes.map(lang => (
                        <option key={lang.code} value={lang.code}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => removeEntry(entry.id)}
                    disabled={entries.length <= 1}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Generated Code */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Code size={22} className="text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Generated Hreflang Tags</h3>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-6 py-2 text-base bg-white/80 dark:bg-gray-800/80 rounded-full shadow hover:bg-orange-100 dark:hover:bg-orange-900/30 transition font-semibold"
              >
                {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
          </div>
          <div className="p-6">
            <pre className="bg-gray-100/80 dark:bg-gray-900/80 rounded-xl p-6 text-xs font-mono overflow-x-auto border border-gray-200 dark:border-gray-700 transition-all duration-200 shadow-inner">
              {generateHreflangTags()}
            </pre>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-orange-50/80 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-6 shadow-xl"
        >
          <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">How to Use Hreflang Tags:</h4>
          <ul className="text-base text-orange-700 dark:text-orange-300 space-y-1">
            <li>• Add these tags to the &lt;head&gt; section of each page</li>
            <li>• Include all language versions of a page (including the current one)</li>
            <li>• Use "x-default" for the default/fallback version</li>
            <li>• Ensure all URLs are absolute and accessible</li>
            <li>• Each page should have hreflang tags pointing to all its translations</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
} 