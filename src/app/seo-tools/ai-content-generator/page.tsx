'use client';
import { useState } from 'react';
import { Sparkles, Copy, RefreshCw, HelpCircle } from 'lucide-react';
import HowToUseSection from '@/components/Common/HowToUseSection';

const mockContent = [
  'Boost your local SEO by optimizing your Google Business Profile. Add high-quality photos, encourage customer reviews, and keep your business information up to date.',
  'Engage your audience with regular posts about your services, promotions, and customer success stories. Consistency builds trust and visibility.',
  'Respond promptly to all reviews—positive or negative. Show customers you care and improve your reputation in local search results.',
];

export default function AIContentGeneratorPage() {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setContent(mockContent[Math.floor(Math.random() * mockContent.length)]);
      setLoading(false);
    }, 1000);
  };

  const handleCopy = () => {
    if (content) navigator.clipboard.writeText(content);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-2xl mx-auto mt-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-500" /> AI Content Generator
          </h1>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
            {showHelp ? 'Hide Help' : 'How to Use'}
          </button>
        </div>
        
        <p className="text-center text-gray-600 dark:text-gray-300 mb-10">Generate engaging, SEO-optimized content for your business. Enter a topic or keyword and let AI do the rest!</p>

        {/* Help Section */}
        {showHelp && (
          <HowToUseSection
            title="How to Use AI Content Generator"
            description="Generate SEO-optimized content for your business using AI. Create engaging posts, descriptions, and marketing copy that resonates with your audience."
            steps={[
              {
                title: "Enter a topic or keyword",
                description: "Type a specific topic, keyword, or content idea you want to generate content about"
              },
              {
                title: "Click 'Generate'",
                description: "Our AI will analyze your topic and create relevant, engaging content"
              },
              {
                title: "Review the content",
                description: "Read through the generated content and make any necessary adjustments"
              },
              {
                title: "Use or regenerate",
                description: "Copy the content for use or regenerate if you need a different approach"
              }
            ]}
            examples={[
              {
                type: "Service Description",
                example: "Google Business Profile optimization",
                description: "Generate content about your services"
              },
              {
                type: "Local SEO Tips",
                example: "local SEO strategies for restaurants",
                description: "Create educational content for your audience"
              },
              {
                type: "Customer Success",
                example: "customer testimonials and reviews",
                description: "Generate content about customer experiences"
              }
            ]}
            tips={[
              {
                title: "Be Specific",
                content: "The more specific your topic, the better the generated content will be"
              },
              {
                title: "Review and Edit",
                content: "Always review AI-generated content before publishing"
              },
              {
                title: "Use Keywords",
                content: "Include relevant keywords to improve SEO performance"
              }
            ]}
            proTip="Combine multiple generated pieces of content to create comprehensive blog posts or social media campaigns. This saves time while maintaining quality."
          />
        )}

        <div className="flex gap-4 mb-8 justify-center">
          <input
            type="text"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base text-gray-900 dark:text-gray-100 placeholder-gray-700 dark:placeholder-gray-400"
            placeholder="Enter topic or keyword (e.g. Google reviews)"
            value={topic}
            onChange={e => setTopic(e.target.value)}
          />
          <button
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold text-lg shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all"
            onClick={handleGenerate}
            disabled={loading || !topic}
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
        {content && (
          <div className="bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI-Generated Content</h2>
              <div className="flex gap-2">
                <button
                  className="px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold shadow hover:from-purple-600 hover:to-purple-700 transition flex items-center gap-1 text-xs"
                  onClick={handleGenerate}
                  disabled={loading}
                >
                  <RefreshCw className="w-4 h-4" /> Regenerate
                </button>
                <button
                  className="px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow hover:from-blue-600 hover:to-cyan-600 transition flex items-center gap-1 text-xs"
                  onClick={handleCopy}
                >
                  <Copy className="w-4 h-4" /> Copy
                </button>
              </div>
            </div>
            <textarea
              className="w-full min-h-[120px] rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 p-3 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base text-gray-900 dark:text-gray-100"
              value={content}
              readOnly
            />
          </div>
        )}
      </div>
    </div>
  );
} 