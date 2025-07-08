import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 0;

const OG_TAGS = {
  'og:title': { required: true, maxLength: 60, description: 'Page title for social sharing' },
  'og:type': { required: false, maxLength: 50, description: 'Content type (article, website, etc.)' },
  'og:image': { required: true, maxLength: 2048, description: 'Image URL for social preview' },
  'og:url': { required: false, maxLength: 2048, description: 'Canonical URL of the page' },
  'og:description': { required: true, maxLength: 160, description: 'Page description for social sharing' },
  'og:site_name': { required: false, maxLength: 50, description: 'Website name' },
  'og:locale': { required: false, maxLength: 10, description: 'Page locale (e.g., en_US)' },
  'og:image:width': { required: false, maxLength: 10, description: 'Image width in pixels' },
  'og:image:height': { required: false, maxLength: 10, description: 'Image height in pixels' },
  'og:image:alt': { required: false, maxLength: 420, description: 'Alt text for the image' },
};

const TWITTER_TAGS = {
  'twitter:card': { required: true, maxLength: 20, description: 'Card type (summary, summary_large_image, etc.)' },
  'twitter:title': { required: false, maxLength: 70, description: 'Title for Twitter cards' },
  'twitter:description': { required: false, maxLength: 200, description: 'Description for Twitter cards' },
  'twitter:image': { required: false, maxLength: 2048, description: 'Image URL for Twitter cards' },
  'twitter:site': { required: false, maxLength: 15, description: 'Twitter username of website' },
  'twitter:creator': { required: false, maxLength: 15, description: 'Twitter username of content creator' },
  'twitter:image:alt': { required: false, maxLength: 420, description: 'Alt text for Twitter image' },
};

interface TagValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100
}

function validateTag(key: string, value: string, tagConfig: any): TagValidation {
  const validation: TagValidation = {
    valid: true,
    errors: [],
    warnings: [],
    score: 100
  };

  // Check if required
  if (tagConfig.required && (!value || value.trim() === '')) {
    validation.errors.push('This tag is required');
    validation.score -= 50;
  }

  // Check length limits
  if (value && value.length > tagConfig.maxLength) {
    validation.warnings.push(`Exceeds recommended length of ${tagConfig.maxLength} characters`);
    validation.score -= 10;
  }

  // Specific validations
  if (key === 'og:image' || key === 'twitter:image') {
    if (value && !isValidUrl(value)) {
      validation.errors.push('Invalid image URL format');
      validation.score -= 20;
    }
  }

  if (key === 'og:url') {
    if (value && !isValidUrl(value)) {
      validation.errors.push('Invalid URL format');
      validation.score -= 20;
    }
  }

  if (key === 'twitter:site' || key === 'twitter:creator') {
    if (value && !value.startsWith('@')) {
      validation.warnings.push('Twitter handles should start with @');
      validation.score -= 5;
    }
  }

  if (key === 'og:image:width' || key === 'og:image:height') {
    if (value && !/^\d+$/.test(value)) {
      validation.errors.push('Must be a valid number');
      validation.score -= 15;
    }
  }

  validation.valid = validation.errors.length === 0;
  validation.score = Math.max(0, validation.score);

  return validation;
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function generateSocialPreview(found: Record<string, string>) {
  const preview = {
    title: found['og:title'] || found['twitter:title'] || 'No title found',
    description: found['og:description'] || found['twitter:description'] || 'No description found',
    image: found['og:image'] || found['twitter:image'] || null,
    siteName: found['og:site_name'] || null,
    url: found['og:url'] || null,
    cardType: found['twitter:card'] || 'summary',
  };

  // Truncate for preview
  if (preview.title.length > 60) {
    preview.title = preview.title.substring(0, 57) + '...';
  }
  if (preview.description.length > 160) {
    preview.description = preview.description.substring(0, 157) + '...';
  }

  return preview;
}

function generateRecommendations(found: Record<string, string>, missingOg: string[], missingTwitter: string[]): string[] {
  const recommendations: string[] = [];

  // Missing critical tags
  if (missingOg.includes('og:title')) {
    recommendations.push('Add og:title - this is critical for social sharing');
  }
  if (missingOg.includes('og:description')) {
    recommendations.push('Add og:description - helps with click-through rates');
  }
  if (missingOg.includes('og:image')) {
    recommendations.push('Add og:image - visual content increases engagement');
  }
  if (missingTwitter.includes('twitter:card')) {
    recommendations.push('Add twitter:card to control how your content appears on Twitter');
  }

  // Image recommendations
  if (found['og:image'] && !found['og:image:width']) {
    recommendations.push('Add og:image:width and og:image:height for better performance');
  }
  if (found['og:image'] && !found['og:image:alt']) {
    recommendations.push('Add og:image:alt for accessibility');
  }

  // Content optimization
  if (found['og:title'] && found['og:title'].length > 50) {
    recommendations.push('Consider shortening og:title (optimal: 50-60 characters)');
  }
  if (found['og:description'] && found['og:description'].length > 140) {
    recommendations.push('Consider shortening og:description (optimal: 120-160 characters)');
  }

  // Twitter-specific
  if (found['twitter:site'] && !found['twitter:site'].startsWith('@')) {
    recommendations.push('Twitter handles should start with @ (e.g., @yourbrand)');
  }

  // Best practices
  if (!found['og:site_name']) {
    recommendations.push('Add og:site_name to reinforce your brand');
  }
  if (!found['og:locale']) {
    recommendations.push('Add og:locale for international SEO');
  }

  return recommendations;
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

    const html = await response.text();

    // Parse meta tags
    const metaTagRegex = /<meta[^>]+(property|name)=["']([^"']+)["'][^>]*content=["']([^"']*)["'][^>]*>/gi;
    let match;
    const found: Record<string, string> = {};
    const validations: Record<string, TagValidation> = {};

    while ((match = metaTagRegex.exec(html)) !== null) {
      const key = match[2].toLowerCase();
      const value = match[3];
      
      if ((OG_TAGS as any)[key] || (TWITTER_TAGS as any)[key]) {
        found[key] = value;
        const tagConfig = (OG_TAGS as any)[key] || (TWITTER_TAGS as any)[key];
        validations[key] = validateTag(key, value, tagConfig);
      }
    }

    // Check for missing tags
    const missingOg = Object.keys(OG_TAGS).filter(tag => !(tag in found));
    const missingTwitter = Object.keys(TWITTER_TAGS).filter(tag => !(tag in found));

    // Calculate overall score
    const totalTags = Object.keys(OG_TAGS).length + Object.keys(TWITTER_TAGS).length;
    const foundTags = Object.keys(found).length;
    const validationScores = Object.values(validations).map(v => v.score);
    const averageScore = validationScores.length > 0 ? validationScores.reduce((a, b) => a + b, 0) / validationScores.length : 0;
    const overallScore = Math.round((foundTags / totalTags) * 60 + averageScore * 0.4);

    // Generate recommendations
    const recommendations = generateRecommendations(found, missingOg, missingTwitter);

    // Generate social preview
    const socialPreview = generateSocialPreview(found);

    // Check for duplicates
    const duplicates: string[] = [];
    const seen = new Set<string>();
    Object.keys(found).forEach(key => {
      if (seen.has(key)) {
        duplicates.push(key);
      } else {
        seen.add(key);
      }
    });

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      found,
      validations,
      missingOg,
      missingTwitter,
      recommendations,
      socialPreview,
      overallScore,
      duplicates,
      stats: {
        totalTags,
        foundTags,
        missingTags: missingOg.length + missingTwitter.length,
        criticalMissing: missingOg.filter(tag => (OG_TAGS as any)[tag]?.required).length + 
                        missingTwitter.filter(tag => (TWITTER_TAGS as any)[tag]?.required).length
      }
    });

  } catch (err: any) {
    console.error('OpenGraph Checker API error:', err);
    return NextResponse.json({ error: 'Failed to fetch or parse.' }, { status: 500 });
  }
} 