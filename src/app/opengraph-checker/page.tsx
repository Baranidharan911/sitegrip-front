"use client";

import { useState } from "react";
import { Loader2, Link, FileText, Download, Printer, Share2, CheckCircle, AlertCircle, Check, Star, TrendingUp, Image, Eye } from "lucide-react";

export default function OpenGraphCheckerPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleCheck = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/opengraph-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleExportJSON = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "opengraph-report.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  const handlePrint = () => window.print();
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href + '?url=' + encodeURIComponent(url));
    alert('Shareable link copied!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0b1e] p-2 sm:p-4">
      <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
        <div className="text-center px-4">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl shadow-lg">
              <Link className="text-white w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent drop-shadow-lg">
              OpenGraph & Twitter Card Checker
            </h1>
          </div>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto px-4">
            Analyze your page's social meta tags for better sharing and previews
          </p>
        </div>
        <div className="bg-white/80 dark:bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 mx-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://your-site.com"
                className="w-full px-4 sm:px-5 py-3 pl-10 sm:pl-12 rounded-full border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base shadow text-gray-900 dark:text-gray-100 placeholder-gray-700 dark:placeholder-gray-400"
              />
              <Link className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <button
              onClick={handleCheck}
              disabled={loading}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-xl text-sm sm:text-base flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
                  Checking...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Link className="w-4 h-4 sm:w-5 sm:h-5" />
                  Check
                </span>
              )}
            </button>
          </div>
        </div>
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mx-4">
            <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
          </div>
        )}
        {result && !loading && (
          <div className="px-4 space-y-6" id="opengraph-checker-dashboard">
            {/* Overall Score */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-6 h-6" />
                <h3 className="text-xl font-bold">Overall Score</h3>
              </div>
              <div className="text-4xl font-bold mb-2">{result.overallScore}/100</div>
              <div className="text-sm opacity-90">
                {result.stats.foundTags} of {result.stats.totalTags} tags found • {result.stats.criticalMissing} critical tags missing
              </div>
            </div>

            {/* Export buttons */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6">
              <button onClick={handleExportJSON} className="px-4 sm:px-6 py-2 rounded-full font-semibold text-xs sm:text-base transition-all duration-200 focus:outline-none shadow bg-pink-500 text-white hover:bg-pink-600 flex items-center gap-1 sm:gap-2">
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Export JSON</span>
                <span className="sm:hidden">JSON</span>
              </button>
              <button onClick={handlePrint} className="px-4 sm:px-6 py-2 rounded-full font-semibold text-xs sm:text-base transition-all duration-200 focus:outline-none shadow bg-pink-500 text-white hover:bg-pink-600 flex items-center gap-1 sm:gap-2">
                <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Print Report</span>
                <span className="sm:hidden">Print</span>
              </button>
              <button onClick={handleShare} className="px-4 sm:px-6 py-2 rounded-full font-semibold text-xs sm:text-base transition-all duration-200 focus:outline-none shadow bg-pink-500 text-white hover:bg-pink-600 flex items-center gap-1 sm:gap-2">
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Share Link</span>
                <span className="sm:hidden">Share</span>
              </button>
            </div>

            {/* Social Preview */}
            {result.socialPreview && (
              <div className="bg-white/80 dark:bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-5 h-5 text-pink-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Social Media Preview</h3>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 max-w-md mx-auto">
                  {result.socialPreview.image && (
                    <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded mb-3 flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{result.socialPreview.title}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">{result.socialPreview.description}</div>
                    {result.socialPreview.siteName && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">{result.socialPreview.siteName}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Found Tags with Validation */}
            <div className="bg-white/80 dark:bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Found Tags with Validation</h3>
              <div className="space-y-3">
                {Object.entries(result.found).map(([key, value]: any) => {
                  const validation = result.validations[key];
                  const isOg = key.startsWith('og:');
                  return (
                    <div key={key} className={`border rounded-lg p-3 ${
                      validation.valid ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                    }`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            isOg ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                          }`}>
                            {isOg ? 'OG' : 'Twitter'}
                          </span>
                          <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">{key}</span>
                          <span className="text-xs text-gray-500">Score: {validation.score}</span>
                        </div>
                        <button onClick={() => handleCopy(value)} className="p-1 rounded bg-white/80 dark:bg-gray-800/80 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shadow hover:bg-pink-100 dark:hover:bg-pink-900/30 transition">
                          {copied ? <Check className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-200 break-all mb-2">{value}</div>
                      {validation.errors.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Errors:</p>
                          <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                            {validation.errors.map((error: string, i: number) => (
                              <li key={i} className="flex items-start gap-1">
                                <AlertCircle className="w-3 h-3 mt-0.5" />
                                <span className="break-words">{error}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {validation.warnings.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400 mb-1">Warnings:</p>
                          <ul className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1">
                            {validation.warnings.map((warning: string, i: number) => (
                              <li key={i} className="flex items-start gap-1">
                                <AlertCircle className="w-3 h-3 mt-0.5" />
                                <span className="break-words">{warning}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Missing Tags */}
            {(result.missingOg.length > 0 || result.missingTwitter.length > 0) && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl shadow-xl p-4 sm:p-6">
                <h4 className="text-base font-semibold text-yellow-800 dark:text-yellow-200 mb-3">Missing Tags</h4>
                {result.missingOg.length > 0 && (
                  <div className="mb-3">
                    <span className="font-semibold text-pink-700 dark:text-pink-300 text-sm">OpenGraph:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {result.missingOg.map((tag: string) => (
                        <div key={tag} className="bg-yellow-100 dark:bg-yellow-900/40 rounded px-3 py-2 text-xs">
                          <div className="font-medium text-yellow-800 dark:text-yellow-200">{tag}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {result.missingTwitter.length > 0 && (
                  <div>
                    <span className="font-semibold text-blue-700 dark:text-blue-300 text-sm">Twitter Card:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {result.missingTwitter.map((tag: string) => (
                        <div key={tag} className="bg-yellow-100 dark:bg-yellow-900/40 rounded px-3 py-2 text-xs">
                          <div className="font-medium text-yellow-800 dark:text-yellow-200">{tag}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Duplicates */}
            {result.duplicates && result.duplicates.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl shadow-xl p-4 sm:p-6">
                <h4 className="text-base font-semibold text-red-800 dark:text-red-200 mb-2">Duplicate Tags Found</h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-2">These tags appear multiple times and should be removed:</p>
                <div className="flex flex-wrap gap-2">
                  {result.duplicates.map((tag: string) => (
                    <span key={tag} className="bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 px-3 py-1 rounded text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl shadow-xl p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <h4 className="text-base font-semibold text-blue-800 dark:text-blue-200">Optimization Recommendations</h4>
                </div>
                <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-2">
                  {result.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                      <span className="break-words">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}