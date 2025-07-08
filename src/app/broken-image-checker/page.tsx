"use client";

import { useState } from "react";
import { Loader2, Image, FileText, Download, Printer, Share2, CheckCircle, AlertCircle, Check, Star, XCircle, Clock, HardDrive } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function BrokenImageCheckerPage() {
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
      const res = await fetch("/api/broken-image-checker", {
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
    a.download = "broken-image-report.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => window.print();
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href + '?url=' + encodeURIComponent(url));
    alert('Shareable link copied!');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0b1e] p-2 sm:p-4">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center px-4">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg">
              <Image className="text-white w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent drop-shadow-lg">
              Broken Image Checker
            </h1>
          </div>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto px-4">
            Detect broken images and analyze performance
          </p>
        </div>

        {/* URL Input */}
        <div className="bg-white/80 dark:bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 mx-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://your-site.com"
                className="w-full px-4 sm:px-5 py-3 pl-10 sm:pl-12 rounded-full border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base shadow"
              />
              <Image className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <button
              onClick={handleCheck}
              disabled={loading}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-xl text-sm sm:text-base flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
                  Checking...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Image className="w-4 h-4 sm:w-5 sm:h-5" />
                  Check Images
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mx-4">
            <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="px-4 space-y-6" id="broken-image-checker-dashboard">
            {/* Overall Score */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl shadow-xl p-6 text-white text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-6 h-6" />
                <h3 className="text-xl font-bold">Overall Score</h3>
              </div>
              <div className="text-4xl font-bold mb-2">{result.overallScore}/100</div>
              <div className="text-sm opacity-90">
                {result.workingImages} working • {result.brokenImages} broken • {result.totalImages} total images
              </div>
            </div>

            {/* Export buttons */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6">
              <button onClick={handleExportJSON} className="px-4 sm:px-6 py-2 rounded-full font-semibold text-xs sm:text-base transition-all duration-200 focus:outline-none shadow bg-orange-500 text-white hover:bg-orange-600 flex items-center gap-1 sm:gap-2">
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Export JSON</span>
                <span className="sm:hidden">JSON</span>
              </button>
              <button onClick={handlePrint} className="px-4 sm:px-6 py-2 rounded-full font-semibold text-xs sm:text-base transition-all duration-200 focus:outline-none shadow bg-orange-500 text-white hover:bg-orange-600 flex items-center gap-1 sm:gap-2">
                <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Print Report</span>
                <span className="sm:hidden">Print</span>
              </button>
              <button onClick={handleShare} className="px-4 sm:px-6 py-2 rounded-full font-semibold text-xs sm:text-base transition-all duration-200 focus:outline-none shadow bg-orange-500 text-white hover:bg-orange-600 flex items-center gap-1 sm:gap-2">
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Share Link</span>
                <span className="sm:hidden">Share</span>
              </button>
            </div>

            {/* Image Results */}
            <div className="bg-white/80 dark:bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Image Analysis Results</h3>
              <div className="space-y-3">
                {result.results.map((image: any, index: number) => (
                  <div key={index} className={`border rounded-lg p-4 ${
                    image.broken ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10' : 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                  }`}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {image.broken ? (
                          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        )}
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                          {image.status} {image.statusText}
                        </span>
                      </div>
                      <button onClick={() => handleCopy(image.url)} className="p-1 rounded bg-white/80 dark:bg-gray-800/80 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shadow hover:bg-orange-100 dark:hover:bg-orange-900/30 transition">
                        {copied ? <Check className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    <div className="text-sm text-gray-700 dark:text-gray-200 break-all mb-2">{image.url}</div>
                    
                    <div className="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{image.responseTime}ms</span>
                      </div>
                      {image.size && (
                        <div className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3" />
                          <span>{formatFileSize(image.size)}</span>
                        </div>
                      )}
                    </div>
                    
                    {image.error && (
                      <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                        <strong>Error:</strong> {image.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl shadow-xl p-4 sm:p-6">
                <h4 className="text-base font-semibold text-blue-800 dark:text-blue-200 mb-3">Recommendations</h4>
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