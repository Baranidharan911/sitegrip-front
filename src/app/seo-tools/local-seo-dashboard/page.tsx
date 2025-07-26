'use client';
import { useState, useEffect } from 'react';
import {
  MapPin, Search, TrendingUp, BarChart3, ArrowUpRight, Filter, Download, Share2, Settings, Info, Star, Eye, ChevronDown, ChevronUp, Plus, 
  Building2, Users, Target, Globe, Grid3X3, Play, Pause, RefreshCw, FileText, Calendar, Clock, CheckCircle, AlertTriangle, XCircle,
  Pin, Navigation, Compass, Map, Minus, HelpCircle, Sparkles, Zap, Activity, Target as TargetIcon, Award, TrendingDown
} from 'lucide-react';
import EnhancedMapView from '@/components/seo-crawler/EnhancedMapView';
import HowToUseSection from '@/components/Common/HowToUseSection';

interface SearchResult {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviews: number;
  rank: number;
  image: string;
  coordinates: { lat: number; lng: number };
  distance: number;
  gridPosition: { x: number; y: number };
  category: string;
  phone: string;
  website: string;
  openingHours: string[];
  geminiInsights?: string;
}

interface Report {
  id: number;
  location: string;
  searchQuery: string;
  searchSettings: string;
  lastScan: string;
  status: string;
  results: SearchResult[];
  gridData: any[];
  coordinates: { lat: number; lng: number };
  geminiAnalysis?: string;
}

export default function LocalSEODashboardPage() {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [searchQueries, setSearchQueries] = useState(['', '', '', '', '']);
  const [gridSize, setGridSize] = useState('9 x 9');
  const [distance, setDistance] = useState(0.5);
  const [distanceUnit, setDistanceUnit] = useState('Miles');
  const [isScanning, setIsScanning] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [activeTab, setActiveTab] = useState('scan');
  const [selectedGMBLocation, setSelectedGMBLocation] = useState<any>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  
  // Real data state
  const [gmbLocations, setGmbLocations] = useState([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [geminiAnalysis, setGeminiAnalysis] = useState('');

  // Mock GMB locations for demo
  const mockGmbLocations = [
    { id: '1', name: 'Cheesecake Factory', address: 'New York, NY', status: 'active', reviews: 1250, rating: 4.2 },
    { id: '2', name: 'Pizza Palace', address: 'Los Angeles, CA', status: 'active', reviews: 890, rating: 4.5 },
    { id: '3', name: 'Burger Joint', address: 'Chicago, IL', status: 'pending', reviews: 650, rating: 4.1 }
  ];

  // API functions with Gemini integration
  const fetchGMBLocations = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGmbLocations(mockGmbLocations);
      if (mockGmbLocations.length > 0) {
        setSelectedGMBLocation(mockGmbLocations[0]);
      }
    } catch (error) {
      setError('Failed to fetch GMB locations');
    } finally {
      setLoading(false);
    }
  };

  const generateGeminiInsights = async (searchResults: SearchResult[], query: string, location: string) => {
    try {
      const response = await fetch('/api/gemini/local-seo-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchResults,
          query,
          location,
          gridSize,
          distance
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.analysis;
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
    }
    return null;
  };

  const runScan = async () => {
    if (!selectedLocation || !searchQueries[0]) return;
    
    setIsScanning(true);
    setScanProgress(0);
    setError('');
    
    try {
      // Simulate scan progress
      for (let i = 0; i <= 100; i += 10) {
        setScanProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Generate mock search results
      const mockResults: SearchResult[] = Array.from({ length: 20 }, (_, i) => ({
        id: `result-${i}`,
        name: `Business ${i + 1}`,
        address: `${Math.floor(Math.random() * 1000)} Main St, ${selectedLocation}`,
        rating: 3.5 + Math.random() * 1.5,
        reviews: Math.floor(Math.random() * 1000) + 50,
        rank: i + 1,
        image: `https://picsum.photos/60/60?random=${i}`,
        coordinates: { lat: 40.7300 + (Math.random() - 0.5) * 0.1, lng: -72.9850 + (Math.random() - 0.5) * 0.1 },
        distance: Math.random() * 2,
        gridPosition: { x: Math.floor(Math.random() * 9), y: Math.floor(Math.random() * 9) },
        category: 'Restaurant',
        phone: `+1-555-${Math.floor(Math.random() * 9000) + 1000}`,
        website: `https://business${i}.com`,
        openingHours: ['Mon-Fri: 9AM-10PM', 'Sat-Sun: 10AM-11PM']
      }));

      setSearchResults(mockResults);

      // Generate Gemini insights
      const insights = await generateGeminiInsights(mockResults, searchQueries[0], selectedLocation);
      setGeminiAnalysis(insights || 'AI analysis will be available soon.');

      // Create new report
      const newReport: Report = {
        id: Date.now(),
        location: selectedLocation,
        searchQuery: searchQueries[0],
        searchSettings: `${gridSize} Grid | ${distance} ${distanceUnit}`,
        lastScan: new Date().toLocaleString(),
        status: "completed",
        results: mockResults,
        gridData: [],
        coordinates: { lat: 40.7300, lng: -72.9850 },
        geminiAnalysis: insights
      };

      setReports(prev => [newReport, ...prev]);
      setActiveTab('results');
    } catch (error) {
      setError('Failed to run scan');
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  useEffect(() => {
    fetchGMBLocations();
  }, []);

  // Stats data
  const stats = [
    {
      label: 'Active Locations',
      value: gmbLocations.filter((l: any) => l.status === 'active').length,
      icon: Building2,
      color: 'from-blue-500 to-cyan-500',
      trend: '+12%',
      trendUp: true
    },
    {
      label: 'Total Reviews',
      value: gmbLocations.reduce((sum: number, loc: any) => sum + (loc.reviews || 0), 0).toLocaleString(),
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      trend: '+8%',
      trendUp: true
    },
    {
      label: 'Avg. Rating',
      value: gmbLocations.length > 0 ? (gmbLocations.reduce((sum: number, loc: any) => sum + (loc.rating || 0), 0) / gmbLocations.length).toFixed(1) : '0.0',
      icon: Star,
      color: 'from-yellow-500 to-orange-500',
      trend: '+0.2',
      trendUp: true
    },
    {
      label: 'Completed Scans',
      value: reports.filter((r: any) => r.status === 'completed').length,
      icon: CheckCircle,
      color: 'from-purple-500 to-pink-500',
      trend: '+25%',
      trendUp: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-purple-700 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
                  Local SEO Dashboard
                </h1>
                <div className="text-sm text-slate-600 dark:text-slate-400">Home &gt; Local SEO &gt; Dashboard</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Sparkles className="w-4 h-4" />
              {showHelp ? 'Hide Help' : 'How to Use'}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <Pause className="w-4 h-4" />
              Stop Monitoring
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              MM
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Help Section */}
        {showHelp && (
          <HowToUseSection
            title="How to Use Local SEO Dashboard"
            description="Monitor and optimize your local search presence across multiple locations. Track performance, run grid scans, and analyze competitor data with AI-powered insights."
            steps={[
              {
                title: "Select your location",
                description: "Choose the GMB location you want to monitor and optimize"
              },
              {
                title: "Set up grid scans",
                description: "Configure search queries and grid parameters for local analysis"
              },
              {
                title: "Run scans",
                description: "Execute grid scans to analyze local search competition"
              },
              {
                title: "Review AI insights",
                description: "Get AI-powered analysis and optimization recommendations"
              }
            ]}
            examples={[
              {
                type: "Grid Scan",
                example: "9x9 grid, 0.5 miles radius",
                description: "Analyze local competition in a specific area"
              },
              {
                type: "Search Query",
                example: "plumber near me",
                description: "Target keyword for local search analysis"
              },
              {
                type: "Location",
                example: "New York, NY",
                description: "Target location for local SEO optimization"
              }
            ]}
            tips={[
              {
                title: "Regular Monitoring",
                content: "Run scans regularly to track changes in local competition"
              },
              {
                title: "Multiple Locations",
                content: "Monitor all your business locations for comprehensive coverage"
              },
              {
                title: "AI Analysis",
                content: "Use Gemini AI insights to identify optimization opportunities"
              }
            ]}
            proTip="Set up automated scans for your most important keywords and locations. Use AI insights to stay ahead of local competition and identify new opportunities quickly."
          />
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {stat.trend}
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</div>
              <div className="text-slate-600 dark:text-slate-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Bulk Scan Form */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                  <Grid3X3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Bulk Scan</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">AI-powered local search analysis</p>
                </div>
              </div>

              {/* Location Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Select Location</label>
                <div className="relative">
                  <Pin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <select
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    <option value="">Select business name/location</option>
                    {gmbLocations.map((location: any) => (
                      <option key={location.id} value={location.name}>
                        {location.name} - {location.address}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search Queries */}
              <div className="space-y-4 mb-6">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Search Queries</label>
                {searchQueries.map((query, index) => (
                  <div key={index} className="relative">
                    <input
                      type="text"
                      placeholder={index === 0 ? "Primary search query *" : `Search query ${index + 1} (optional)`}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={query}
                      onChange={(e) => {
                        const newQueries = [...searchQueries];
                        newQueries[index] = e.target.value;
                        setSearchQueries(newQueries);
                      }}
                    />
                    {index === 0 && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <TargetIcon className="w-4 h-4 text-blue-500" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Grid and Distance Settings */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Grid Size</label>
                  <select
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={gridSize}
                    onChange={(e) => setGridSize(e.target.value)}
                  >
                    <option value="9 x 9">9 x 9 grid</option>
                    <option value="15 x 15">15 x 15 grid</option>
                    <option value="21 x 21">21 x 21 grid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Distance</label>
                  <div className="flex">
                    <input
                      type="number"
                      className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-l-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={distance}
                      onChange={(e) => setDistance(parseFloat(e.target.value))}
                      step="0.1"
                    />
                    <div className="flex border border-l-0 border-slate-300 dark:border-slate-600 rounded-r-xl overflow-hidden">
                      <button
                        className={`px-4 py-3 text-sm font-medium transition-all duration-200 ${distanceUnit === 'KM' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
                        onClick={() => setDistanceUnit('KM')}
                      >
                        KM
                      </button>
                      <button
                        className={`px-4 py-3 text-sm font-medium transition-all duration-200 ${distanceUnit === 'Miles' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
                        onClick={() => setDistanceUnit('Miles')}
                      >
                        Miles
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {isScanning && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Scan Progress</span>
                    <span className="text-sm font-medium text-blue-600">{scanProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${scanProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Run Scan Button */}
              <button
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                onClick={runScan}
                disabled={isScanning || !selectedLocation || !searchQueries[0]}
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Scanning... {scanProgress}%
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Run AI-Powered Scan
                  </>
                )}
              </button>

              {/* AI Badge */}
              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  <Sparkles className="w-4 h-4" />
                  Powered by Gemini AI
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Results and Map */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
              {/* Results Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Local Search Grid Analysis
                    </h3>
                    <p className="text-blue-100">
                      {selectedLocation ? `Results for: ${selectedLocation}` : 'Select a location to begin'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                      <Settings className="w-5 h-5" />
                    </button>
                    <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Enhanced Map View */}
              <div className="p-6">
                <EnhancedMapView
                  gridSize={9}
                  distance={distance}
                  distanceUnit={distanceUnit}
                  coordinates={{ lat: 40.7300, lng: -72.9850 }}
                  searchResults={searchResults}
                  onLocationClick={(location) => {
                    console.log('Location clicked:', location);
                  }}
                />
              </div>

              {/* AI Analysis Section */}
              {geminiAnalysis && (
                <div className="border-t border-slate-200 dark:border-slate-700 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">AI Analysis & Insights</h4>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {geminiAnalysis}
                    </p>
                  </div>
                </div>
              )}

              {/* Search Results */}
              <div className="border-t border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">Search Results</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {searchResults.length} businesses found
                    </span>
                    <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.slice(0, 8).map((result, index) => (
                      <div key={result.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:shadow-lg group">
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {result.rank}
                            </div>
                            <img src={result.image} alt={result.name} className="w-16 h-16 rounded-lg object-cover" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {result.name}
                            </h5>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{result.address}</p>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                  {result.rating.toFixed(1)}
                                </span>
                              </div>
                              <span className="text-sm text-slate-500">
                                ({result.reviews.toLocaleString()} reviews)
                              </span>
                              <span className="text-sm text-slate-500">
                                {result.distance.toFixed(1)} {distanceUnit}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Search Results</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      Run a scan to see local search rankings and business listings
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                      <TargetIcon className="w-4 h-4" />
                      Configure your search parameters and click "Run AI-Powered Scan"
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="mt-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Scan Reports</h3>
              <div className="flex items-center gap-3">
                <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
                <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-slate-200 dark:border-slate-700">
            <div className="flex">
              {['My Reports', 'All Reports', 'Monitoring'].map((tab) => (
                <button
                  key={tab}
                  className={`px-6 py-4 font-medium transition-all duration-200 ${
                    activeTab === tab.toLowerCase().replace(' ', '') 
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  onClick={() => setActiveTab(tab.toLowerCase().replace(' ', ''))}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search reports..."
                className="w-full pl-12 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Search Query</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Settings</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Last Scan</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{report.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                      {report.searchQuery}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {report.searchSettings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {report.lastScan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {report.status === 'completed' ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-green-600">Completed</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium text-yellow-600">Pending</span>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Reports Yet</h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        Run your first scan to generate reports and insights
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 