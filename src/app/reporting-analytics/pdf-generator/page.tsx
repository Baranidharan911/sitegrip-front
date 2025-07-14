'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, Download, Eye, Settings, BarChart3, TrendingUp, Users, Globe } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Image from 'next/image';

interface Widget {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  component: (props: { refreshKey: number }) => JSX.Element;
}

// --- Real-time Data Simulation Helpers ---
function useAnimatedNumber(initial: number, min: number, max: number) {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    const interval = setInterval(() => {
      setValue(v => {
        let next = v + (Math.random() - 0.5) * (max - min) * 0.05;
        next = Math.max(min, Math.min(max, Math.round(next)));
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [min, max]);
  return [value, setValue] as const;
}

// --- Real-time Widgets ---
const RankTrackingWidget = ({ refreshKey }: { refreshKey: number }) => {
  const [avgPos, setAvgPos] = useAnimatedNumber(3, 1, 10);
  const [top10, setTop10] = useAnimatedNumber(147, 100, 200);
  const [posChange, setPosChange] = useAnimatedNumber(23, -10, 50);
  useEffect(() => {
    setAvgPos(3 + Math.floor(Math.random() * 5));
    setTop10(120 + Math.floor(Math.random() * 80));
    setPosChange(-10 + Math.floor(Math.random() * 60));
  }, [refreshKey]);
  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white p-4 rounded-lg border">
      <h3 className="font-semibold mb-2 flex items-center gap-2">
        <TrendingUp size={16} className="text-green-500" />
        Rank Tracking Summary
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Average Position</span>
          <motion.span className="font-medium" animate={{ scale: [1, 1.2, 1] }}>{avgPos} ↑</motion.span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Keywords in Top 10</span>
          <motion.span className="font-medium" animate={{ scale: [1, 1.2, 1] }}>{top10}</motion.span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Position Changes</span>
          <motion.span className="font-medium text-green-600" animate={{ scale: [1, 1.2, 1] }}>{posChange > 0 ? '+' : ''}{posChange}</motion.span>
        </div>
      </div>
    </motion.div>
  );
};

const TrafficWidget = ({ refreshKey }: { refreshKey: number }) => {
  const [thisMonth, setThisMonth] = useAnimatedNumber(12847, 10000, 20000);
  const [lastMonth, setLastMonth] = useAnimatedNumber(11234, 8000, 18000);
  const [growth, setGrowth] = useAnimatedNumber(14, -10, 40);
  useEffect(() => {
    setThisMonth(10000 + Math.floor(Math.random() * 10000));
    setLastMonth(8000 + Math.floor(Math.random() * 10000));
    setGrowth(-10 + Math.floor(Math.random() * 50));
  }, [refreshKey]);
  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white p-4 rounded-lg border">
      <h3 className="font-semibold mb-2 flex items-center gap-2">
        <Users size={16} className="text-blue-500" />
        Organic Traffic
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">This Month</span>
          <motion.span className="font-medium" animate={{ scale: [1, 1.2, 1] }}>{thisMonth.toLocaleString()}</motion.span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Last Month</span>
          <motion.span className="font-medium" animate={{ scale: [1, 1.2, 1] }}>{lastMonth.toLocaleString()}</motion.span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Growth</span>
          <motion.span className="font-medium text-green-600" animate={{ scale: [1, 1.2, 1] }}>{growth > 0 ? '+' : ''}{growth}%</motion.span>
        </div>
      </div>
    </motion.div>
  );
};

const BacklinkWidget = ({ refreshKey }: { refreshKey: number }) => {
  const [total, setTotal] = useAnimatedNumber(2847, 2000, 5000);
  const [newMonth, setNewMonth] = useAnimatedNumber(156, 50, 300);
  const [da, setDA] = useAnimatedNumber(72, 30, 100);
  useEffect(() => {
    setTotal(2000 + Math.floor(Math.random() * 3000));
    setNewMonth(50 + Math.floor(Math.random() * 250));
    setDA(30 + Math.floor(Math.random() * 70));
  }, [refreshKey]);
  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white p-4 rounded-lg border">
      <h3 className="font-semibold mb-2 flex items-center gap-2">
        <Globe size={16} className="text-purple-500" />
        Backlink Growth
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Total Backlinks</span>
          <motion.span className="font-medium" animate={{ scale: [1, 1.2, 1] }}>{total}</motion.span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">New This Month</span>
          <motion.span className="font-medium" animate={{ scale: [1, 1.2, 1] }}>{newMonth}</motion.span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Domain Authority</span>
          <motion.span className="font-medium" animate={{ scale: [1, 1.2, 1] }}>{da}</motion.span>
        </div>
      </div>
    </motion.div>
  );
};

const CoreWebVitalsWidget = ({ refreshKey }: { refreshKey: number }) => {
  const [lcp, setLCP] = useAnimatedNumber(2.1, 1.5, 3.5);
  const [fid, setFID] = useAnimatedNumber(12, 5, 30);
  const [cls, setCLS] = useAnimatedNumber(0.12, 0.01, 0.25);
  useEffect(() => {
    setLCP(1.5 + Math.random() * 2);
    setFID(5 + Math.random() * 25);
    setCLS(0.01 + Math.random() * 0.24);
  }, [refreshKey]);
  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white p-4 rounded-lg border">
      <h3 className="font-semibold mb-2 flex items-center gap-2">
        <BarChart3 size={16} className="text-orange-500" />
        Core Web Vitals
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">LCP</span>
          <motion.span className="font-medium text-green-600" animate={{ scale: [1, 1.2, 1] }}>{lcp.toFixed(2)}s</motion.span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">FID</span>
          <motion.span className="font-medium text-green-600" animate={{ scale: [1, 1.2, 1] }}>{fid}ms</motion.span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">CLS</span>
          <motion.span className="font-medium text-yellow-600" animate={{ scale: [1, 1.2, 1] }}>{cls.toFixed(2)}</motion.span>
        </div>
      </div>
    </motion.div>
  );
};

const availableWidgets: Widget[] = [
  {
    id: 'rank-tracking',
    title: 'Rank Tracking Summary',
    description: 'Overview of keyword rankings and position changes',
    icon: TrendingUp,
    component: (props) => <RankTrackingWidget {...props} />
  },
  {
    id: 'organic-traffic',
    title: 'Organic Traffic Chart',
    description: 'Monthly organic traffic growth and statistics',
    icon: Users,
    component: (props) => <TrafficWidget {...props} />
  },
  {
    id: 'backlink-growth',
    title: 'Backlink Growth',
    description: 'Backlink acquisition and domain authority metrics',
    icon: Globe,
    component: (props) => <BacklinkWidget {...props} />
  },
  {
    id: 'core-web-vitals',
    title: 'Core Web Vitals',
    description: 'Website performance and user experience metrics',
    icon: BarChart3,
    component: (props) => <CoreWebVitalsWidget {...props} />
  }
];

export default function PDFGeneratorPage() {
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>(['rank-tracking', 'organic-traffic']);
  const [logo, setLogo] = useState<string | null>(null);
  const [reportTitle, setReportTitle] = useState('SEO Performance Report');
  const [clientName, setClientName] = useState('Client Name');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [generating, setGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleWidget = (widgetId: string) => {
    setSelectedWidgets(prev => 
      prev.includes(widgetId) 
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  const generatePDF = async () => {
    if (!reportRef.current) return;
    
    setGenerating(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${reportTitle.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setGenerating(false);
    }
  };

  const selectedWidgetComponents = availableWidgets.filter(widget => 
    selectedWidgets.includes(widget.id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#f0f4ff] to-[#f8fafc] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
              <FileText className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent drop-shadow-lg">
              PDF Report Generator
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-xl mx-auto">
            Create professional white-label PDF reports with custom branding
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Report Settings */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                <Settings size={22} />
                Report Settings
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Report Title
                  </label>
                  <input
                    type="text"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="w-full px-5 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-5 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Report Date
                  </label>
                  <input
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full px-5 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upload Logo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center bg-white/70 dark:bg-gray-800/70 shadow">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      {logo ? (
                        <Image src={logo} alt="Logo" width={64} height={64} className="max-h-16 mx-auto" />
                      ) : (
                        <div className="space-y-2">
                          <Upload className="mx-auto text-gray-400" size={28} />
                          <p className="text-sm text-gray-500">Click to upload logo</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Widget Selection */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                Select Widgets
              </h3>
              <div className="grid gap-4">
                {availableWidgets.map((widget) => {
                  const active = selectedWidgets.includes(widget.id);
                  return (
                    <button
                      key={widget.id}
                      type="button"
                      onClick={() => toggleWidget(widget.id)}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${active ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'}`}
                    >
                      <widget.icon size={22} className="text-blue-500" />
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{widget.title}</div>
                        <div className="text-xs text-gray-500">{widget.description}</div>
                      </div>
                      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${active ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
                        {active && <span className="w-3 h-3 bg-white rounded-full" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Generate Button */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => {
                generatePDF();
                setRefreshKey(prev => prev + 1);
              }}
              disabled={generating || selectedWidgets.length === 0}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-semibold hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl text-lg"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Generate PDF
                </>
              )}
            </motion.button>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Eye size={22} className="text-gray-500" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    Report Preview
                  </h3>
                </div>
              </div>
              <div className="p-8 bg-gray-50 dark:bg-gray-900 max-h-[600px] overflow-y-auto">
                <div ref={reportRef} className="bg-white p-10 shadow-2xl mx-auto rounded-xl border border-gray-200 dark:border-gray-700" style={{ width: '210mm', minHeight: '297mm' }}>
                  {/* Report Header */}
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{reportTitle}</h1>
                      <p className="text-lg text-gray-600">Prepared for: {clientName}</p>
                      <p className="text-sm text-gray-500">Report Date: {reportDate}</p>
                    </div>
                    {logo && (
                      <Image src={logo} alt="Company Logo" width={128} height={64} className="max-h-16 max-w-32 object-contain" />
                    )}
                  </div>
                  {/* Report Content */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {selectedWidgetComponents.map((widget) => (
                      <widget.component key={widget.id} refreshKey={refreshKey} />
                    ))}
                  </div>
                  {selectedWidgets.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <FileText size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Select widgets to preview your report</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 