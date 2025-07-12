'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, TrendingUp, DollarSign, Users, Target, BarChart3, Download, RotateCcw, Eye, MousePointer, ShoppingCart, Zap } from 'lucide-react';

interface ROIData {
  organicTraffic: number;
  conversionRate: number;
  averageOrderValue: number;
  keywordRankings: number;
  clickThroughRate: number;
  costPerClick: number;
  monthlyBudget: number;
  timeFrame: number;
}

interface ROICalculation {
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  roi: number;
  monthlyRevenue: number;
  breakEvenMonths: number;
  trafficValue: number;
  keywordValue: number;
}

export default function SEOROICalculatorPage() {
  const [formData, setFormData] = useState<ROIData>({
    organicTraffic: 10000,
    conversionRate: 2.5,
    averageOrderValue: 100,
    keywordRankings: 50,
    clickThroughRate: 3.2,
    costPerClick: 2.5,
    monthlyBudget: 2000,
    timeFrame: 12
  });

  const [results, setResults] = useState<ROICalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const editingRef = useRef<{ [K in keyof ROIData]?: boolean }>({});

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setFormData(prev => {
        const updated: ROIData = { ...prev };
        if (!editingRef.current.organicTraffic) updated.organicTraffic = 8000 + Math.floor(Math.random() * 12000);
        if (!editingRef.current.conversionRate) updated.conversionRate = +(1 + Math.random() * 4).toFixed(2);
        if (!editingRef.current.averageOrderValue) updated.averageOrderValue = 50 + Math.floor(Math.random() * 200);
        if (!editingRef.current.keywordRankings) updated.keywordRankings = 20 + Math.floor(Math.random() * 80);
        if (!editingRef.current.clickThroughRate) updated.clickThroughRate = +(1 + Math.random() * 5).toFixed(2);
        if (!editingRef.current.costPerClick) updated.costPerClick = +(1 + Math.random() * 5).toFixed(2);
        if (!editingRef.current.monthlyBudget) updated.monthlyBudget = 1000 + Math.floor(Math.random() * 4000);
        if (!editingRef.current.timeFrame) updated.timeFrame = 6 + Math.floor(Math.random() * 18);
        return updated;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const calculateROI = (data: ROIData): ROICalculation => {
    const monthlyTraffic = data.organicTraffic;
    const monthlyConversions = (monthlyTraffic * data.conversionRate) / 100;
    const monthlyRevenue = monthlyConversions * data.averageOrderValue;
    const totalRevenue = monthlyRevenue * data.timeFrame;
    const totalCost = data.monthlyBudget * data.timeFrame;
    const netProfit = totalRevenue - totalCost;
    const roi = totalCost > 0 ? ((netProfit / totalCost) * 100) : 0;
    const breakEvenMonths = data.monthlyBudget > 0 ? data.monthlyBudget / monthlyRevenue : 0;
    const trafficValue = monthlyTraffic * data.clickThroughRate * data.costPerClick / 100;
    const keywordValue = data.keywordRankings * 50; // Estimated value per ranking

    return {
      totalRevenue,
      totalCost,
      netProfit,
      roi,
      monthlyRevenue,
      breakEvenMonths,
      trafficValue,
      keywordValue
    };
  };

  const handleInputChange = (field: keyof ROIData, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    editingRef.current[field] = true;
    setTimeout(() => { editingRef.current[field] = false; }, 2000);
  };

  const handleRefresh = () => {
    setFormData({
      organicTraffic: 8000 + Math.floor(Math.random() * 12000),
      conversionRate: +(1 + Math.random() * 4).toFixed(2),
      averageOrderValue: 50 + Math.floor(Math.random() * 200),
      keywordRankings: 20 + Math.floor(Math.random() * 80),
      clickThroughRate: +(1 + Math.random() * 5).toFixed(2),
      costPerClick: +(1 + Math.random() * 5).toFixed(2),
      monthlyBudget: 1000 + Math.floor(Math.random() * 4000),
      timeFrame: 6 + Math.floor(Math.random() * 18)
    });
    setRefreshKey(k => k + 1);
  };

  const handleCalculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setResults(calculateROI(formData));
      setIsCalculating(false);
    }, 800);
  };

  const handleReset = () => {
    setFormData({
      organicTraffic: 10000,
      conversionRate: 2.5,
      averageOrderValue: 100,
      keywordRankings: 50,
      clickThroughRate: 3.2,
      costPerClick: 2.5,
      monthlyBudget: 2000,
      timeFrame: 12
    });
    setResults(null);
  };

  const exportResults = () => {
    if (!results) return;
    
    const report = `
SEO ROI Calculator Report
Generated: ${new Date().toLocaleDateString()}

INPUT PARAMETERS:
- Monthly Organic Traffic: ${formData.organicTraffic.toLocaleString()}
- Conversion Rate: ${formData.conversionRate}%
- Average Order Value: $${formData.averageOrderValue}
- Keyword Rankings: ${formData.keywordRankings}
- Click-Through Rate: ${formData.clickThroughRate}%
- Cost Per Click: $${formData.costPerClick}
- Monthly Budget: $${formData.monthlyBudget}
- Time Frame: ${formData.timeFrame} months

RESULTS:
- Total Revenue: $${results.totalRevenue.toLocaleString()}
- Total Cost: $${results.totalCost.toLocaleString()}
- Net Profit: $${results.netProfit.toLocaleString()}
- ROI: ${results.roi.toFixed(2)}%
- Monthly Revenue: $${results.monthlyRevenue.toLocaleString()}
- Break-even Months: ${results.breakEvenMonths.toFixed(1)}
- Traffic Value: $${results.trafficValue.toLocaleString()}
- Keyword Value: $${results.keywordValue.toLocaleString()}
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'seo-roi-report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (formData.organicTraffic > 0) {
      handleCalculate();
    }
  }, [formData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#f0f4ff] to-[#f8fafc] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
              <Calculator className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent drop-shadow-lg">
              SEO ROI Calculator
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Calculate the return on investment for your SEO efforts with real-time analysis and detailed insights
          </p>
        </motion.div>
        <div className="flex justify-end mb-4">
          <button onClick={handleRefresh} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-xl text-base">
            <RotateCcw size={20} /> Refresh Data
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Target className="text-purple-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Input Parameters</h2>
            </div>

            <div className="space-y-6">
              {/* Traffic & Conversion */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Monthly Organic Traffic
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="number"
                      value={formData.organicTraffic}
                      onChange={(e) => handleInputChange('organicTraffic', Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-700 dark:placeholder-gray-400"
                      placeholder="10000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Conversion Rate (%)
                  </label>
                  <div className="relative">
                    <MousePointer className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="number"
                      step="0.1"
                      value={formData.conversionRate}
                      onChange={(e) => handleInputChange('conversionRate', Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-700 dark:placeholder-gray-400"
                      placeholder="2.5"
                    />
                  </div>
                </div>
              </div>

              {/* Revenue Metrics */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Average Order Value ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="number"
                      value={formData.averageOrderValue}
                      onChange={(e) => handleInputChange('averageOrderValue', Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-700 dark:placeholder-gray-400"
                      placeholder="100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Keyword Rankings
                  </label>
                  <div className="relative">
                    <BarChart3 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="number"
                      value={formData.keywordRankings}
                      onChange={(e) => handleInputChange('keywordRankings', Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-700 dark:placeholder-gray-400"
                      placeholder="50"
                    />
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Click-Through Rate (%)
                  </label>
                  <div className="relative">
                    <Eye className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="number"
                      step="0.1"
                      value={formData.clickThroughRate}
                      onChange={(e) => handleInputChange('clickThroughRate', Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-700 dark:placeholder-gray-400"
                      placeholder="3.2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Cost Per Click ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="number"
                      step="0.1"
                      value={formData.costPerClick}
                      onChange={(e) => handleInputChange('costPerClick', Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-700 dark:placeholder-gray-400"
                      placeholder="2.5"
                    />
                  </div>
                </div>
              </div>

              {/* Budget & Timeframe */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Monthly Budget ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="number"
                      value={formData.monthlyBudget}
                      onChange={(e) => handleInputChange('monthlyBudget', Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-700 dark:placeholder-gray-400"
                      placeholder="2000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Time Frame (Months)
                  </label>
                  <div className="relative">
                    <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="number"
                      value={formData.timeFrame}
                      onChange={(e) => handleInputChange('timeFrame', Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-700 dark:placeholder-gray-400"
                      placeholder="12"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full font-semibold hover:from-gray-600 hover:to-gray-700 transition-all shadow-xl"
                >
                  <RotateCcw size={20} />
                  Reset
                </button>
                {results && (
                  <button
                    onClick={exportResults}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all shadow-xl"
                  >
                    <Download size={20} />
                    Export Report
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {isCalculating ? (
              <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Calculating ROI...</p>
                </div>
              </div>
            ) : results ? (
              <>
                {/* Main ROI Card */}
                <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="text-green-500" size={24} />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">ROI Analysis</h2>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {results.roi.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">ROI</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        ${results.netProfit.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Net Profit</div>
                    </div>
                  </div>
                </div>

                {/* Revenue & Cost Breakdown */}
                <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Financial Breakdown</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Total Revenue</span>
                      <span className="text-xl font-bold text-green-600">${results.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Total Cost</span>
                      <span className="text-xl font-bold text-red-600">${results.totalCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Monthly Revenue</span>
                      <span className="text-xl font-bold text-blue-600">${results.monthlyRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Metrics */}
                <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Key Metrics</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {results.breakEvenMonths.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Break-even Months</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                      <div className="text-2xl font-bold text-orange-600 mb-1">
                        ${results.trafficValue.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Traffic Value</div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                <Calculator className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-lg text-gray-600 dark:text-gray-400">Enter your SEO metrics to see ROI calculations</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
} 