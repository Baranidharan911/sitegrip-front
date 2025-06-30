'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, Download, Eye, Settings, BarChart3, TrendingUp, Users, Globe } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Widget {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  component: React.ComponentType;
}

// Sample widget components
const RankTrackingWidget = () => (
  <div className="bg-white p-4 rounded-lg border">
    <h3 className="font-semibold mb-2 flex items-center gap-2">
      <TrendingUp size={16} className="text-green-500" />
      Rank Tracking Summary
    </h3>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">Average Position</span>
        <span className="font-medium">3.2 ↑</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">Keywords in Top 10</span>
        <span className="font-medium">147</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">Position Changes</span>
        <span className="font-medium text-green-600">+23</span>
      </div>
    </div>
  </div>
);

const TrafficWidget = () => (
  <div className="bg-white p-4 rounded-lg border">
    <h3 className="font-semibold mb-2 flex items-center gap-2">
      <Users size={16} className="text-blue-500" />
      Organic Traffic
    </h3>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">This Month</span>
        <span className="font-medium">12,847</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">Last Month</span>
        <span className="font-medium">11,234</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">Growth</span>
        <span className="font-medium text-green-600">+14.4%</span>
      </div>
    </div>
  </div>
);

const BacklinkWidget = () => (
  <div className="bg-white p-4 rounded-lg border">
    <h3 className="font-semibold mb-2 flex items-center gap-2">
      <Globe size={16} className="text-purple-500" />
      Backlink Growth
    </h3>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">Total Backlinks</span>
        <span className="font-medium">2,847</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">New This Month</span>
        <span className="font-medium">156</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">Domain Authority</span>
        <span className="font-medium">72</span>
      </div>
    </div>
  </div>
);

const CoreWebVitalsWidget = () => (
  <div className="bg-white p-4 rounded-lg border">
    <h3 className="font-semibold mb-2 flex items-center gap-2">
      <BarChart3 size={16} className="text-orange-500" />
      Core Web Vitals
    </h3>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">LCP</span>
        <span className="font-medium text-green-600">Good</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">FID</span>
        <span className="font-medium text-green-600">Good</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">CLS</span>
        <span className="font-medium text-yellow-600">Needs Improvement</span>
      </div>
    </div>
  </div>
);

const availableWidgets: Widget[] = [
  {
    id: 'rank-tracking',
    title: 'Rank Tracking Summary',
    description: 'Overview of keyword rankings and position changes',
    icon: TrendingUp,
    component: RankTrackingWidget
  },
  {
    id: 'organic-traffic',
    title: 'Organic Traffic Chart',
    description: 'Monthly organic traffic growth and statistics',
    icon: Users,
    component: TrafficWidget
  },
  {
    id: 'backlink-growth',
    title: 'Backlink Growth',
    description: 'Backlink acquisition and domain authority metrics',
    icon: Globe,
    component: BacklinkWidget
  },
  {
    id: 'core-web-vitals',
    title: 'Core Web Vitals',
    description: 'Website performance and user experience metrics',
    icon: BarChart3,
    component: CoreWebVitalsWidget
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <FileText className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              PDF Report Generator
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xl mx-auto">
            Create professional white-label PDF reports with custom branding
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-4">
            {/* Report Settings */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                <Settings size={20} />
                Report Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Report Title
                  </label>
                  <input
                    type="text"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upload Logo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      {logo ? (
                        <img src={logo} alt="Logo" className="max-h-16 mx-auto" />
                      ) : (
                        <div className="space-y-2">
                          <Upload className="mx-auto text-gray-400" size={24} />
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
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Select Widgets
              </h3>
              
              <div className="space-y-2">
                {availableWidgets.map((widget) => (
                  <div key={widget.id} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={widget.id}
                      checked={selectedWidgets.includes(widget.id)}
                      onChange={() => toggleWidget(widget.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={widget.id} className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <widget.icon size={16} className="text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {widget.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {widget.description}
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Generate Button */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={generatePDF}
              disabled={generating || selectedWidgets.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Download size={16} />
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
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Eye size={20} className="text-gray-500" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Report Preview
                  </h3>
                </div>
              </div>
              
              <div className="p-6 bg-gray-50 dark:bg-gray-900 max-h-[600px] overflow-y-auto">
                <div ref={reportRef} className="bg-white p-8 shadow-lg mx-auto" style={{ width: '210mm', minHeight: '297mm' }}>
                  {/* Report Header */}
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{reportTitle}</h1>
                      <p className="text-lg text-gray-600">Prepared for: {clientName}</p>
                      <p className="text-sm text-gray-500">Report Date: {reportDate}</p>
                    </div>
                    {logo && (
                      <img src={logo} alt="Company Logo" className="max-h-16 max-w-32 object-contain" />
                    )}
                  </div>

                  {/* Report Content */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedWidgetComponents.map((widget) => (
                      <widget.component key={widget.id} />
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