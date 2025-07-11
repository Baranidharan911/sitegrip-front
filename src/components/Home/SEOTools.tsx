import React from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Gauge, 
  Code, 
  CheckCircle, 
  TrendingUp, 
  Grid,
  MapPin,
  Target,
  MessageSquare,
  Star,
  Sparkles,
  Building2,
  Link as LinkIcon,
  Globe2,
  Users,
  BarChart3,
  Search,
  KeySquare,
  AlertCircle,
  Braces,
  Zap,
  ArrowUpRight
} from 'lucide-react';

const SEOTools: React.FC = () => {
  const toolCategories = [
    {
      name: 'Local SEO',
      description: 'Dominate local search results',
      tools: [
        {
          icon: KeySquare,
          title: 'Local Keyword Finder',
          description: 'Discover high-impact local keywords for your business',
          path: '/seo-tools/local-keyword-finder',
          color: 'from-blue-500 to-cyan-500',
          bgColor: 'bg-blue-500/20',
          badge: 'Popular'
        },
        {
          icon: TrendingUp,
          title: 'Local Rank Tracker',
          description: 'Track your local search rankings in real-time',
          path: '/seo-tools/local-rank-tracker',
          color: 'from-green-500 to-emerald-500',
          bgColor: 'bg-green-500/20'
        },
        {
          icon: Building2,
          title: 'Google Business Profile',
          description: 'Comprehensive GBP audit and optimization',
          path: '/seo-tools/gbp-audit',
          color: 'from-orange-500 to-red-500',
          bgColor: 'bg-orange-500/20'
        },
        {
          icon: LinkIcon,
          title: 'Citation Builder',
          description: 'Build and manage your business citations',
          path: '/seo-tools/citation-builder',
          color: 'from-indigo-500 to-purple-500',
          bgColor: 'bg-indigo-500/20'
        },
        {
          icon: Globe2,
          title: 'Maps Audit',
          description: 'Audit your Google Maps presence and optimization',
          path: '/seo-tools/maps-audit',
          color: 'from-emerald-500 to-green-500',
          bgColor: 'bg-emerald-500/20'
        },
        {
          icon: Users,
          title: 'Listing Management',
          description: 'Manage your business listings across directories',
          path: '/seo-tools/listing-management',
          color: 'from-blue-600 to-indigo-600',
          bgColor: 'bg-blue-600/20'
        }
      ]
    },
    {
      name: 'Competitive Intelligence',
      description: 'Analyze and outperform competitors',
      tools: [
        {
          icon: Target,
          title: 'Competitor Analysis',
          description: 'Analyze your competitors and identify opportunities',
          path: '/seo-tools/competitor-analysis',
          color: 'from-purple-500 to-pink-500',
          bgColor: 'bg-purple-500/20'
        },
        {
          icon: Search,
          title: 'Keyword Gaps',
          description: 'Find keyword opportunities your competitors rank for',
          path: '/seo-crawler/keyword-tools',
          color: 'from-pink-500 to-rose-500',
          bgColor: 'bg-pink-500/20'
        }
      ]
    },
    {
      name: 'Content & Reputation',
      description: 'Optimize content and manage reputation',
      tools: [
        {
          icon: Sparkles,
          title: 'AI Content Generator',
          description: 'Generate SEO-optimized content with AI',
          path: '/seo-tools/ai-content-generator',
          color: 'from-teal-500 to-cyan-500',
          bgColor: 'bg-teal-500/20',
          badge: 'New'
        },
        {
          icon: MessageSquare,
          title: 'Review Management',
          description: 'Monitor and respond to customer reviews',
          path: '/seo-tools/review-management',
          color: 'from-pink-500 to-rose-500',
          bgColor: 'bg-pink-500/20'
        },
        {
          icon: Star,
          title: 'Reputation Monitoring',
          description: 'Monitor your online reputation across platforms',
          path: '/seo-tools/reputation-monitoring',
          color: 'from-yellow-500 to-orange-500',
          bgColor: 'bg-yellow-500/20'
        },
        {
          icon: Braces,
          title: 'SEO Tags Generator',
          description: 'Generate meta tags and structured data',
          path: '/seo-tools/seo-tags-generator',
          color: 'from-violet-500 to-purple-500',
          bgColor: 'bg-violet-500/20'
        }
      ]
    },
    {
      name: 'Technical SEO',
      description: 'Technical optimization tools',
      tools: [
        {
          icon: Search,
          title: 'Meta Tag Analyzer',
          description: 'Analyze and optimize your meta tags',
          path: '/meta-tag-analyzer',
          color: 'from-blue-500 to-indigo-500',
          bgColor: 'bg-blue-500/20'
        },
        {
          icon: Braces,
          title: 'Schema Markup Generator',
          description: 'Generate structured data for better search results',
          path: '/schema-markup-generator',
          color: 'from-indigo-500 to-purple-500',
          bgColor: 'bg-indigo-500/20'
        },
        {
          icon: LinkIcon,
          title: 'Internal Link Checker',
          description: 'Find and fix broken internal links',
          path: '/internal-link-checker',
          color: 'from-cyan-500 to-blue-500',
          bgColor: 'bg-cyan-500/20'
        },
        {
          icon: Zap,
          title: 'Page Speed Analyzer',
          description: 'Analyze and improve your page speed',
          path: '/page-speed-analyzer',
          color: 'from-orange-500 to-red-500',
          bgColor: 'bg-orange-500/20'
        },
        {
          icon: Gauge,
          title: 'Core Web Vitals',
          description: 'Monitor and optimize Core Web Vitals',
          path: '/web-vitals-checker',
          color: 'from-green-500 to-emerald-500',
          bgColor: 'bg-green-500/20'
        },
        {
          icon: Globe2,
          title: 'Hreflang Generator',
          description: 'Generate hreflang tags for international SEO',
          path: '/hreflang-generator',
          color: 'from-purple-500 to-pink-500',
          bgColor: 'bg-purple-500/20'
        }
      ]
    }
  ];

  return (
    <section className="relative z-10 px-6 py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Complete <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">SEO Toolkit</span>
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto">
            Everything you need to dominate search results and grow your business.
          </p>
        </div>
        
        <div className="space-y-16">
          {toolCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-8">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                  {category.name}
                </h3>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  {category.description}
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.tools.map((tool, toolIndex) => (
                  <Link
                    key={toolIndex}
                    href={tool.path}
                    className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2"
                  >
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`} />
                    
                    {/* Badge */}
                    {tool.badge && (
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          tool.badge === 'Popular' 
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' 
                            : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                        }`}>
                          {tool.badge}
                        </span>
                      </div>
                    )}
                    
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.color} p-3 mb-4 shadow-lg`}>
                      <tool.icon className="w-full h-full text-white" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                        {tool.description}
                      </p>
                      
                      {/* Arrow indicator */}
                      <div className="flex items-center text-blue-500 dark:text-blue-400 font-medium text-sm">
                        <span>Try it now</span>
                        <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </div>
                    </div>

                    {/* Hover Effect */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-xl rounded-3xl p-8 border border-blue-200/20 dark:border-blue-800/20">
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
              Ready to Boost Your SEO?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
              Start using our comprehensive SEO tools to improve your search rankings, 
              analyze competitors, and grow your online presence.
            </p>
            <Link
              href="/seo-tools"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Explore All Tools
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SEOTools; 
