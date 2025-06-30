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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
              <Globe2 className="text-white" size={24} />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent drop-shadow-lg">
              Hreflang Tag Generator
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg max-w-xl mx-auto">
            Generate hreflang tags for international SEO and multilingual websites
          </p>
        </motion.div>

        {/* Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">URL & Language Mapping</h3>
              <button
                onClick={addEntry}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-md"
              >
                <Plus size={16} />
                Add Entry
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <AnimatePresence>
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex gap-3 items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex-1">
                    <input
                      type="url"
                      value={entry.url}
                      onChange={(e) => updateEntry(entry.id, 'url', e.target.value)}
                      placeholder="https://example.com/page"
                      className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="w-48">
                    <select
                      value={entry.hreflang}
                      onChange={(e) => updateEntry(entry.id, 'hreflang', e.target.value)}
                      className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
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
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={16} />
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
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Code size={20} className="text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Generated Hreflang Tags</h3>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
          </div>
          <div className="p-4">
            <pre className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 text-xs font-mono overflow-x-auto border border-gray-200 dark:border-gray-700 transition-all duration-200">
              {generateHreflangTags()}
            </pre>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4"
        >
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">How to Use Hreflang Tags:</h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
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