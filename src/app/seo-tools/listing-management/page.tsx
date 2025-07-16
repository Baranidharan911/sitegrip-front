'use client';
import { useState } from 'react';
import {
  FileText, Edit, Eye, CheckCircle, AlertCircle, Download, Share2, Settings, Info, Star, MapPin, Filter, ChevronDown, ChevronUp, Plus, HelpCircle
} from 'lucide-react';
import HowToUseSection from '@/components/Common/HowToUseSection';

const mockListings = [
  { id: 1, name: 'Main Street Plumbing', status: 'Active', address: '123 Main St, New York, NY', phone: '(555) 123-4567', platform: 'Google', lastUpdated: '2024-07-01' },
  { id: 2, name: 'Downtown Cafe', status: 'Pending', address: '456 Elm St, New York, NY', phone: '(555) 987-6543', platform: 'Yelp', lastUpdated: '2024-06-28' },
  { id: 3, name: 'City Gym', status: 'Error', address: '789 Oak St, New York, NY', phone: '(555) 555-5555', platform: 'Bing', lastUpdated: '2024-06-25' },
  { id: 4, name: 'Sunrise Bakery', status: 'Active', address: '321 Maple Ave, New York, NY', phone: '(555) 222-3333', platform: 'Apple', lastUpdated: '2024-07-02' },
];

const statusIcon = {
  'Active': <CheckCircle className="w-5 h-5 text-green-500" />,
  'Pending': <FileText className="w-5 h-5 text-yellow-500" />,
  'Error': <AlertCircle className="w-5 h-5 text-red-500" />,
} as const;

const platforms = ['All', 'Google', 'Yelp', 'Bing', 'Apple'];

export default function ListingManagementPage() {
  const [viewId, setViewId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editListing, setEditListing] = useState({ name: '', address: '', phone: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showHelp, setShowHelp] = useState(false);

  const filteredListings = mockListings.filter(l =>
    (filterPlatform === 'All' || l.platform === filterPlatform) &&
    (filterStatus === 'All' || l.status === filterStatus)
  );

  // Stats
  const stats = [
    {
      label: 'Total Listings',
      value: mockListings.length,
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
      tooltip: 'Number of business listings managed.'
    },
    {
      label: 'Active',
      value: mockListings.filter(l => l.status === 'Active').length,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      tooltip: 'Listings currently active and visible.'
    },
    {
      label: 'Pending',
      value: mockListings.filter(l => l.status === 'Pending').length,
      icon: FileText,
      color: 'from-yellow-500 to-orange-500',
      tooltip: 'Listings awaiting approval or update.'
    },
    {
      label: 'Errors',
      value: mockListings.filter(l => l.status === 'Error').length,
      icon: AlertCircle,
      color: 'from-red-500 to-pink-500',
      tooltip: 'Listings with errors or issues.'
    }
  ];

  const handleEdit = (listing: typeof mockListings[0]) => {
    setEditId(listing.id);
    setEditListing({ name: listing.name, address: listing.address, phone: listing.phone });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto mt-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <FileText className="w-8 h-8 text-purple-500" /> Listing Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Manage your business listings, update details, and monitor status across platforms.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              {showHelp ? 'Hide Help' : 'How to Use'}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow hover:from-blue-600 hover:to-indigo-600 transition-all">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold shadow hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold shadow hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
              <Settings className="w-4 h-4" /> Settings
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow hover:from-green-600 hover:to-emerald-600 transition-all">
              <Plus className="w-4 h-4" /> Add Listing
            </button>
          </div>
        </div>

        {/* Help Section */}
        {showHelp && (
          <HowToUseSection
            title="How to Use Listing Management"
            description="Manage your business listings across multiple platforms from one central dashboard. Monitor status, update information, and ensure consistency."
            steps={[
              {
                title: "View all listings",
                description: "See all your business listings across different platforms in one place"
              },
              {
                title: "Filter and search",
                description: "Use filters to find specific listings by platform or status"
              },
              {
                title: "Update information",
                description: "Edit listing details to ensure consistency across all platforms"
              },
              {
                title: "Monitor status",
                description: "Track the status of your listings and address any issues"
              }
            ]}
            examples={[
              {
                type: "Google Business Profile",
                example: "Main Street Plumbing - Active",
                description: "Your primary business listing on Google"
              },
              {
                type: "Yelp Business",
                example: "Downtown Cafe - Pending",
                description: "Business listing awaiting approval"
              },
              {
                type: "Bing Places",
                example: "City Gym - Error",
                description: "Listing with issues that need attention"
              }
            ]}
            tips={[
              {
                title: "Maintain Consistency",
                content: "Keep business information identical across all platforms"
              },
              {
                title: "Regular Updates",
                content: "Update listings when business information changes"
              },
              {
                title: "Monitor Status",
                content: "Check for errors or pending approvals regularly"
              }
            ]}
            proTip="Set up alerts for listing status changes so you can quickly address any issues that arise. This helps maintain your online presence."
          />
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white/80 dark:bg-gray-900/80 rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl flex items-center gap-4 relative group">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-300 text-sm flex items-center gap-1">
                  {stat.label}
                  <span title={stat.tooltip}>
                    <Info className="w-4 h-4 text-blue-400 ml-1 cursor-pointer group-hover:opacity-100 opacity-60" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-4 flex items-center gap-4">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold shadow hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            onClick={() => setShowFilters(f => !f)}
          >
            <Filter className="w-4 h-4" /> Filters {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showFilters && (
            <div className="flex items-center gap-4">
              <label className="text-sm text-slate-700 dark:text-slate-200">Platform:</label>
              <select
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                value={filterPlatform}
                onChange={e => setFilterPlatform(e.target.value)}
              >
                {platforms.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <label className="text-sm text-slate-700 dark:text-slate-200">Status:</label>
              <select
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Error">Error</option>
              </select>
            </div>
          )}
        </div>

        {/* Table & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Table */}
          <div className="lg:col-span-2 bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" /> Business Listings
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="text-gray-700 dark:text-gray-200 text-base">
                    <th className="py-2 px-4">Name</th>
                    <th className="py-2 px-4">Platform</th>
                    <th className="py-2 px-4">Status</th>
                    <th className="py-2 px-4">Address</th>
                    <th className="py-2 px-4">Phone</th>
                    <th className="py-2 px-4">Last Updated</th>
                    <th className="py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredListings.map(listing => (
                    <tr key={listing.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 px-4 font-medium">{listing.name}</td>
                      <td className="py-2 px-4">{listing.platform}</td>
                      <td className="py-2 px-4 flex items-center gap-2">
                        {statusIcon[listing.status as keyof typeof statusIcon]}
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ml-1
                          ${listing.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200' : ''}
                          ${listing.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200' : ''}
                          ${listing.status === 'Error' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200' : ''}
                        `}>{listing.status}</span>
                      </td>
                      <td className="py-2 px-4">{listing.address}</td>
                      <td className="py-2 px-4">{listing.phone}</td>
                      <td className="py-2 px-4">{listing.lastUpdated}</td>
                      <td className="py-2 px-4 flex gap-2">
                        <button
                          className="px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-200 dark:hover:bg-blue-800 transition-all"
                          onClick={() => setViewId(listing.id)}
                        >View</button>
                        <button
                          className="px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-200 dark:hover:bg-purple-800 transition-all"
                          onClick={() => handleEdit(listing)}
                        >Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Insights */}
          <div className="bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-6">
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" /> Insights & Opportunities
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-300">
                <CheckCircle className="w-4 h-4" /> Most Active: <span className="font-semibold">{mockListings.filter(l => l.status === 'Active').map(l => l.name).join(', ')}</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-300">
                <MapPin className="w-4 h-4" /> Platforms: <span className="font-semibold">{[...new Set(mockListings.map(l => l.platform))].join(', ')}</span>
              </div>
              <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-300">
                <FileText className="w-4 h-4" /> Pending: <span className="font-semibold">{mockListings.filter(l => l.status === 'Pending').map(l => l.name).join(', ') || 'None'}</span>
              </div>
              <div className="flex items-center gap-2 text-red-600 dark:text-red-300">
                <AlertCircle className="w-4 h-4" /> Errors: <span className="font-semibold">{mockListings.filter(l => l.status === 'Error').map(l => l.name).join(', ') || 'None'}</span>
              </div>
            </div>
            <div className="mt-6">
              <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow hover:from-blue-600 hover:to-indigo-600 transition-all">
                <Download className="w-4 h-4" /> Export All as PDF
              </button>
            </div>
          </div>
        </div>

        {/* View Modal */}
        {viewId && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl w-full max-w-md relative">
              <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={() => setViewId(null)}><Eye /></button>
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Listing Details</h2>
              {(() => {
                const l = mockListings.find(l => l.id === viewId);
                if (!l) return null;
                return (
                  <div className="space-y-2">
                    <div><span className="font-semibold">Name:</span> {l.name}</div>
                    <div><span className="font-semibold">Platform:</span> {l.platform}</div>
                    <div><span className="font-semibold">Address:</span> {l.address}</div>
                    <div><span className="font-semibold">Phone:</span> {l.phone}</div>
                    <div><span className="font-semibold">Status:</span> {l.status}</div>
                    <div><span className="font-semibold">Last Updated:</span> {l.lastUpdated}</div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
        {/* Edit Modal */}
        {editId && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl w-full max-w-md relative">
              <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={() => setEditId(null)}><Edit /></button>
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Edit Listing</h2>
              <input
                type="text"
                className="w-full mb-3 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base text-gray-900 dark:text-gray-100"
                placeholder="Business Name"
                value={editListing.name}
                onChange={e => setEditListing({ ...editListing, name: e.target.value })}
              />
              <input
                type="text"
                className="w-full mb-3 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base text-gray-900 dark:text-gray-100"
                placeholder="Address"
                value={editListing.address}
                onChange={e => setEditListing({ ...editListing, address: e.target.value })}
              />
              <input
                type="text"
                className="w-full mb-6 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base text-gray-900 dark:text-gray-100"
                placeholder="Phone Number"
                value={editListing.phone}
                onChange={e => setEditListing({ ...editListing, phone: e.target.value })}
              />
              <button
                className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold text-lg shadow hover:from-purple-600 hover:to-purple-700 transition"
                onClick={() => setEditId(null)}
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 