'use client';

import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface IndexedPagesData {
  pages: Array<{
    url: string;
    indexed: boolean;
    clicks?: number;
    impressions?: number;
    ctr?: number;
    position?: number;
    coverageState?: string;
  }>;
  performance?: {
    totalClicks: number;
    totalImpressions: number;
    avgCTR: number;
    avgPosition: number;
  };
}

interface IndexingSummary {
  totalPages: number;
  indexedPages: number;
  notIndexedPages: number;
  pendingPages: number;
  errorPages: number;
  indexingRate: number;
}

interface IndexedPagesChartsProps {
  data: IndexedPagesData;
  summary: IndexingSummary;
}

export default function IndexedPagesCharts({ data, summary }: IndexedPagesChartsProps) {
  const [chartType, setChartType] = useState<'performance' | 'distribution' | 'trends'>('performance');
  const [metric, setMetric] = useState<'clicks' | 'impressions' | 'ctr' | 'position'>('clicks');

  // Prepare data for charts
  const indexedPages = data.pages.filter(page => page.indexed);
  const nonIndexedPages = data.pages.filter(page => !page.indexed);

  // Performance distribution chart data
  const performanceData = {
    labels: indexedPages.slice(0, 20).map(page => {
      const url = new URL(page.url);
      return url.pathname.slice(0, 20) + (url.pathname.length > 20 ? '...' : '');
    }),
    datasets: [
      {
        label: 'Clicks',
        data: indexedPages.slice(0, 20).map(page => page.clicks || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
      {
        label: 'Impressions',
        data: indexedPages.slice(0, 20).map(page => page.impressions || 0),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
      },
    ],
  };

  // Indexing status distribution
  const distributionData = {
    labels: ['Indexed', 'Not Indexed', 'Pending', 'Errors'],
    datasets: [
      {
        data: [
          summary.indexedPages,
          summary.notIndexedPages,
          summary.pendingPages,
          summary.errorPages,
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Performance trends (simulated data)
  const trendsData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Indexed Pages',
        data: [summary.indexedPages * 0.8, summary.indexedPages * 0.85, summary.indexedPages * 0.9, summary.indexedPages],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Total Clicks',
        data: [(data.performance?.totalClicks || 0) * 0.7, (data.performance?.totalClicks || 0) * 0.8, (data.performance?.totalClicks || 0) * 0.9, data.performance?.totalClicks || 0],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Radar chart for performance metrics
  const radarData = {
    labels: ['Clicks', 'Impressions', 'CTR', 'Position', 'Indexing Rate'],
    datasets: [
      {
        label: 'Current Performance',
        data: [
          (data.performance?.totalClicks || 0) / 1000, // Normalize
          (data.performance?.totalImpressions || 0) / 10000, // Normalize
          (data.performance?.avgCTR || 0) * 10, // Scale up
          Math.max(0, 20 - (data.performance?.avgPosition || 0)), // Invert position (lower is better)
          summary.indexingRate,
        ],
        backgroundColor: 'rgba(147, 51, 234, 0.2)',
        borderColor: 'rgba(147, 51, 234, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(147, 51, 234, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(147, 51, 234, 1)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Indexed Pages Analytics',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="performance">Performance Analysis</SelectItem>
              <SelectItem value="distribution">Status Distribution</SelectItem>
              <SelectItem value="trends">Trends & Growth</SelectItem>
            </SelectContent>
          </Select>
          {chartType === 'performance' && (
            <Select value={metric} onValueChange={(value: any) => setMetric(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clicks">Clicks</SelectItem>
                <SelectItem value="impressions">Impressions</SelectItem>
                <SelectItem value="ctr">CTR</SelectItem>
                <SelectItem value="position">Position</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600 border-green-200">
            {summary.indexingRate}% Indexed
          </Badge>
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            {summary.totalPages} Total Pages
          </Badge>
        </div>
      </div>

      {/* Charts */}
      <Tabs defaultValue="main" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="main" className="flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Main Chart
          </TabsTrigger>
          <TabsTrigger value="distribution" className="flex items-center">
            <PieChart className="w-4 h-4 mr-2" />
            Distribution
          </TabsTrigger>
          <TabsTrigger value="radar" className="flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Performance Radar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="main" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {chartType === 'performance' && <BarChart3 className="w-5 h-5 mr-2" />}
                {chartType === 'distribution' && <PieChart className="w-5 h-5 mr-2" />}
                {chartType === 'trends' && <TrendingUp className="w-5 h-5 mr-2" />}
                {chartType === 'performance' && 'Top Pages Performance'}
                {chartType === 'distribution' && 'Indexing Status Distribution'}
                {chartType === 'trends' && 'Growth Trends'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                {chartType === 'performance' && (
                  <Bar data={performanceData} options={chartOptions} />
                )}
                {chartType === 'distribution' && (
                  <Doughnut data={distributionData} options={doughnutOptions} />
                )}
                {chartType === 'trends' && (
                  <Line data={trendsData} options={chartOptions} />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Indexing Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Doughnut data={distributionData} options={doughnutOptions} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="font-medium">Indexed</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-700">{summary.indexedPages.toLocaleString()}</div>
                      <div className="text-sm text-green-600">{summary.indexingRate}%</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                      <span className="font-medium">Not Indexed</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-yellow-700">{summary.notIndexedPages.toLocaleString()}</div>
                      <div className="text-sm text-yellow-600">
                        {Math.round((summary.notIndexedPages / summary.totalPages) * 100)}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="font-medium">Pending</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-700">{summary.pendingPages.toLocaleString()}</div>
                      <div className="text-sm text-blue-600">
                        {Math.round((summary.pendingPages / summary.totalPages) * 100)}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                      <span className="font-medium">Errors</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-700">{summary.errorPages.toLocaleString()}</div>
                      <div className="text-sm text-red-600">
                        {Math.round((summary.errorPages / summary.totalPages) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="radar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Radar Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <Radar data={radarData} options={radarOptions} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-900">
              {data.performance?.totalClicks.toLocaleString() || 0}
            </div>
            <p className="text-sm text-blue-600">Total Clicks</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-900">
              {data.performance?.totalImpressions.toLocaleString() || 0}
            </div>
            <p className="text-sm text-green-600">Total Impressions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-900">
              {data.performance?.avgCTR || 0}%
            </div>
            <p className="text-sm text-purple-600">Average CTR</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-900">
              {data.performance?.avgPosition || 0}
            </div>
            <p className="text-sm text-orange-600">Average Position</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 