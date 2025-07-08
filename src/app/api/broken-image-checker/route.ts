import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 0;

interface ImageResult {
  url: string;
  status: number;
  statusText: string;
  responseTime: number;
  size?: number;
  broken: boolean;
  error?: string;
}

interface BrokenImageAnalysis {
  totalImages: number;
  workingImages: number;
  brokenImages: number;
  results: ImageResult[];
  recommendations: string[];
  overallScore: number;
  stats: {
    totalSize: number;
    averageResponseTime: number;
    brokenPercentage: number;
  };
}

async function checkImage(url: string): Promise<ImageResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    const responseTime = Date.now() - startTime;
    const size = parseInt(response.headers.get('content-length') || '0');
    
    return {
      url,
      status: response.status,
      statusText: response.statusText,
      responseTime,
      size,
      broken: !response.ok || response.status >= 400
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    return {
      url,
      status: 0,
      statusText: 'Network Error',
      responseTime,
      broken: true,
      error: error.message || 'Failed to fetch image'
    };
  }
}

function extractImageUrls(html: string, baseUrl: string): string[] {
  const imageUrls = new Set<string>();
  
  // Extract from img tags
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const url = match[1];
    if (url && !url.startsWith('data:')) {
      try {
        const absoluteUrl = new URL(url, baseUrl).href;
        imageUrls.add(absoluteUrl);
      } catch (e) {
        // Invalid URL, skip
      }
    }
  }
  
  // Extract from picture tags
  const pictureRegex = /<picture[^>]*>.*?<source[^>]+srcset=["']([^"']+)["'][^>]*>.*?<\/picture>/gis;
  while ((match = pictureRegex.exec(html)) !== null) {
    const srcset = match[1];
    const urls = srcset.split(',').map(s => s.trim().split(' ')[0]);
    urls.forEach(url => {
      if (url && !url.startsWith('data:')) {
        try {
          const absoluteUrl = new URL(url, baseUrl).href;
          imageUrls.add(absoluteUrl);
        } catch (e) {
          // Invalid URL, skip
        }
      }
    });
  }
  
  // Extract from CSS background images (basic)
  const cssRegex = /background-image:\s*url\(["']?([^"')]+)["']?\)/gi;
  while ((match = cssRegex.exec(html)) !== null) {
    const url = match[1];
    if (url && !url.startsWith('data:')) {
      try {
        const absoluteUrl = new URL(url, baseUrl).href;
        imageUrls.add(absoluteUrl);
      } catch (e) {
        // Invalid URL, skip
      }
    }
  }
  
  return Array.from(imageUrls);
}

function generateRecommendations(results: ImageResult[]): string[] {
  const recommendations: string[] = [];
  const brokenCount = results.filter(r => r.broken).length;
  const totalCount = results.length;
  
  if (brokenCount > 0) {
    recommendations.push(`Fix ${brokenCount} broken image${brokenCount > 1 ? 's' : ''} to improve user experience`);
  }
  
  const slowImages = results.filter(r => !r.broken && r.responseTime > 2000);
  if (slowImages.length > 0) {
    recommendations.push(`Optimize ${slowImages.length} slow-loading image${slowImages.length > 1 ? 's' : ''} (over 2 seconds)`);
  }
  
  const largeImages = results.filter(r => !r.broken && r.size && r.size > 500000); // 500KB
  if (largeImages.length > 0) {
    recommendations.push(`Compress ${largeImages.length} large image${largeImages.length > 1 ? 's' : ''} (over 500KB) for better performance`);
  }
  
  if (brokenCount === 0 && totalCount > 0) {
    recommendations.push('All images are working correctly! Consider implementing lazy loading for better performance');
  }
  
  if (totalCount === 0) {
    recommendations.push('No images found on this page. Consider adding relevant images to improve user engagement');
  }
  
  return recommendations;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Fetch the HTML content
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      redirect: 'follow'
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch page: ${response.status} ${response.statusText}` }, { status: 400 });
    }

    const html = await response.text();
    const baseUrl = response.url;
    
    // Extract all image URLs
    const imageUrls = extractImageUrls(html, baseUrl);
    
    if (imageUrls.length === 0) {
      return NextResponse.json({
        status: response.status,
        statusText: response.statusText,
        url: baseUrl,
        totalImages: 0,
        workingImages: 0,
        brokenImages: 0,
        results: [],
        recommendations: ['No images found on this page'],
        overallScore: 100,
        stats: {
          totalSize: 0,
          averageResponseTime: 0,
          brokenPercentage: 0
        }
      });
    }

    // Check each image (limit to 50 images to avoid timeouts)
    const limitedUrls = imageUrls.slice(0, 50);
    const imagePromises = limitedUrls.map(checkImage);
    const results = await Promise.all(imagePromises);

    // Calculate statistics
    const workingImages = results.filter(r => !r.broken).length;
    const brokenImages = results.filter(r => r.broken).length;
    const totalSize = results.filter(r => !r.broken && r.size).reduce((sum, r) => sum + (r.size || 0), 0);
    const averageResponseTime = results.filter(r => !r.broken).reduce((sum, r) => sum + r.responseTime, 0) / Math.max(workingImages, 1);
    const brokenPercentage = (brokenImages / results.length) * 100;
    
    // Calculate overall score (100 - broken percentage - performance penalty)
    const performancePenalty = averageResponseTime > 2000 ? 10 : 0;
    const overallScore = Math.max(0, Math.round(100 - brokenPercentage - performancePenalty));

    // Generate recommendations
    const recommendations = generateRecommendations(results);

    const analysis: BrokenImageAnalysis = {
      totalImages: results.length,
      workingImages,
      brokenImages,
      results,
      recommendations,
      overallScore,
      stats: {
        totalSize,
        averageResponseTime: Math.round(averageResponseTime),
        brokenPercentage: Math.round(brokenPercentage * 100) / 100
      }
    };

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      url: baseUrl,
      ...analysis
    });

  } catch (err: any) {
    console.error('Broken Image Checker API error:', err);
    return NextResponse.json({ error: 'Failed to analyze images.' }, { status: 500 });
  }
} 