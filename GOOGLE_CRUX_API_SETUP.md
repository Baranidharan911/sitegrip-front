# Google Chrome User Experience Report (CrUX) API Setup

This guide will help you set up the Google CrUX API to get real user performance data in your SiteGrip Chrome User Experience Report feature.

## What is CrUX?

The Chrome User Experience Report (CrUX) is a public dataset of real user performance data for millions of websites. It provides insights into how real users experience your website's performance.

## Setup Steps

### 1. Get a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for your project (required for API access)

### 2. Enable the CrUX API

1. In your Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Chrome UX Report API"
3. Click on it and press "Enable"

### 3. Create API Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. (Optional) Restrict the API key to only the CrUX API for security

### 4. Add API Key to Environment Variables

Add your API key to your `.env.local` file:

```bash
GOOGLE_CRUX_API_KEY=your_api_key_here
```

### 5. Deploy with Environment Variable

If deploying to Vercel, add the environment variable in your Vercel dashboard:

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add `GOOGLE_CRUX_API_KEY` with your API key value

## API Usage

The CrUX API provides:
- **Real user data** from Chrome users worldwide
- **Core Web Vitals** metrics (LCP, FID, CLS, INP)
- **Performance distributions** showing how users experience your site
- **Historical data** for trend analysis

## Data Availability

Not all websites have CrUX data available. Data is only available for:
- Websites with sufficient traffic
- Sites that Chrome users visit regularly
- URLs that have been crawled by Google

## Fallback Behavior

If real CrUX data is not available for a URL, the system will:
1. Show a warning message
2. Display sample data for demonstration
3. Clearly indicate that it's sample data

## Cost

The CrUX API is **free** with reasonable usage limits:
- 1,000 requests per day
- 10,000 requests per 100 seconds

## Testing

To test if your API key is working:

1. Start your development server
2. Go to `/chrome-user-experience-report`
3. Enter a popular website URL (e.g., `https://www.google.com`)
4. Click "Analyze"

If you see real data, your setup is working correctly!

## Troubleshooting

### "API key not configured" error
- Check that `GOOGLE_CRUX_API_KEY` is set in your environment variables
- Restart your development server after adding the environment variable

### "No data available" for a URL
- The website may not have sufficient traffic for CrUX data
- Try a more popular website to test
- The API will show sample data as a fallback

### API quota exceeded
- Check your Google Cloud Console for usage statistics
- Consider implementing caching for frequently requested URLs

## Security Notes

- Keep your API key secure and never commit it to version control
- Use environment variables for all API keys
- Consider restricting your API key to specific domains/IPs in production

## Support

For API issues, check:
- [Google CrUX API Documentation](https://developers.google.com/web/tools/chrome-user-experience-report/api/reference)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Chrome UX Report](https://web.dev/chrome-ux-report/) 