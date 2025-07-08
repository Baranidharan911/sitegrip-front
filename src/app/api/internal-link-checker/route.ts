import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 0;

function isInternalLink(href: string, base: string) {
  try {
    const url = new URL(href, base);
    return url.hostname === new URL(base).hostname;
  } catch {
    return false;
  }
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
    const linkRegex = /<a\s+[^>]*href=["']([^"'#?]+)["'][^>]*>/gi;
    const links: string[] = [];
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      if (isInternalLink(match[1], url)) {
        links.push(new URL(match[1], url).href);
      }
    }
    const uniqueLinks = Array.from(new Set(links));
    const brokenLinks: { url: string; status: number }[] = [];
    for (const link of uniqueLinks) {
      try {
        const res = await fetch(link, { method: 'HEAD' });
        if (res.status >= 400) {
          brokenLinks.push({ url: link, status: res.status });
        }
      } catch {
        brokenLinks.push({ url: link, status: 0 });
      }
    }
    const issues = [];
    const recommendations = [];
    if (uniqueLinks.length === 0) {
      issues.push('No internal links found.');
      recommendations.push('Add internal links to improve site structure and SEO.');
    }
    if (brokenLinks.length > 0) {
      issues.push(`${brokenLinks.length} broken internal link(s) found.`);
      recommendations.push('Fix or remove broken internal links.');
    }
    if (uniqueLinks.length > 100) {
      issues.push('Too many internal links on a single page.');
      recommendations.push('Limit the number of internal links to improve crawlability.');
    }
    return NextResponse.json({
      url,
      totalLinks: links.length,
      uniqueLinks: uniqueLinks.length,
      brokenLinks,
      issues,
      recommendations,
      links: uniqueLinks
    });
  } catch (err: any) {
    console.error('Internal Link Checker API error:', err);
    return NextResponse.json({ error: 'Failed to check internal links.' }, { status: 500 });
  }
} 