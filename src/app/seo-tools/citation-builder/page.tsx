import { useState } from 'react';
import { Link, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const mockSites = [
  { name: 'Yelp', status: 'Ready to Submit' },
  { name: 'Yellow Pages', status: 'Submitted' },
  { name: 'Bing Places', status: 'Ready to Submit' },
  { name: 'Apple Maps', status: 'Error' },
  { name: 'Foursquare', status: 'Submitted' },
  { name: 'Facebook', status: 'Ready to Submit' },
];

const statusIcon = {
  'Ready to Submit': <FileText className="w-5 h-5 text-blue-500" />,
  'Submitted': <CheckCircle className="w-5 h-5 text-green-500" />,
  'Error': <AlertCircle className="w-5 h-5 text-red-500" />,
};

export default function CitationBuilderPage() {
  const [business, setBusiness] = useState({ name: '', address: '', phone: '' });
  const [showList, setShowList] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setShowList(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-2xl mx-auto mt-12">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-900 dark:text-white flex items-center justify-center gap-2">
          <Link className="w-8 h-8 text-purple-500" /> Citation Builder
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-10">Generate and manage your business citations across top directories. Improve your local SEO with consistent listings.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <input
            type="text"
            className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base"
            placeholder="Business Name"
            value={business.name}
            onChange={e => setBusiness({ ...business, name: e.target.value })}
          />
          <input
            type="text"
            className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base"
            placeholder="Address"
            value={business.address}
            onChange={e => setBusiness({ ...business, address: e.target.value })}
          />
          <input
            type="text"
            className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base"
            placeholder="Phone Number"
            value={business.phone}
            onChange={e => setBusiness({ ...business, phone: e.target.value })}
          />
        </div>
        <button
          className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold text-lg shadow-lg hover:from-purple-600 hover:to-purple-700 transition mb-8"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin w-5 h-5" /> Generating...</span> : 'Generate Citations'}
        </button>
        {showList && (
          <div className="bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mt-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Citation Sites</h2>
            <div className="space-y-4">
              {mockSites.map((site, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50/60 to-blue-50/40 dark:from-purple-900/20 dark:to-blue-900/10 border border-purple-100 dark:border-purple-900/30 shadow-sm">
                  {statusIcon[site.status]}
                  <span className="font-semibold text-gray-900 dark:text-white text-lg flex-1">{site.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ml-2
                    ${site.status === 'Submitted' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200' : ''}
                    ${site.status === 'Ready to Submit' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200' : ''}
                    ${site.status === 'Error' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200' : ''}
                  `}>{site.status}</span>
                  {site.status === 'Ready to Submit' && (
                    <button className="ml-4 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold shadow hover:from-purple-600 hover:to-purple-700 transition text-xs">Copy Info</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 