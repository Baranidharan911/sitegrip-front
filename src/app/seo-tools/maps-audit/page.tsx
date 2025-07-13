'use client';
import { useState } from 'react';
import { Search, BarChart3, Star, Image, MapPin, CheckCircle, AlertCircle, TrendingUp, Download, Share2, Settings, Eye, Clock, Users, Zap, Target, ArrowUpRight, Info, Filter, MoreVertical, ExternalLink, RefreshCw, Map, Globe, Smartphone, Monitor } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
            <Map className="w-8 h-8 text-purple-500" />
            Google Maps Audit
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Comprehensive audit of your business presence across all major mapping platforms
          </p>
        </div>

        {/* Search Input */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Business Information</h2>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base text-gray-900 dark:text-gray-100 placeholder-gray-700 dark:placeholder-gray-400"
                placeholder="Enter Google Maps business URL"
                value={input}
                onChange={e => setInput(e.target.value)}
              />
            </div>
            <button
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold text-lg shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all flex items-center gap-2"
              onClick={handleRunAudit}
              disabled={loading || !input}
            >
              <Zap className="w-5 h-5" />
              {loading ? 'Auditing...' : 'Run Audit'}
            </button>
          </div>
        </div>

        {showAudit && (
          <>
            {loading && (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="animate-spin w-8 h-8 text-purple-500" />
                <span className="ml-2 text-lg text-purple-700 dark:text-purple-300">Auditing business...</span>
              </div>
            )}
            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg p-4 mb-6">
                {error}
              </div>
            )}
            {auditData && auditData.platform === 'google' && auditData.placeData && auditData.placeData.result && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Map and business info */}
                <div>
                  {/* Map Embed */}
                  {auditData.placeData.result.geometry && auditData.placeData.result.geometry.location && (
                    <div className="rounded-2xl overflow-hidden shadow mb-4 h-72">
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
                  )}
                  {/* Business Info ... (existing code) */}
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-purple-500" />
                    {auditData.placeData.result.name}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">{auditData.placeData.result.formatted_address}</p>
                  {auditData.placeData.result.international_phone_number && (
                    <p className="text-gray-700 dark:text-gray-300 mb-2">Phone: {auditData.placeData.result.international_phone_number}</p>
                  )}
                  {auditData.placeData.result.website && (
                    <a href={auditData.placeData.result.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline mb-2 block">{auditData.placeData.result.website}</a>
                  )}
                  <div className="flex gap-6 mt-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="font-semibold text-lg">{auditData.placeData.result.user_ratings_total || 0}</span>
                      <span className="text-gray-500 dark:text-gray-400">Reviews</span>
                    </div>
                    {auditData.placeData.result.photos && (
                      <div className="flex items-center gap-2">
                        <Image className="w-5 h-5 text-purple-500" />
                        <span className="font-semibold text-lg">{auditData.placeData.result.photos.length}</span>
                        <span className="text-gray-500 dark:text-gray-400">Photos</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-semibold text-lg">Active</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <a href={auditData.placeData.result.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-all">
                      <ExternalLink className="w-4 h-4" />
                      View on Google Maps
                    </a>
                  </div>
                </div>
                {/* Right: Competitor Insights */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    Competitor Insights
                  </h3>
                  {loadingCompetitors ? (
                    <div className="animate-pulse space-y-4">
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  ) : competitors.length > 0 ? (
                    <div className="space-y-4">
                      {competitors.map((c, i) => (
                        <div key={c.place_id} className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-purple-400" />
                            <span className="font-semibold text-lg">{c.name}</span>
                          </div>
                          <span className="text-gray-500 dark:text-gray-400 text-sm">{c.vicinity}</span>
                          <div className="flex gap-4 mt-1">
                            <span className="flex items-center gap-1 text-yellow-600"><Star className="w-4 h-4" />{c.rating || '-'} ({c.user_ratings_total || 0} reviews)</span>
                            <span className="flex items-center gap-1 text-blue-600"><Globe className="w-4 h-4" />{c.types?.[0] || ''}</span>
                            <span className="flex items-center gap-1 text-gray-600"><ArrowUpRight className="w-4 h-4" />{c.distance ? `${c.distance}m` : ''}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400">No competitors found nearby.</div>
                  )}
                </div>
              </div>
            )}
            {auditData && auditData.platform !== 'google' && (
              <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg p-4 mb-6">
                Support for this platform is coming soon.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 