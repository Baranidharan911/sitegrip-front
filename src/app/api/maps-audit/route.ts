import { NextRequest, NextResponse } from 'next/server';

// ============================
// 📍 MAPS AUDIT API ROUTE
// ============================
// Requires: GOOGLE_PLACES_API_KEY in your environment variables
//
// This route accepts a business URL, detects the platform, and fetches real data from Google Maps (using Google Places API).
// For Bing, Apple, Waze, etc., it returns a stub for now.

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

function extractPlaceIdFromGoogleMapsUrl(url: string): string | null {
  // Handles URLs like https://www.google.com/maps/place/.../data=!3m1!4b1!4m5!3m4!1sPLACE_ID!8m2!3d... or short URLs
  const placeIdMatch = url.match(/!1s([a-zA-Z0-9_-]{27})/);
  if (placeIdMatch) return placeIdMatch[1];
  // Try to resolve short URLs or other formats (not implemented here)
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Detect platform
    let platform: 'google' | 'bing' | 'apple' | 'waze' | 'unknown' = 'unknown';
    if (url.includes('google.com/maps')) platform = 'google';
    else if (url.includes('bing.com/maps')) platform = 'bing';
    else if (url.includes('apple.com/maps')) platform = 'apple';
    else if (url.includes('waze.com')) platform = 'waze';

    if (platform === 'google') {
      if (!GOOGLE_PLACES_API_KEY) {
        return NextResponse.json({ error: 'Google Places API key not configured' }, { status: 500 });
      }
      // Try to extract place_id from URL
      let placeId = extractPlaceIdFromGoogleMapsUrl(url);
      let placeData = null;
      if (!placeId) {
        // If not found, use Place Search API to resolve from text
        const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(url)}&inputtype=textquery&key=${GOOGLE_PLACES_API_KEY}`;
        const searchRes = await fetch(searchUrl);
        const searchJson = await searchRes.json();
        placeId = searchJson.candidates?.[0]?.place_id;
      }
      if (placeId) {
        // Fetch place details
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,international_phone_number,website,geometry,review,user_ratings_total,photos,types,url&key=${GOOGLE_PLACES_API_KEY}`;
        const detailsRes = await fetch(detailsUrl);
        placeData = await detailsRes.json();
      }
      return NextResponse.json({ platform, placeId, placeData });
    }

    // Stub for other platforms
    return NextResponse.json({
      platform,
      message: 'Support for this platform is coming soon.',
      data: null
    });
  } catch (error) {
    console.error('Maps Audit API error:', error);
    return NextResponse.json({ error: 'Failed to fetch business data.' }, { status: 500 });
  }
} 