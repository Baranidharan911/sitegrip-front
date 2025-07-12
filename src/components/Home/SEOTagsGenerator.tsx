'use client';

import React, { useState } from 'react';

const defaultContent = '';
const defaultUrl = '';

function generateSEOTags(content: string, url: string) {
  // Simple keyword extraction (for demo)
  const words = content
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const freq: Record<string, number> = {};
  words.forEach((w: string) => (freq[w] = (freq[w] || 0) + 1));
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  const keywords = sorted.slice(0, 7).map(([w]) => w).filter((w: string) => w.length > 3);
  const primaryKeyword = keywords[0] || 'SEO';

  // Meta title (under 60 chars)
  let meta_title = content.split(/[.!?\n]/)[0] || 'SEO Optimized Webpage';
  meta_title = meta_title.slice(0, 60);
  if (!meta_title.toLowerCase().includes(primaryKeyword)) meta_title = `${primaryKeyword.charAt(0).toUpperCase() + primaryKeyword.slice(1)} | ${meta_title}`;

  // Meta description (150-160 chars)
  let meta_description = content.replace(/\n/g, ' ').slice(0, 160);
  if (!meta_description.toLowerCase().includes(primaryKeyword)) meta_description = `${primaryKeyword.charAt(0).toUpperCase() + primaryKeyword.slice(1)}: ${meta_description}`;
  if (meta_description.length < 150) meta_description = meta_description.padEnd(150, '.');

  // Headers
  const h1 = meta_title;
  const h2 = [
    `About ${primaryKeyword.charAt(0).toUpperCase() + primaryKeyword.slice(1)}`,
    `Benefits of ${primaryKeyword.charAt(0).toUpperCase() + primaryKeyword.slice(1)}`,
  ];
  const h3 = [
    `How to use ${primaryKeyword}`,
    `Best practices for ${primaryKeyword}`,
    `Common mistakes in ${primaryKeyword}`,
  ];

  // Open Graph
  const og_title = meta_title.length < 50 ? meta_title + ' - Learn More' : meta_title;
  const og_description = meta_description;
  const og_type = 'website';
  const og_image_suggestion = 'A high-quality image representing the main topic of the page.';
  const og_url = url;

  // Twitter Card
  const twitter_card = 'summary_large_image';
  const twitter_title = meta_title;
  const twitter_description = meta_description;
  const twitter_image_suggestion = og_image_suggestion;

  // Canonical
  const canonical_url = url;
  const language = 'en-US';

  return {
    meta_title,
    meta_description,
    keywords,
    headers: {
      h1,
      h2,
      h3,
    },
    open_graph: {
      og_title,
      og_description,
      og_type,
      og_image_suggestion,
      og_url,
    },
    twitter_card: {
      twitter_card,
      twitter_title,
      twitter_description,
      twitter_image_suggestion,
    },
    canonical_url,
    language,
  };
}

const SEOTagsGenerator = () => {
  const [content, setContent] = useState<string>(defaultContent);
  const [url, setUrl] = useState<string>(defaultUrl);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const handleGenerate = () => {
    setError('');
    if (!content.trim() || !url.trim()) {
      setError('Please provide both webpage content and URL.');
      return;
    }
    try {
      const tags = generateSEOTags(content, url);
      setOutput(JSON.stringify(tags, null, 2));
    } catch (e: unknown) {
      setError('Failed to generate SEO tags.');
    }
  };

  return (
    <section className="relative z-10 px-6 py-16 max-w-4xl mx-auto">
      <div className="bg-white/80 dark:bg-gray-900/60 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 p-8 backdrop-blur-lg">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 text-center">SEO Tags Generator</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 text-center">Paste your webpage content and URL to generate a complete, optimized set of SEO tags in JSON format.</p>
        <div className="flex flex-col gap-6">
          <textarea
            className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 p-4 text-base text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-400 outline-none min-h-[120px] resize-vertical shadow-sm placeholder-gray-700 dark:placeholder-gray-400"
            placeholder="Paste the full text content of the webpage here..."
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <input
            className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 p-4 text-base text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-400 outline-none shadow-sm placeholder-gray-700 dark:placeholder-gray-400"
            placeholder="Enter the full URL of the page (e.g., https://www.example.com/page)"
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
          <button
            className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:from-purple-600 hover:to-cyan-600 transition-all text-lg mt-2"
            onClick={handleGenerate}
          >
            Generate SEO Tags
          </button>
          {error && <div className="text-red-500 text-center font-medium mt-2">{error}</div>}
          {output && (
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Generated SEO Tags (JSON):</h3>
              <pre className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-sm overflow-x-auto text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-inner">
                {output}
              </pre>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SEOTagsGenerator; 