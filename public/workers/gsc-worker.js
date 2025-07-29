// GSC Data Processing Web Worker
// This worker handles CPU-intensive data processing for Google Search Console data

// Worker context - runs in separate thread
self.onmessage = function(e) {
  const { type, data, taskId } = e.data;
  
  try {
    let result;
    
    switch (type) {
      case 'AGGREGATE_PERFORMANCE_DATA':
        result = aggregatePerformanceData(data);
        break;
        
      case 'PROCESS_COVERAGE_DATA':
        result = processCoverageData(data);
        break;
        
      case 'ENHANCE_PAGE_DATA':
        result = enhancePageData(data);
        break;
        
      case 'BATCH_PROCESS_URLS':
        result = batchProcessUrls(data);
        break;
        
      case 'CALCULATE_METRICS':
        result = calculateMetrics(data);
        break;
        
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
    
    // Send success response
    self.postMessage({
      taskId,
      success: true,
      result,
      type
    });
    
  } catch (error) {
    // Send error response
    self.postMessage({
      taskId,
      success: false,
      error: error.message,
      type
    });
  }
};

// Aggregate performance data from multiple sources
function aggregatePerformanceData(data) {
  const { performanceData, sitemapData, urlInspectionData } = data;
  
  const aggregated = {
    totalPages: 0,
    indexedPages: 0,
    nonIndexedPages: 0,
    performanceMetrics: {
      totalClicks: 0,
      totalImpressions: 0,
      avgCTR: 0,
      avgPosition: 0
    },
    coverage: {
      valid: 0,
      warning: 0,
      error: 0,
      excluded: 0
    },
    enhancedPages: []
  };
  
  // Process performance data
  if (performanceData && performanceData.rows) {
    performanceData.rows.forEach(row => {
      aggregated.performanceMetrics.totalClicks += row.clicks || 0;
      aggregated.performanceMetrics.totalImpressions += row.impressions || 0;
    });
    
    if (aggregated.performanceMetrics.totalImpressions > 0) {
      aggregated.performanceMetrics.avgCTR = aggregated.performanceMetrics.totalClicks / aggregated.performanceMetrics.totalImpressions;
    }
  }
  
  // Process sitemap data
  if (sitemapData && sitemapData.sitemap) {
    aggregated.totalPages = sitemapData.sitemap.length || 0;
  }
  
  // Process URL inspection data
  if (urlInspectionData && urlInspectionData.inspectionResults) {
    urlInspectionData.inspectionResults.forEach(result => {
      if (result.indexStatusResult && result.indexStatusResult.verdict === 'PASS') {
        aggregated.indexedPages++;
      } else {
        aggregated.nonIndexedPages++;
      }
      
      // Categorize coverage
      if (result.indexStatusResult) {
        const verdict = result.indexStatusResult.verdict;
        if (verdict === 'PASS') aggregated.coverage.valid++;
        else if (verdict === 'PARTIAL') aggregated.coverage.warning++;
        else if (verdict === 'FAIL') aggregated.coverage.error++;
        else aggregated.coverage.excluded++;
      }
    });
  }
  
  // Calculate average position
  if (performanceData && performanceData.rows && performanceData.rows.length > 0) {
    const totalPosition = performanceData.rows.reduce((sum, row) => sum + (row.position || 0), 0);
    aggregated.performanceMetrics.avgPosition = totalPosition / performanceData.rows.length;
  }
  
  return aggregated;
}

// Process coverage data and categorize issues
function processCoverageData(data) {
  const { coverageData, urlInspectionData } = data;
  
  const processed = {
    coverageSummary: {
      total: 0,
      indexed: 0,
      notIndexed: 0,
      excluded: 0
    },
    issues: {
      critical: [],
      warning: [],
      info: []
    },
    recommendations: []
  };
  
  // Process coverage data
  if (coverageData && coverageData.inspectionResults) {
    coverageData.inspectionResults.forEach(result => {
      processed.coverageSummary.total++;
      
      if (result.indexStatusResult) {
        const verdict = result.indexStatusResult.verdict;
        if (verdict === 'PASS') {
          processed.coverageSummary.indexed++;
        } else if (verdict === 'EXCLUDED') {
          processed.coverageSummary.excluded++;
        } else {
          processed.coverageSummary.notIndexed++;
          
          // Categorize issues
          const issue = {
            url: result.inspectionResultLink,
            verdict: verdict,
            reasons: result.indexStatusResult.coverageState || 'Unknown',
            severity: verdict === 'FAIL' ? 'critical' : 'warning'
          };
          
          if (issue.severity === 'critical') {
            processed.issues.critical.push(issue);
          } else {
            processed.issues.warning.push(issue);
          }
        }
      }
    });
  }
  
  // Generate recommendations
  if (processed.issues.critical.length > 0) {
    processed.recommendations.push({
      type: 'critical',
      message: `${processed.issues.critical.length} pages have critical indexing issues that need immediate attention.`
    });
  }
  
  if (processed.issues.warning.length > 0) {
    processed.recommendations.push({
      type: 'warning',
      message: `${processed.issues.warning.length} pages have warnings that should be reviewed.`
    });
  }
  
  return processed;
}

// Enhance page data with additional metrics
function enhancePageData(data) {
  const { pages, performanceData, urlInspectionData } = data;
  
  const enhanced = pages.map(page => {
    const enhancedPage = {
      ...page,
      enhanced: true,
      metrics: {
        performance: null,
        indexing: null,
        recommendations: []
      }
    };
    
    // Add performance data
    if (performanceData && performanceData.rows) {
      const pagePerformance = performanceData.rows.find(row => row.keys[0] === page.page);
      if (pagePerformance) {
        enhancedPage.metrics.performance = {
          clicks: pagePerformance.clicks || 0,
          impressions: pagePerformance.impressions || 0,
          ctr: pagePerformance.ctr || 0,
          position: pagePerformance.position || 0
        };
      }
    }
    
    // Add indexing data
    if (urlInspectionData && urlInspectionData.inspectionResults) {
      const pageInspection = urlInspectionData.inspectionResults.find(
        result => result.inspectionResultLink === page.page
      );
      
      if (pageInspection && pageInspection.indexStatusResult) {
        enhancedPage.metrics.indexing = {
          verdict: pageInspection.indexStatusResult.verdict,
          coverageState: pageInspection.indexStatusResult.coverageState,
          robotsTxtState: pageInspection.indexStatusResult.robotsTxtState,
          indexingState: pageInspection.indexStatusResult.indexingState
        };
        
        // Generate recommendations
        if (pageInspection.indexStatusResult.verdict !== 'PASS') {
          enhancedPage.metrics.recommendations.push({
            type: 'indexing',
            message: `Page has indexing issues: ${pageInspection.indexStatusResult.verdict}`,
            priority: pageInspection.indexStatusResult.verdict === 'FAIL' ? 'high' : 'medium'
          });
        }
      }
    }
    
    return enhancedPage;
  });
  
  return enhanced;
}

// Process URLs in batches for parallel processing
function batchProcessUrls(data) {
  const { urls, batchSize = 10 } = data;
  
  const batches = [];
  for (let i = 0; i < urls.length; i += batchSize) {
    batches.push(urls.slice(i, i + batchSize));
  }
  
  return {
    batches,
    totalBatches: batches.length,
    totalUrls: urls.length,
    batchSize
  };
}

// Calculate various metrics and statistics
function calculateMetrics(data) {
  const { performanceData, coverageData, pages } = data;
  
  const metrics = {
    performance: {
      totalClicks: 0,
      totalImpressions: 0,
      avgCTR: 0,
      avgPosition: 0,
      topPages: [],
      topKeywords: []
    },
    coverage: {
      totalPages: 0,
      indexedPages: 0,
      nonIndexedPages: 0,
      coverageRate: 0
    },
    trends: {
      clicksTrend: [],
      impressionsTrend: [],
      ctrTrend: []
    }
  };
  
  // Calculate performance metrics
  if (performanceData && performanceData.rows) {
    performanceData.rows.forEach(row => {
      metrics.performance.totalClicks += row.clicks || 0;
      metrics.performance.totalImpressions += row.impressions || 0;
    });
    
    if (metrics.performance.totalImpressions > 0) {
      metrics.performance.avgCTR = metrics.performance.totalClicks / metrics.performance.totalImpressions;
    }
    
    // Calculate average position
    const totalPosition = performanceData.rows.reduce((sum, row) => sum + (row.position || 0), 0);
    metrics.performance.avgPosition = totalPosition / performanceData.rows.length;
    
    // Get top performing pages
    metrics.performance.topPages = performanceData.rows
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
      .slice(0, 10)
      .map(row => ({
        page: row.keys[0],
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0
      }));
  }
  
  // Calculate coverage metrics
  if (coverageData && coverageData.inspectionResults) {
    metrics.coverage.totalPages = coverageData.inspectionResults.length;
    metrics.coverage.indexedPages = coverageData.inspectionResults.filter(
      result => result.indexStatusResult && result.indexStatusResult.verdict === 'PASS'
    ).length;
    metrics.coverage.nonIndexedPages = metrics.coverage.totalPages - metrics.coverage.indexedPages;
    
    if (metrics.coverage.totalPages > 0) {
      metrics.coverage.coverageRate = (metrics.coverage.indexedPages / metrics.coverage.totalPages) * 100;
    }
  }
  
  return metrics;
}

// Worker initialization message
self.postMessage({
  type: 'WORKER_READY',
  message: 'GSC Data Processing Worker initialized and ready'
}); 