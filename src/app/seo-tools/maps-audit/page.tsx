'use client';
import { useState } from 'react';
import { 
  Search, 
  BarChart3, 
  Star, 
  Image, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Download, 
  Share2, 
  Settings, 
  Eye, 
  Clock, 
  Users, 
  Zap, 
  Target, 
  ArrowUpRight, 
  Info, 
  Filter, 
  MoreVertical, 
  ExternalLink, 
  RefreshCw, 
  Map, 
  Globe, 
  Smartphone, 
  Monitor,
  HelpCircle,
  Copy,
  Link,
  Building2,
  Phone,
  Mail,
  Calendar,
  Award,
  Shield,
  Users2,
  EyeOff,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import HowToUseSection from '@/components/Common/HowToUseSection';

// Helper to get Google Maps embed URL
function getGoogleMapEmbedUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY}&q=${lat},${lng}&zoom=16`;
}

export default function MapsAuditPage() {
  const [input, setInput] = useState('');
  const [showAudit, setShowAudit] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [auditData, setAuditData] = useState<any>(null);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [loadingCompetitors, setLoadingCompetitors] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleRunAudit = async () => {
    setShowAudit(true);
    setLoading(true);
    setError('');
    setAuditData(null);
    try {
      const res = await fetch('/api/maps-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: input }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Failed to fetch business data.');
      } else {
        setAuditData(data);
      }
    } catch (err) {
      setError('Failed to fetch business data.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch competitors after auditData loads
  async function fetchCompetitors(lat: number, lng: number) {
    setLoadingCompetitors(true);
    setCompetitors([]);
    try {
      const res = await fetch('/api/maps-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng, type: 'nearby' }),
      });
      const data = await res.json();
      if (Array.isArray(data.nearby)) setCompetitors(data.nearby);
    } catch {}
    setLoadingCompetitors(false);
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const exampleUrls = [
    {
      type: 'Google Maps Business URL',
      url: 'https://maps.google.com/maps/place/...',
      description: 'Direct link to your business on Google Maps'
    },
    {
      type: 'Google Business Profile URL',
      url: 'https://business.google.com/dashboard/l/...',
      description: 'Your Google Business Profile dashboard URL'
    },
    {
      type: 'Website URL',
      url: 'https://yourbusiness.com',
      description: 'Your business website (we\'ll find the GMB listing)'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
                <Map className="w-8 h-8 text-purple-500" />
                Google Maps Audit
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Comprehensive audit of your business presence across all major mapping platforms
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
              title="How to Use Google Maps Audit"
              description="Comprehensive audit of your business presence across all major mapping platforms. Analyze your Google Business Profile, identify issues, and compare with competitors."
              steps={[
                {
                  title: "Enter your business URL",
                  description: "Paste your Google Business Profile URL, Google Maps URL, or business website"
                },
                {
                  title: "Click 'Run Audit'",
                  description: "Our system will analyze your business listing and gather comprehensive data"
                },
                {
                  title: "Review the results",
                  description: "Check your profile completeness, reviews, photos, and competitor analysis"
                },
                {
                  title: "Take action",
                  description: "Follow the recommendations to improve your local search presence"
                }
              ]}
              examples={[
                {
                  type: "Google Maps Business URL",
                  example: "https://maps.google.com/maps/place/...",
                  description: "Direct link to your business on Google Maps"
                },
                {
                  type: "Google Business Profile URL",
                  example: "https://business.google.com/dashboard/l/...",
                  description: "Your Google Business Profile dashboard URL"
                },
                {
                  type: "Website URL",
                  example: "https://yourbusiness.com",
                  description: "Your business website (we'll find the GMB listing)"
                }
              ]}
              tips={[
                {
                  title: "Profile Completeness",
                  content: "Ensure all business information is complete and accurate"
                },
                {
                  title: "Review Management",
                  content: "Monitor and respond to reviews regularly"
                },
                {
                  title: "Photo Quality",
                  content: "Upload high-quality photos that showcase your business"
                }
              ]}
              proTip="Run this audit monthly to track improvements and identify new opportunities. Focus on completing your profile 100% before optimizing other aspects."
            />
          )}
        </div>

        {/* Search Input */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-8 mb-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Building2 className="w-6 h-6 text-purple-500" />
              Business Information
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Shield className="w-4 h-4" />
              Secure & Private
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                  placeholder="Enter your Google Maps business URL or website"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                />
              </div>
              <button
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold text-lg shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleRunAudit}
                disabled={loading || !input}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Auditing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Run Audit
                  </>
                )}
              </button>
            </div>
            
            {/* Quick Examples */}
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Examples:</span>
              <div className="flex gap-2">
                {exampleUrls.slice(0, 2).map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(example.url)}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs"
                  >
                    {example.type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {showAudit && (
          <>
            {loading && (
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <RefreshCw className="animate-spin w-8 h-8 text-purple-500" />
                  <span className="text-xl font-semibold text-gray-900 dark:text-white">Auditing your business...</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">This may take a few moments while we analyze your Google Maps presence</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Audit Failed</h3>
                    <p className="text-red-800 dark:text-red-200">{error}</p>
                    <div className="mt-4">
                      <p className="text-sm text-red-700 dark:text-red-300 mb-2">Please check:</p>
                      <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                        <li>• The URL is correct and accessible</li>
                        <li>• Your business is listed on Google Maps</li>
                        <li>• Try using your business website URL instead</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {auditData && auditData.platform === 'google' && auditData.placeData && auditData.placeData.result && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Map and business info */}
                <div className="lg:col-span-2">
                  {/* Map Embed */}
                  {auditData.placeData.result.geometry && auditData.placeData.result.geometry.location && (
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg mb-6">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Map className="w-5 h-5 text-purple-500" />
                          Location Map
                        </h3>
                      </div>
                      <div className="h-80">
                        <iframe
                          title="Google Map"
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          style={{ border: 0, width: '100%', height: '100%' }}
                          src={getGoogleMapEmbedUrl(
                            auditData.placeData.result.geometry.location.lat,
                            auditData.placeData.result.geometry.location.lng
                          )}
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Business Info */}
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-purple-500" />
                        {auditData.placeData.result.name}
                      </h2>
                      <button
                        onClick={() => copyToClipboard(auditData.placeData.result.url)}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                      >
                        {copiedUrl ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        {copiedUrl ? 'Copied!' : 'Copy URL'}
                      </button>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{auditData.placeData.result.formatted_address}</span>
                      </div>
                      {auditData.placeData.result.international_phone_number && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">{auditData.placeData.result.international_phone_number}</span>
                        </div>
                      )}
                      {auditData.placeData.result.website && (
                        <div className="flex items-center gap-3">
                          <Link className="w-5 h-5 text-gray-400" />
                          <a 
                            href={auditData.placeData.result.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {auditData.placeData.result.website}
                          </a>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Star className="w-5 h-5 text-yellow-500" />
                          <span className="font-bold text-lg">{auditData.placeData.result.rating || 'N/A'}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Users2 className="w-5 h-5 text-blue-500" />
                          <span className="font-bold text-lg">{auditData.placeData.result.user_ratings_total || 0}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Reviews</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Image className="w-5 h-5 text-green-500" />
                          <span className="font-bold text-lg">{auditData.placeData.result.photos?.length || 0}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Photos</p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="font-bold text-lg">Active</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <a 
                        href={auditData.placeData.result.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View on Google Maps
                      </a>
                      <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                        <Download className="w-4 h-4" />
                        Export Report
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Right: Competitor Insights */}
                <div className="lg:col-span-1">
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      Competitor Insights
                    </h3>
                    
                    {loadingCompetitors ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                          </div>
                        ))}
                      </div>
                    ) : competitors.length > 0 ? (
                      <div className="space-y-4">
                        {competitors.slice(0, 5).map((c, i) => (
                          <div key={c.place_id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-xs font-bold text-purple-600 dark:text-purple-400">
                                {i + 1}
                              </div>
                              <span className="font-semibold text-gray-900 dark:text-white">{c.name}</span>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{c.vicinity}</p>
                            <div className="flex items-center gap-4 text-xs">
                              <span className="flex items-center gap-1 text-yellow-600">
                                <Star className="w-3 h-3" />
                                {c.rating || '-'}
                              </span>
                              <span className="flex items-center gap-1 text-blue-600">
                                <Users className="w-3 h-3" />
                                {c.user_ratings_total || 0}
                              </span>
                              <span className="flex items-center gap-1 text-gray-600">
                                <ArrowUpRight className="w-3 h-3" />
                                {c.distance ? `${c.distance}m` : ''}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No competitors found nearby</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 