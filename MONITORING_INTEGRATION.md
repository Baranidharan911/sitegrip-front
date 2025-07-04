# WebWatch Monitoring Integration

## Overview

This document describes the integration of advanced monitoring features into the WebWatch frontend, connecting to the TypeScript backend monitoring system.

## Features Implemented

### 🎯 Core Monitoring Features
- **Real-time Monitor Management** - Create, edit, delete, pause/resume monitors
- **Multiple Monitor Types** - HTTP, Ping, TCP, DNS, SSL, Port monitoring
- **Live Status Updates** - Real-time UP/DOWN status with response times
- **Incident Management** - Track and resolve incidents automatically
- **Performance Analytics** - Response time charts and uptime statistics
- **Uptime Heatmap** - Visual 90-day uptime history
- **Notification Center** - Real-time alerts and notifications

### 🎨 Modern UI Components
- **Responsive Dashboard** - Beautiful, modern design with dark/light themes
- **Interactive Charts** - Real-time performance charts using Recharts
- **Monitor Cards** - Rich monitor information with status indicators
- **Bulk Operations** - Select multiple monitors for batch actions
- **Search & Filtering** - Find monitors by name, URL, or status
- **Real-time Updates** - Auto-refresh every 30 seconds

## Backend Integration

### API Endpoints Used
The frontend connects to these backend endpoints:

```
GET    /api/monitoring/monitors          - List all monitors
POST   /api/monitoring/monitors          - Create new monitor
PUT    /api/monitoring/monitors/:id      - Update monitor
DELETE /api/monitoring/monitors/:id      - Delete monitor
POST   /api/monitoring/monitors/:id/check - Trigger manual check
POST   /api/monitoring/monitors/:id/pause - Pause monitor
POST   /api/monitoring/monitors/:id/resume - Resume monitor

GET    /api/monitoring/incidents         - List incidents
POST   /api/monitoring/incidents/:id/resolve - Resolve incident

GET    /api/monitoring/performance       - Performance data
GET    /api/monitoring/heatmap           - Uptime heatmap data
```

### Data Flow
1. **Real-time Data Fetching** - Frontend polls backend every 30 seconds
2. **State Management** - React hooks manage monitor and incident state
3. **Error Handling** - Graceful fallbacks and user-friendly error messages
4. **Loading States** - Smooth loading indicators during API calls

## Configuration

### Environment Variables
Create a `.env.local` file in the webwatch directory:

```env
# Backend API Configuration (Optional - defaults to hosted backend)
NEXT_PUBLIC_API_URL=https://sitegrip-backend-pu22v4ao5a-uc.a.run.app/api

# App Configuration
NEXT_PUBLIC_APP_NAME=WebWatch
NEXT_PUBLIC_APP_VERSION=2.0.0
```

### API Configuration
The monitoring system uses centralized configuration in `src/lib/config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://sitegrip-backend-pu22v4ao5a-uc.a.run.app/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};
```

## Components Structure

```
src/components/Monitoring/
├── MonitoringDashboard.tsx    # Main dashboard component
├── MonitorCard.tsx            # Individual monitor display
├── MonitorForm.tsx            # Create/edit monitor modal
├── PerformanceChart.tsx       # Real-time performance charts
├── UptimeHeatmap.tsx         # 90-day uptime visualization
├── IncidentTimeline.tsx       # Incident history display
├── NotificationCenter.tsx     # Real-time notifications
├── StatusPage.tsx             # Public status page
├── AlertRules.tsx             # Alert configuration
├── MaintenanceWindow.tsx      # Maintenance scheduling
├── TeamManagement.tsx         # Team member management
└── MonitorStats.tsx           # Statistics display
```

## Usage

### Starting the Frontend
```bash
cd webwatch
npm run dev
```

### Accessing the Monitoring Dashboard
Navigate to: `http://localhost:3000/uptime`

### Key Features
1. **Overview Tab** - Dashboard with metrics and quick actions
2. **Monitors Tab** - Manage all your monitoring endpoints
3. **Incidents Tab** - View and resolve incidents
4. **Performance Tab** - Real-time performance analytics
5. **Status Page Tab** - Public status page configuration
6. **Alert Rules Tab** - Configure notification rules
7. **Maintenance Tab** - Schedule maintenance windows
8. **Team Tab** - Manage team members and permissions

## Real-time Features

### Auto-refresh
- Dashboard refreshes every 30 seconds automatically
- Manual refresh button available
- Real-time status updates without page reload

### Live Notifications
- Browser notifications for critical incidents
- In-app notification center
- Toast notifications for user actions

### Performance Monitoring
- Real-time response time tracking
- Uptime percentage calculations
- Historical performance data
- Trend analysis and alerts

## Error Handling

### Network Errors
- Graceful fallback when backend is unavailable
- User-friendly error messages
- Retry mechanisms for failed requests

### Data Validation
- Input validation on forms
- Type safety with TypeScript
- Error boundaries for component failures

## Future Enhancements

### Planned Features
- **WebSocket Integration** - Real-time push notifications
- **Advanced Analytics** - Custom date ranges and metrics
- **Mobile App** - Native mobile monitoring app
- **API Documentation** - Interactive API docs
- **Custom Dashboards** - User-configurable layouts
- **Advanced Notifications** - Slack, Discord, Telegram integration

### Performance Optimizations
- **Caching** - Redis-based caching for better performance
- **Pagination** - Handle large numbers of monitors
- **Lazy Loading** - Load components on demand
- **Service Workers** - Offline functionality

## Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   - Check if backend is running on correct port
   - Verify API_BASE_URL in environment variables
   - Check network connectivity

2. **Monitors Not Loading**
   - Check browser console for API errors
   - Verify backend monitoring endpoints are working
   - Check authentication if required

3. **Real-time Updates Not Working**
   - Verify auto-refresh is enabled
   - Check if backend is sending correct data format
   - Monitor browser network tab for failed requests

### Debug Mode
Enable debug logging by setting:
```env
NEXT_PUBLIC_DEBUG=true
```

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify backend API endpoints are responding
3. Check network connectivity between frontend and backend
4. Review the configuration files for correct settings

---

**Note**: This monitoring system is designed to work with the TypeScript backend monitoring service. Ensure the backend is properly configured and running before using the frontend features. 