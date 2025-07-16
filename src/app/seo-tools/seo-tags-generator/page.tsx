import React, { useState } from 'react';
import SEOTagsGenerator from '@/components/Home/SEOTagsGenerator';
import HowToUseSection from '@/components/Common/HowToUseSection';
import { HelpCircle } from 'lucide-react';

const SEOTagsGeneratorPage = () => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
                <span className="w-8 h-8 text-purple-500">🏷️</span>
                SEO Tags Generator
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Generate optimized meta tags, titles, and descriptions for better search engine visibility
              </p>
            </div>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              {showHelp ? 'Hide Help' : 'How to Use'}
            </button>
          </div>

          {/* Help Section */}
          {showHelp && (
            <HowToUseSection
              title="How to Use SEO Tags Generator"
              description="Generate optimized meta tags, titles, and descriptions that improve your search engine rankings and click-through rates."
              steps={[
                {
                  title: "Enter your content details",
                  description: "Provide your page title, description, and target keywords"
                },
                {
                  title: "Select tag types",
                  description: "Choose which SEO tags you want to generate (meta title, description, etc.)"
                },
                {
                  title: "Generate tags",
                  description: "Click generate to create optimized tags based on SEO best practices"
                },
                {
                  title: "Review and implement",
                  description: "Copy the generated tags and add them to your website"
                }
              ]}
              examples={[
                {
                  type: "Meta Title",
                  example: "Best Plumbing Services in New York | Joe's Plumbing",
                  description: "Optimized title with keyword and brand name"
                },
                {
                  type: "Meta Description",
                  example: "Professional plumbing services in NYC. 24/7 emergency repairs, installations, and maintenance. Licensed and insured. Call today!",
                  description: "Compelling description that encourages clicks"
                },
                {
                  type: "Open Graph Tags",
                  example: "og:title, og:description, og:image",
                  description: "Social media optimization tags"
                }
              ]}
              tips={[
                {
                  title: "Keep Titles Under 60 Characters",
                  content: "Search engines typically display only the first 60 characters"
                },
                {
                  title: "Include Primary Keywords",
                  content: "Place your main keyword near the beginning of titles and descriptions"
                },
                {
                  title: "Make Descriptions Compelling",
                  content: "Write descriptions that encourage users to click through"
                }
              ]}
              proTip="Use long-tail keywords in your meta descriptions to capture more specific search intent. This often leads to higher conversion rates."
            />
          )}
        </div>

        {/* Main Component */}
        <SEOTagsGenerator />
      </div>
    </div>
  );
};

export default SEOTagsGeneratorPage; 