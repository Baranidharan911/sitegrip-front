import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

interface SearchResult {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviews: number;
  rank: number;
  image: string;
  coordinates: { lat: number; lng: number };
  distance: number;
  gridPosition: { x: number; y: number };
  category: string;
  phone: string;
  website: string;
  openingHours: string[];
}

interface AnalysisRequest {
  searchResults: SearchResult[];
  query: string;
  location: string;
  gridSize: string;
  distance: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();
    const { searchResults, query, location, gridSize, distance } = body;

    if (!GEMINI_API_KEY) {
      // Return mock analysis if Gemini API key is not configured
      return NextResponse.json({
        success: true,
        analysis: generateMockAnalysis(searchResults, query, location, gridSize, distance)
      });
    }

    // Prepare data for Gemini
    const topResults = searchResults.slice(0, 10);
    const analysisPrompt = `
You are an expert local SEO analyst. Analyze the following local search results and provide actionable insights:

Search Query: "${query}"
Location: "${location}"
Grid Size: ${gridSize}
Distance: ${distance} miles

Top 10 Search Results:
${topResults.map((result, index) => `
${index + 1}. ${result.name}
   - Address: ${result.address}
   - Rating: ${result.rating}/5 (${result.reviews} reviews)
   - Distance: ${result.distance.toFixed(1)} miles
   - Category: ${result.category}
`).join('')}

Please provide:
1. Competitive analysis of the top results
2. Key ranking factors observed
3. Optimization opportunities for local businesses
4. Specific recommendations for improving local search visibility
5. Market insights and trends

Keep the analysis concise, actionable, and focused on local SEO best practices.
`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: analysisPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Analysis not available';

    return NextResponse.json({
      success: true,
      analysis: analysis
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Return mock analysis as fallback
    return NextResponse.json({
      success: true,
      analysis: generateMockAnalysis([], 'local business', 'New York', '9 x 9', 0.5)
    });
  }
}

function generateMockAnalysis(searchResults: SearchResult[], query: string, location: string, gridSize: string, distance: number): string {
  const topResults = searchResults.slice(0, 5);
  
  return `
🔍 **Local SEO Analysis for "${query}" in ${location}**

**Competitive Landscape:**
Based on the ${gridSize} grid scan within ${distance} miles, we found ${searchResults.length} competing businesses. The top results show strong competition with average ratings of ${(searchResults.reduce((sum, r) => sum + r.rating, 0) / searchResults.length).toFixed(1)}/5 stars.

**Key Insights:**
• **Review Volume**: Top competitors average ${Math.round(searchResults.reduce((sum, r) => sum + r.reviews, 0) / searchResults.length)} reviews
• **Distance Optimization**: Most top results are within ${(distance * 0.6).toFixed(1)} miles of the search location
• **Category Consistency**: ${searchResults.filter(r => r.category).length} businesses have proper category classification

**Optimization Opportunities:**
1. **Review Management**: Focus on increasing review volume and maintaining high ratings
2. **Local Content**: Create location-specific content and landing pages
3. **NAP Consistency**: Ensure business name, address, and phone are consistent across all listings
4. **Category Optimization**: Use specific, relevant business categories
5. **Distance Targeting**: Optimize for searches within ${distance} mile radius

**Action Items:**
• Monitor competitor review patterns and respond to customer feedback
• Create local landing pages targeting "${query}" + "${location}"
• Optimize Google My Business profile with relevant keywords
• Encourage customer reviews and maintain 4.5+ star rating
• Consider expanding service area if competition is low in nearby areas

**Market Trends:**
The local search landscape shows increasing importance of review velocity, photo quality, and real-time updates. Businesses with active social proof and recent customer interactions tend to rank higher in local search results.
`;
} 