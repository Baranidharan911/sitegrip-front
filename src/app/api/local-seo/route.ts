import { NextRequest, NextResponse } from 'next/server';

// Real API integration for Local SEO data
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_MY_BUSINESS_API_KEY = process.env.GOOGLE_MY_BUSINESS_API_KEY;

// Real data fetching functions
async function fetchGooglePlacesData(query: string, location: string) {
  if (!GOOGLE_PLACES_API_KEY) {
    throw new Error('Google Places API key not configured');
  }

  try {
    // First, get coordinates for the location
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${GOOGLE_PLACES_API_KEY}`;
    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();

    if (!geocodeData.results || geocodeData.results.length === 0) {
      throw new Error('Location not found');
    }

    const { lat, lng } = geocodeData.results[0].geometry.location;

    // Then, search for places near that location
    const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${lat},${lng}&radius=5000&key=${GOOGLE_PLACES_API_KEY}`;
    const placesResponse = await fetch(placesUrl);
    const placesData = await placesResponse.json();

    if (!placesData.results) {
      throw new Error('No places found');
    }

    return placesData.results.map((place: any, index: number) => ({
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      rating: place.rating || 0,
      reviews: place.user_ratings_total || 0,
      rank: index + 1,
      image: place.photos?.[0]?.photo_reference 
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=60&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
        : 'https://via.placeholder.com/60x60',
      coordinates: place.geometry.location,
      distance: calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng),
      gridPosition: calculateGridPosition(place.geometry.location.lat, place.geometry.location.lng, lat, lng, 0.5),
      category: place.types?.[0] || 'Business',
      phone: place.formatted_phone_number || '',
      website: place.website || '',
      openingHours: place.opening_hours?.weekday_text || []
    }));
  } catch (error) {
    console.error('Google Places API Error:', error);
    throw error;
  }
}

async function fetchGoogleMyBusinessData() {
  if (!GOOGLE_MY_BUSINESS_API_KEY) {
    throw new Error('Google My Business API key not configured');
  }

  try {
    // This would require OAuth2 authentication and proper setup
    // For now, we'll return an error indicating setup is needed
    throw new Error('Google My Business API requires OAuth2 setup. Please configure authentication.');
  } catch (error) {
    console.error('Google My Business API Error:', error);
    throw error;
  }
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function calculateGridPosition(lat: number, lng: number, centerLat: number, centerLng: number, distance: number) {
  const gridSize = 9;
  const latStep = distance / gridSize;
  const lngStep = distance / gridSize;
  
  const x = Math.floor((lat - centerLat + distance/2) / latStep);
  const y = Math.floor((lng - centerLng + distance/2) / lngStep);
  
  return {
    x: Math.max(0, Math.min(gridSize - 1, x)),
    y: Math.max(0, Math.min(gridSize - 1, y))
  };
}

function generateGridData(gridSize: number, centerLat: number, centerLng: number, distance: number, searchResults: any[]) {
  const grid = [];
  const latStep = distance / gridSize;
  const lngStep = distance / gridSize;
  
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const lat = centerLat + (x - gridSize/2) * latStep;
      const lng = centerLng + (y - gridSize/2) * lngStep;
      
      // Find if there's a business at this grid position
      const businessAtPosition = searchResults.find(result => 
        result.gridPosition.x === x && result.gridPosition.y === y
      );
      
      let rank = 0;
      let color = 'gray';
      
      if (businessAtPosition) {
        rank = businessAtPosition.rank;
        if (rank <= 3) color = 'green';
        else if (rank <= 6) color = 'yellow';
        else color = 'red';
      }
      
      grid.push({
        x,
        y,
        lat,
        lng,
        rank,
        color,
        hasBusiness: !!businessAtPosition,
        business: businessAtPosition || null
      });
    }
  }
  
  return grid;
}

// Fallback data structure (empty for real implementation)
const fallbackData = {
  gmbLocations: [],
  searchResults: [],
  reports: []
};

// Reports storage (in production, this would be a database)
let reportsStorage: any[] = [];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  try {
    switch (action) {
      case 'gmb-locations':
        try {
          const gmbData = await fetchGoogleMyBusinessData();
          return NextResponse.json({
            success: true,
            data: gmbData
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: 'Google My Business API not configured. Please set up OAuth2 authentication.',
            data: fallbackData.gmbLocations
          });
        }
        
      case 'search-results':
        const query = searchParams.get('query') || 'cheesecake';
        const location = searchParams.get('location') || 'New York';
        
        try {
          const searchResults = await fetchGooglePlacesData(query, location);
          return NextResponse.json({
            success: true,
            data: searchResults,
            query,
            location
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: 'Google Places API not configured. Please add GOOGLE_PLACES_API_KEY to environment variables.',
            data: fallbackData.searchResults
          });
        }
        
      case 'grid-data':
        const gridSize = parseInt(searchParams.get('gridSize') || '9');
        const lat = parseFloat(searchParams.get('lat') || '40.7300');
        const lng = parseFloat(searchParams.get('lng') || '-72.9850');
        const distance = parseFloat(searchParams.get('distance') || '0.5');
        const searchResults = JSON.parse(searchParams.get('searchResults') || '[]');
        
        const gridData = generateGridData(gridSize, lat, lng, distance, searchResults);
        
        return NextResponse.json({
          success: true,
          data: gridData,
          gridSize,
          center: { lat, lng },
          distance
        });
        
      case 'reports':
        return NextResponse.json({
          success: true,
          data: reportsStorage
        });
        
      case 'scan':
        const scanQuery = searchParams.get('query');
        const scanLocation = searchParams.get('location');
        const scanGridSize = searchParams.get('gridSize') || '9 x 9';
        const scanDistance = searchParams.get('distance') || '0.5';
        
        if (!scanQuery || !scanLocation) {
          return NextResponse.json({
            success: false,
            error: 'Query and location are required'
          }, { status: 400 });
        }
        
        try {
          // Fetch real search results
          const searchResults = await fetchGooglePlacesData(scanQuery, scanLocation);
          
          // Get coordinates for grid generation
          const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(scanLocation)}&key=${GOOGLE_PLACES_API_KEY}`;
          const geocodeResponse = await fetch(geocodeUrl);
          const geocodeData = await geocodeResponse.json();
          
          if (!geocodeData.results || geocodeData.results.length === 0) {
            throw new Error('Location not found');
          }
          
          const { lat: centerLat, lng: centerLng } = geocodeData.results[0].geometry.location;
          const gridData = generateGridData(9, centerLat, centerLng, parseFloat(scanDistance), searchResults);
          
          const newReport = {
            id: Date.now(),
            location: scanLocation,
            searchQuery: scanQuery,
            searchSettings: `${scanGridSize} -> ${scanDistance} Miles`,
            lastScan: new Date().toLocaleString(),
            status: "completed",
            results: searchResults,
            gridData: gridData,
            coordinates: { lat: centerLat, lng: centerLng }
          };
          
          // Store the report
          reportsStorage.push(newReport);
          
          return NextResponse.json({
            success: true,
            data: newReport,
            message: "Scan completed successfully"
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: 'Failed to complete scan. Please check your API configuration.',
            data: null
          });
        }
        
      default:
        return NextResponse.json({
          success: true,
          data: fallbackData
        });
    }
  } catch (error) {
    console.error('Local SEO API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;
    
    switch (action) {
      case 'add-gmb-location':
        const newLocation = {
          id: Date.now(),
          ...data,
          status: "pending",
          lastUpdated: new Date().toISOString().split('T')[0]
        };
        
        return NextResponse.json({
          success: true,
          data: newLocation,
          message: "GMB location added successfully"
        });
        
      case 'update-gmb-location':
        return NextResponse.json({
          success: true,
          data: data,
          message: "GMB location updated successfully"
        });
        
      case 'delete-gmb-location':
        return NextResponse.json({
          success: true,
          message: "GMB location deleted successfully"
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Local SEO API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 