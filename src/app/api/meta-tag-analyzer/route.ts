import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 0;

interface MetaTagAnalysis {
  title: {
    content: string;
    length: number;
    optimal: boolean;
    score: number;
    issues: string[];
    recommendations: string[];
  };
  description: {
    content: string;
    length: number;
    optimal: boolean;
    score: number;
    issues: string[];
    recommendations: string[];
  };
  keywords: {
    content: string;
    count: number;
    score: number;
    issues: string[];
    recommendations: string[];
  };
  robots: {
    content: string;
    directives: string[];
    score: number;
    issues: string[];
    recommendations: string[];
  };
  viewport: {
    present: boolean;
    content: string;
    score: number;
    issues: string[];
    recommendations: string[];
  };
  charset: {
    present: boolean;
    content: string;
    score: number;
    issues: string[];
    recommendations: string[];
  };
  overallScore: number;
  recommendations: string[];
}

function analyzeTitle(title: string): any {
  const length = title.length;
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Length analysis
  if (length === 0) {
    issues.push('Missing title tag');
    recommendations.push('Add a descriptive title tag');
    score = 0;
  } else if (length < 30) {
    issues.push('Title is too short (under 30 characters)');
    recommendations.push('Make title more descriptive (30-60 characters)');
    score -= 20;
  } else if (length > 60) {
    issues.push('Title is too long (over 60 characters)');
    recommendations.push('Shorten title to 50-60 characters for better display');
    score -= 15;
  }

  // Content analysis
  if (title.toLowerCase().includes('welcome') || title.toLowerCase().includes('home')) {
    issues.push('Generic title detected');
    recommendations.push('Use more specific, keyword-rich titles');
    score -= 10;
  }

  if (!/[A-Z]/.test(title)) {
    issues.push('Title lacks proper capitalization');
    recommendations.push('Use title case for better readability');
    score -= 5;
  }

  if (title.includes('|') && title.split('|').length > 3) {
    issues.push('Too many separators in title');
    recommendations.push('Limit separators to 1-2 for better readability');
    score -= 5;
  }

  return {
    content: title,
    length,
    optimal: length >= 30 && length <= 60,
    score: Math.max(0, score),
    issues,
    recommendations
  };
}

function analyzeDescription(description: string): any {
  const length = description.length;
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Length analysis
  if (length === 0) {
    issues.push('Missing description');
    recommendations.push('Add a compelling meta description');
    score = 0;
  } else if (length < 120) {
    issues.push('Description is too short (under 120 characters)');
    recommendations.push('Expand description to 120-160 characters');
    score -= 15;
  } else if (length > 160) {
    issues.push('Description is too long (over 160 characters)');
    recommendations.push('Shorten description to 150-160 characters');
    score -= 10;
  }

  // Content analysis
  if (description.toLowerCase().includes('click here') || description.toLowerCase().includes('read more')) {
    issues.push('Generic call-to-action detected');
    recommendations.push('Use more specific, value-focused descriptions');
    score -= 10;
  }

  if (description.split(' ').length < 10) {
    issues.push('Description is too brief');
    recommendations.push('Add more detail about the page content');
    score -= 10;
  }

  return {
    content: description,
    length,
    optimal: length >= 120 && length <= 160,
    score: Math.max(0, score),
    issues,
    recommendations
  };
}

function analyzeKeywords(keywords: string): any {
  const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
  const count = keywordList.length;
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  if (count === 0) {
    issues.push('No keywords specified');
    recommendations.push('Add relevant keywords (though meta keywords have limited SEO impact)');
    score = 50;
  } else if (count > 10) {
    issues.push('Too many keywords (over 10)');
    recommendations.push('Focus on 5-8 most relevant keywords');
    score -= 20;
  }

  // Check for duplicate keywords
  const uniqueKeywords = new Set(keywordList.map(k => k.toLowerCase()));
  if (uniqueKeywords.size < count) {
    issues.push('Duplicate keywords detected');
    recommendations.push('Remove duplicate keywords');
    score -= 10;
  }

  return {
    content: keywords,
    count,
    score: Math.max(0, score),
    issues,
    recommendations
  };
}

function analyzeRobots(robots: string): any {
  const directives = robots.toLowerCase().split(',').map(d => d.trim());
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  if (directives.includes('noindex')) {
    issues.push('Page is set to noindex');
    recommendations.push('Remove noindex if you want this page indexed');
    score -= 50;
  }

  if (directives.includes('nofollow')) {
    issues.push('Page is set to nofollow');
    recommendations.push('Consider removing nofollow for important pages');
    score -= 20;
  }

  if (directives.includes('noarchive')) {
    issues.push('Page is set to noarchive');
    recommendations.push('Remove noarchive to allow search engines to cache the page');
    score -= 10;
  }

  return {
    content: robots,
    directives,
    score: Math.max(0, score),
    issues,
    recommendations
  };
}

function analyzeViewport(viewport: string): any {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  if (!viewport) {
    issues.push('Missing viewport meta tag');
    recommendations.push('Add viewport meta tag for mobile optimization');
    score = 0;
  } else if (!viewport.includes('width=device-width')) {
    issues.push('Viewport not optimized for mobile');
    recommendations.push('Use width=device-width, initial-scale=1');
    score -= 30;
  }

  return {
    present: !!viewport,
    content: viewport,
    score: Math.max(0, score),
    issues,
    recommendations
  };
}

function analyzeCharset(charset: string): any {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  if (!charset) {
    issues.push('Missing charset declaration');
    recommendations.push('Add charset meta tag (UTF-8 recommended)');
    score = 0;
  } else if (!charset.toLowerCase().includes('utf-8')) {
    issues.push('Non-UTF-8 charset detected');
    recommendations.push('Use UTF-8 charset for better compatibility');
    score -= 20;
  }

  return {
    present: !!charset,
    content: charset,
    score: Math.max(0, score),
    issues,
    recommendations
  };
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

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
    
    // Extract meta tags
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    const descriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
    const description = descriptionMatch ? descriptionMatch[1].trim() : '';

    const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']*)["'][^>]*>/i);
    const keywords = keywordsMatch ? keywordsMatch[1].trim() : '';

    const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i);
    const robots = robotsMatch ? robotsMatch[1].trim() : '';

    const viewportMatch = html.match(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']*)["'][^>]*>/i);
    const viewport = viewportMatch ? viewportMatch[1].trim() : '';

    const charsetMatch = html.match(/<meta[^>]*charset=["']([^"']*)["'][^>]*>/i);
    const charset = charsetMatch ? charsetMatch[1].trim() : '';

    // Analyze each component
    const titleAnalysis = analyzeTitle(title);
    const descriptionAnalysis = analyzeDescription(description);
    const keywordsAnalysis = analyzeKeywords(keywords);
    const robotsAnalysis = analyzeRobots(robots);
    const viewportAnalysis = analyzeViewport(viewport);
    const charsetAnalysis = analyzeCharset(charset);

    // Calculate overall score
    const scores = [
      titleAnalysis.score,
      descriptionAnalysis.score,
      keywordsAnalysis.score,
      robotsAnalysis.score,
      viewportAnalysis.score,
      charsetAnalysis.score
    ];
    const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    // Generate overall recommendations
    const allRecommendations = [
      ...titleAnalysis.recommendations,
      ...descriptionAnalysis.recommendations,
      ...keywordsAnalysis.recommendations,
      ...robotsAnalysis.recommendations,
      ...viewportAnalysis.recommendations,
      ...charsetAnalysis.recommendations
    ];

    const uniqueRecommendations = Array.from(new Set(allRecommendations));

    const analysis: MetaTagAnalysis = {
      title: titleAnalysis,
      description: descriptionAnalysis,
      keywords: keywordsAnalysis,
      robots: robotsAnalysis,
      viewport: viewportAnalysis,
      charset: charsetAnalysis,
      overallScore,
      recommendations: uniqueRecommendations
    };

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      ...analysis
    });

  } catch (err: any) {
    console.error('Meta Tag Analyzer API error:', err);
    return NextResponse.json({ error: 'Failed to analyze meta tags.' }, { status: 500 });
  }
} 