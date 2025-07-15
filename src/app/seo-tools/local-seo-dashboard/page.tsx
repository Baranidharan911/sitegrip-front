'use client';
import { useState, useEffect } from 'react';
import {
  MapPin, Search, TrendingUp, BarChart3, ArrowUpRight, Filter, Download, Share2, Settings, Info, Star, Eye, ChevronDown, ChevronUp, Plus, 
  Building2, Users, Target, Globe, Grid3X3, Play, Pause, RefreshCw, FileText, Calendar, Clock, CheckCircle, AlertTriangle, XCircle,
  Pin, Navigation, Compass, Map, Minus
} from 'lucide-react';
import EnhancedMapView from '@/components/seo-crawler/EnhancedMapView';

export default function LocalSEODashboardPage() {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [gridSize, setGridSize] = useState('9 x 9');
  const [distance, setDistance] = useState(0.5);
  const [distanceUnit, setDistanceUnit] = useState('Miles');
  const [isScanning, setIsScanning] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [activeTab, setActiveTab] = useState('scan');
  const [selectedGMBLocation, setSelectedGMBLocation] = useState<any>(null);
  
  // Real data state
  const [gmbLocations, setGmbLocations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // API functions
  const fetchGMBLocations = async () => {
    try {
      const response = await fetch('/api/local-seo?action=gmb-locations');
      const data = await response.json();
      if (data.success) {
        setGmbLocations(data.data);
        if (data.data.length > 0) {
          setSelectedGMBLocation(data.data[0]);
        }
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to fetch GMB locations');
    }
  };

  const fetchSearchResults = async (query: string, location: string) => {
    try {
      const response = await fetch(`/api/local-seo?action=search-results&query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.data);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to fetch search results');
    }
  };

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/local-seo?action=reports');
      const data = await response.json();
      if (data.success) {
        setReports(data.data);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to fetch reports');
    }
  };

  const runScan = async (query: string, location: string, gridSize: string, distance: number, distanceUnit: string) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/local-seo?action=scan&query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&gridSize=${gridSize}&distance=${distance}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data.results);
        // Refresh reports
        await fetchReports();
        setActiveTab('results');
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to run scan');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchGMBLocations();
    fetchReports();
  }, []);

  // Stats data
  const stats = [
    {
      label: 'Active Locations',
      value: gmbLocations.filter((l: any) => l.status === 'active').length,
      icon: Building2,
      color: 'from-blue-500 to-cyan-500',
      tooltip: 'Number of active GMB locations'
    },
    {
      label: 'Total Reviews',
      value: gmbLocations.reduce((sum: number, loc: any) => sum + (loc.reviews || 0), 0).toLocaleString(),
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      tooltip: 'Total reviews across all locations'
    },
    {
      label: 'Avg. Rating',
      value: gmbLocations.length > 0 ? (gmbLocations.reduce((sum: number, loc: any) => sum + (loc.rating || 0), 0) / gmbLocations.length).toFixed(1) : '0.0',
      icon: Star,
      color: 'from-yellow-500 to-orange-500',
      tooltip: 'Average rating across all locations'
    },
    {
      label: 'Completed Scans',
      value: reports.filter((r: any) => r.status === 'completed').length,
      icon: CheckCircle,
      color: 'from-purple-500 to-pink-500',
      tooltip: 'Number of completed grid scans'
    }
  ];

  const handleRunScan = () => {
    if (!selectedLocation || !searchQuery) return;
    runScan(searchQuery, selectedLocation, gridSize, distance, distanceUnit);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Local SEO Dashboard</h1>
            </div>
            <div className="text-sm text-gray-500">Home &gt; Local SEO &gt; Dashboard</div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              <Pause className="w-4 h-4" />
              Stop Monitoring
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Breadcrumb and Report Info */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>All Reports</span>
            <ArrowUpRight className="w-4 h-4" />
            <span>View Report</span>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-gray-700">
              You're viewing report for '{selectedGMBLocation?.name || 'Select Location'} | {searchQuery || 'Cheesecake'} | {gridSize} Grid | {distance}{distanceUnit}'
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">11 April 2021, 11:00 AM</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">21 Sep 2021, 11:00 AM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Bulk Scan Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Grid3X3 className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Bulk Scan</h2>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mb-4">Scan details (Up to 5 different search queries)</p>

              {/* Location Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select locations</label>
                <div className="relative">
                  <Pin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    <option value="">Select business name/location</option>
                    {gmbLocations.map((location: any) => (
                      <option key={location.id} value={location.id}>
                        {location.name} - {location.address}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search Queries */}
              <div className="space-y-3 mb-4">
                <input
                  type="text"
                  placeholder="Insert 1st search query"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Insert 2nd search query (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Insert 3rd search query (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Insert 4th search query (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Insert 5th search query (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Grid and Distance Settings */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grid Size</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={gridSize}
                    onChange={(e) => setGridSize(e.target.value)}
                  >
                    <option value="9 x 9">9 x 9 grid</option>
                    <option value="15 x 15">15 x 15 grid</option>
                    <option value="21 x 21">21 x 21 grid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Distance</label>
                  <div className="flex">
                    <input
                      type="number"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={distance}
                      onChange={(e) => setDistance(parseFloat(e.target.value))}
                      step="0.1"
                    />
                    <div className="flex border border-l-0 border-gray-300 rounded-r-lg">
                      <button
                        className={`px-3 py-2 text-sm ${distanceUnit === 'KM' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                        onClick={() => setDistanceUnit('KM')}
                      >
                        KM
                      </button>
                      <button
                        className={`px-3 py-2 text-sm ${distanceUnit === 'Miles' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                        onClick={() => setDistanceUnit('Miles')}
                      >
                        Miles
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Run Scan Button */}
              <button
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                onClick={handleRunScan}
                disabled={isScanning || !selectedLocation || !searchQuery}
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run Scan
                  </>
                )}
              </button>

              {/* GRID MY BUSINESS Logo */}
              <div className="mt-6 text-center">
                <div className="text-sm font-semibold text-gray-600">GRID MY BUSINESS</div>
              </div>
            </div>
          </div>

          {/* Right Panel - Results and Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200">
              {/* Results Header */}
              <div className="bg-blue-600 text-white p-4 rounded-t-lg">
                <h3 className="font-semibold">
                  Searched results for this location: Coordinates: 41.7294208, -72.9845332
                </h3>
              </div>

              {/* Enhanced Map View - Full Width */}
              <div className="p-6">
                <EnhancedMapView
                  gridSize={9}
                  distance={distance}
                  distanceUnit={distanceUnit}
                  coordinates={{ lat: 41.7294208, lng: -72.9845332 }}
                  searchResults={searchResults}
                  onLocationClick={(location) => {
                    console.log('Location clicked:', location);
                    // Handle location click - could open details modal, etc.
                  }}
                />
              </div>

              {/* Search Results - Below Map */}
              <div className="border-t border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Search Results</h4>
                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.map((result: any, index: number) => (
                      <div key={result.id} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="text-lg font-bold text-blue-600 w-6">{index + 1}</div>
                        <img src={result.image} alt={result.name} className="w-12 h-12 rounded object-cover" />
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900">{result.name}</h5>
                          <p className="text-sm text-gray-600">{result.address}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">{result.rating}</span>
                            </div>
                            <span className="text-sm text-gray-500">({result.reviews.toLocaleString()} reviews)</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Search Results</h3>
                    <p className="text-gray-600">Run a scan to see local search rankings and business listings</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reports Table */}
        <div className="mt-6 bg-white rounded-lg border border-gray-200">
          <div className="bg-blue-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">My Reports</h3>
              <div className="flex items-center gap-2">
                <button className="p-1 hover:bg-blue-700 rounded">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'scan' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('scan')}
              >
                My Reports
              </button>
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('all')}
              >
                All Reports
              </button>
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'monitoring' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('monitoring')}
              >
                Monitoring
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Quick search"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Search query</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Search settings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last scan</th>
                </tr>
              </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                    {reports.map((report: any) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {report.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.searchQuery}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.searchSettings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        {report.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        )}
                        {report.lastScan}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 