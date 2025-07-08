"use client";

import { useState } from "react";
import { Loader2, Link, FileText, Download, Printer, Share2, CheckCircle, AlertCircle, Check, Star, XCircle, Clock, Zap } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { saveToFirebase } from '@/lib/firebase.js';

export const dynamic = 'force-dynamic';

interface BrokenLink {
  url: string;
  status: number;
}

interface LinkCheckerResult {
  url: string;
  totalLinks: number;
  uniqueLinks: number;
  brokenLinks: BrokenLink[];
  issues: string[];
  recommendations: string[];
  links: string[];
}

export default function InternalLinkCheckerPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LinkCheckerResult | null>(null);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const analyzeLinks = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const response = await fetch('/api/internal-link-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to check internal links');
      setResults(data);

      // Save to Firebase if user is logged in
      if (user) {
        try {
          await saveToFirebase('internalLinkAnalysis', {
            userId: user.uid,
            url: data.url,
            analysis: data,
            timestamp: new Date().toISOString()
          });
        } catch (firebaseError) {
          console.error('Failed to save to Firebase:', firebaseError);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while checking links');
    } finally {
      setLoading(false);
    }
  };

  const exportResults = (format: 'json' | 'csv') => {
    if (!results) return;
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `internal-link-checker-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const csvRows = [
        ['Link', 'Status'],
        ...results.links.map(link => {
          const broken = results.brokenLinks.find(b => b.url === link);
          return [link, broken ? broken.status : 200];
        })
      ];
      const csv = csvRows.map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `internal-link-checker-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const shareResults = () => {
    if (!results) return;
    const shareData = {
      title: 'Internal Link Checker Results',
      text: `Internal Link Checker for ${results.url} - ${results.uniqueLinks} unique links, ${results.brokenLinks.length} broken`,
      url: window.location.href
    };
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-4">
              <Link className="text-white text-xl" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Internal Link Checker
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Analyze all internal links on your page, find broken links, and get actionable recommendations for site health.
          </p>
        </div>
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="Enter website URL (e.g., https://example.com)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={e => e.key === 'Enter' && analyzeLinks()}
                />
              </div>
              <button
                onClick={analyzeLinks}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Link className="mr-2" />
                    Analyze
                  </>
                )}
              </button>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center">
                <AlertCircle className="mr-2" />
                {error}
              </div>
            )}
          </div>
        </div>
        {results && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Summary</h2>
                <div className="flex gap-2">
                  <button onClick={() => exportResults('json')} className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center">
                    <Download className="mr-1" /> JSON
                  </button>
                  <button onClick={() => exportResults('csv')} className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center">
                    <Download className="mr-1" /> CSV
                  </button>
                  <button onClick={shareResults} className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center">
                    <Share2 className="mr-1" /> Share
                  </button>
                  <button onClick={() => window.print()} className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center">
                    <Printer className="mr-1" /> Print
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 rounded-lg bg-blue-50 text-blue-800 text-center">
                  <div className="text-2xl font-bold">{results.totalLinks}</div>
                  <div className="text-sm">Total Internal Links</div>
                </div>
                <div className="p-4 rounded-lg bg-green-50 text-green-800 text-center">
                  <div className="text-2xl font-bold">{results.uniqueLinks}</div>
                  <div className="text-sm">Unique Internal Links</div>
                </div>
                <div className="p-4 rounded-lg bg-red-50 text-red-800 text-center">
                  <div className="text-2xl font-bold">{results.brokenLinks.length}</div>
                  <div className="text-sm">Broken Internal Links</div>
                </div>
              </div>
              {results.issues.length > 0 && (
                <div className="mb-2">
                  <h3 className="text-lg font-semibold text-red-700 mb-2">Issues</h3>
                  <ul className="space-y-1">
                    {results.issues.map((issue, idx) => (
                      <li key={idx} className="flex items-center text-red-700"><AlertCircle className="mr-2" />{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              {results.recommendations.length > 0 && (
                <div className="mb-2">
                  <h3 className="text-lg font-semibold text-blue-700 mb-2">Recommendations</h3>
                  <ul className="space-y-1">
                    {results.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-center text-blue-700"><CheckCircle className="mr-2" />{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 overflow-x-auto">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Internal Links</h3>
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-3">Link</th>
                    <th className="text-left py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.links.map((link, idx) => {
                    const broken = results.brokenLinks.find(b => b.url === link);
                    return (
                      <tr key={idx} className={broken ? 'bg-red-50' : ''}>
                        <td className="py-2 px-3 break-all">
                          <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                            <Link className="mr-1" />
                            {link}
                          </a>
                        </td>
                        <td className="py-2 px-3">
                          {broken ? (
                            <span className="text-red-600">Broken ({broken.status || 'Error'})</span>
                          ) : (
                            <span className="text-green-600">OK</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 