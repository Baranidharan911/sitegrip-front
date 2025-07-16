# Local SEO API Setup Guide

This guide will help you set up the real API integration for the Local SEO Dashboard, replacing mock data with actual Google Places and Google My Business data.

## Prerequisites

1. Google Cloud Platform account
2. Google Places API enabled
3. Google My Business API enabled (optional, for GMB data)

## Step 1: Google Cloud Platform Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Places API
   - Geocoding API
   - Google My Business API (optional)

## Step 2: API Keys Setup

### Google Places API Key

1. In Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key
4. Add it to your environment variables:

```bash
# .env.local
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
```

### Google My Business API (Optional)

For Google My Business data, you'll need OAuth2 setup:

1. Create OAuth 2.0 credentials in Google Cloud Console
2. Download the client configuration file
3. Set up OAuth2 flow for user authentication
4. Add the credentials to environment variables:

```bash
# .env.local
GOOGLE_MY_BUSINESS_CLIENT_ID=your_client_id
GOOGLE_MY_BUSINESS_CLIENT_SECRET=your_client_secret
GOOGLE_MY_BUSINESS_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

## Step 3: API Usage Limits

### Google Places API
- **Free tier**: 1,000 requests per day
- **Paid tier**: $17 per 1,000 requests
- **Rate limit**: 10 requests per second

### Google My Business API
- **Free tier**: 1,000 requests per day
- **Rate limit**: 10 requests per second

## Step 4: Environment Variables

Add these to your `.env.local` file:

```bash
# Google APIs
GOOGLE_PLACES_API_KEY=your_places_api_key
GOOGLE_MY_BUSINESS_CLIENT_ID=your_client_id
GOOGLE_MY_BUSINESS_CLIENT_SECRET=your_client_secret
GOOGLE_MY_BUSINESS_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Optional: API usage tracking
GOOGLE_API_QUOTA_LIMIT=1000
GOOGLE_API_QUOTA_RESET_TIME=24h
```

## Step 5: API Endpoints

The Local SEO API provides the following endpoints:

### GET /api/local-seo

**Parameters:**
- `action`: The type of data to fetch
  - `gmb-locations`: Google My Business locations
  - `search-results`: Places search results
  - `grid-data`: Grid visualization data
  - `reports`: Scan reports
  - `scan`: Run a new scan

**Examples:**

```bash
# Get GMB locations
GET /api/local-seo?action=gmb-locations

# Search for places
GET /api/local-seo?action=search-results&query=pizza&location=New York

# Get grid data
GET /api/local-seo?action=grid-data&gridSize=9&lat=40.7300&lng=-72.9850&distance=0.5

# Run a scan
GET /api/local-seo?action=scan&query=cheesecake&location=New York&gridSize=9 x 9&distance=0.5
```

## Step 6: Error Handling

The API returns structured error responses:

```json
{
  "success": false,
  "error": "Error message",
  "data": [] // Fallback data if available
}
```

Common errors:
- `Google Places API key not configured`
- `Google My Business API requires OAuth2 setup`
- `Location not found`
- `No places found`
- `Query and location are required`

## Step 7: Testing

1. Start your development server:
```bash
npm run dev
```

2. Navigate to `/seo-tools/local-seo-dashboard`

3. Test the functionality:
   - Enter a search query (e.g., "pizza")
   - Enter a location (e.g., "New York")
   - Click "Run Scan"

4. Check the browser console and network tab for API responses

## Step 8: Production Deployment

### Vercel
1. Add environment variables in Vercel dashboard
2. Deploy your application
3. Update redirect URIs for production domain

### Other Platforms
1. Set environment variables in your hosting platform
2. Update OAuth redirect URIs for production domain
3. Ensure HTTPS is enabled for OAuth flows

## Step 9: Monitoring and Analytics

### API Usage Monitoring
- Monitor API quota usage in Google Cloud Console
- Set up alerts for quota limits
- Track request patterns and optimize usage

### Error Monitoring
- Monitor API error rates
- Set up alerts for failed requests
- Log API responses for debugging

## Step 10: Cost Optimization

### Google Places API
- Cache results when possible
- Use specific queries to reduce results
- Implement pagination for large result sets

### Google My Business API
- Cache GMB data locally
- Only refresh data when necessary
- Use batch requests when possible

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify the API key is correct
   - Check if the API is enabled
   - Ensure billing is set up

2. **CORS Issues**
   - Add your domain to allowed origins
   - Check browser console for CORS errors

3. **Rate Limiting**
   - Implement request throttling
   - Add retry logic with exponential backoff
   - Monitor API usage

4. **OAuth Issues**
   - Verify redirect URIs match exactly
   - Check client ID and secret
   - Ensure HTTPS in production

### Debug Mode

Enable debug logging by adding:

```bash
# .env.local
DEBUG_LOCAL_SEO=true
```

This will log API requests and responses to the console.

## Support

For issues with:
- **Google Places API**: Check [Google Places API documentation](https://developers.google.com/maps/documentation/places/web-service)
- **Google My Business API**: Check [Google My Business API documentation](https://developers.google.com/my-business)
- **Application Issues**: Check the browser console and server logs

## Security Notes

1. Never expose API keys in client-side code
2. Use environment variables for all sensitive data
3. Implement proper CORS policies
4. Validate and sanitize all user inputs
5. Use HTTPS in production
6. Monitor API usage for unusual patterns 