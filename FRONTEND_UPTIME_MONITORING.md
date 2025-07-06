# Frontend-Only Uptime Monitoring System

## Overview

This is a fully frontend-based uptime monitoring system designed for MVP demos. It provides real-time website monitoring without requiring any backend infrastructure. All data is stored locally in the browser using localStorage, and monitoring checks are performed using browser APIs.

## Features

### 🚀 Real-time Monitoring
- **Automatic Checks**: Monitors are checked automatically based on their configured intervals
- **Real-time Updates**: Status changes are reflected immediately in the UI
- **Background Processing**: Monitoring runs in the background even when the tab is not active
- **Event-driven Architecture**: Uses a custom event system for real-time updates

### 📊 Comprehensive Monitoring
- **HTTP/HTTPS Monitoring**: Check website availability and response times
- **SSL Certificate Validation**: Monitor SSL certificate expiration and validity
- **Response Time Tracking**: Track and analyze response times
- **Uptime Statistics**: Calculate uptime percentages for different time periods
- **Incident Management**: Track and manage downtime incidents

### 🎯 Demo-Ready Features
- **Pre-populated Data**: Comes with 10 popular website monitors for immediate demo
- **Local Storage**: All data persists in the browser
- **No Backend Required**: Works entirely in the frontend
- **Real-time Status**: Live status indicators and statistics

## Architecture

### Core Components

1. **FrontendUptimeApi** (`src/lib/frontendUptimeApi.ts`)
   - Handles all CRUD operations for monitors
   - Performs HTTP checks using browser APIs
   - Manages localStorage data persistence
   - Simulates SSL certificate validation

2. **RealtimeMonitoringService** (`src/lib/realtimeMonitoring.ts`)
   - Background monitoring service
   - Event-driven architecture
   - Queue-based processing
   - Automatic interval management

3. **useFrontendUptime Hook** (`src/hooks/useFrontendUptime.ts`)
   - React hook for state management
   - Real-time event listeners
   - Automatic data synchronization
   - Error handling and loading states

4. **Demo Data** (`src/lib/demoData.ts`)
   - Pre-configured monitors for popular websites
   - Automatic initialization
   - Demo statistics

### Data Flow

```
User Action → Hook → FrontendUptimeApi → localStorage
                ↓
RealtimeMonitoringService → Event System → UI Update
```

## Usage

### Starting the System

The monitoring system starts automatically when the uptime page loads:

```typescript
// Automatically initializes demo data and starts monitoring
useEffect(() => {
  initializeDemoData();
}, []);
```

### Adding a Monitor

```typescript
const { createMonitor } = useFrontendUptime();

const newMonitor = await createMonitor({
  name: 'My Website',
  url: 'https://example.com',
  interval: 60, // Check every 60 seconds
  timeout: 10,  // 10 second timeout
  retries: 3,   // Retry 3 times on failure
});
```

### Real-time Updates

The system automatically updates the UI when:
- Monitor status changes (up/down)
- New check results are available
- Incidents are created or resolved
- SSL certificate status changes

## Demo Data

The system comes pre-configured with monitors for:

1. **Google Search** - `https://www.google.com`
2. **GitHub** - `https://github.com`
3. **Stack Overflow** - `https://stackoverflow.com`
4. **Netflix** - `https://www.netflix.com`
5. **Spotify** - `https://open.spotify.com`
6. **Twitter** - `https://twitter.com`
7. **Reddit** - `https://www.reddit.com`
8. **YouTube** - `https://www.youtube.com`
9. **Amazon** - `https://www.amazon.com`
10. **Microsoft** - `https://www.microsoft.com`

## Technical Details

### Storage
- **localStorage Keys**:
  - `webwatch_uptime_monitors` - Monitor configurations
  - `webwatch_uptime_checks` - Check history
  - `webwatch_uptime_incidents` - Incident history
  - `webwatch_uptime_stats` - Statistics data

### Monitoring Intervals
- **Default**: 30 seconds for the monitoring cycle
- **Configurable**: Per monitor (30 seconds to 24 hours)
- **Batch Processing**: Up to 5 monitors checked simultaneously
- **Queue Management**: Prevents overwhelming the network

### HTTP Checks
- **Method**: HEAD requests for efficiency
- **CORS Proxy**: Uses `api.allorigins.win` for cross-origin requests
- **Timeout**: Configurable per monitor
- **Retries**: Automatic retry on failure
- **Response Time**: Measured in milliseconds

### SSL Validation
- **Simulated**: For demo purposes (real implementation would need backend)
- **Expiration Tracking**: Days until certificate expires
- **Status Categories**: Valid, expiring soon, expired, invalid

## Limitations

### Frontend Constraints
1. **CORS Limitations**: Cannot directly check many external sites
2. **SSL Certificate Validation**: Limited to basic checks
3. **Network Restrictions**: Some sites may block automated requests
4. **Browser Limitations**: Cannot run 24/7 monitoring

### Demo Considerations
1. **Data Persistence**: Data is lost when browser storage is cleared
2. **No Notifications**: Email/SMS notifications not implemented
3. **Limited History**: Check history is limited to recent entries
4. **Single User**: No multi-user support

## Future Enhancements

### Backend Integration
- Real server-side monitoring
- Database persistence
- Email/SMS notifications
- Advanced SSL validation
- Multi-user support

### Advanced Features
- Custom monitoring scripts
- API endpoint monitoring
- Database monitoring
- Custom alert conditions
- Status page generation
- API integrations (Slack, Discord, etc.)

## Development

### Adding New Monitor Types
1. Extend the `MonitorType` interface
2. Add check logic in `FrontendUptimeApi`
3. Update the monitoring service
4. Add UI components for configuration

### Customizing Check Logic
1. Modify `performHttpCheck` method
2. Add new validation rules
3. Implement custom response parsing
4. Add new status types

### Extending Storage
1. Add new localStorage keys
2. Update data structures
3. Implement migration logic
4. Add data export/import

## Troubleshooting

### Common Issues

1. **Monitors not updating**
   - Check browser console for errors
   - Verify real-time monitoring service is running
   - Check localStorage for data corruption

2. **CORS errors**
   - Some sites block automated requests
   - Try different URLs or monitoring intervals
   - Check network connectivity

3. **Performance issues**
   - Reduce monitoring frequency
   - Limit number of active monitors
   - Check browser memory usage

### Debug Mode

Enable debug logging by checking the browser console:
- Monitor creation/deletion
- Check results and timing
- Event system activity
- Storage operations

## Conclusion

This frontend-only uptime monitoring system provides a complete MVP solution for website monitoring without requiring any backend infrastructure. It's perfect for demos, prototypes, and small-scale monitoring needs. The real-time capabilities and comprehensive feature set make it suitable for showcasing monitoring concepts and gathering user feedback. 