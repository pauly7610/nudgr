# Monitoring Guide

Complete guide to monitoring, error tracking, and analytics in the Friction Analytics Platform.

## Table of Contents

- [Overview](#overview)
- [Error Tracking](#error-tracking)
- [Performance Monitoring](#performance-monitoring)
- [Analytics Events](#analytics-events)
- [Monitoring Dashboard](#monitoring-dashboard)
- [Alerts](#alerts)
- [Best Practices](#best-practices)

## Overview

The platform includes comprehensive monitoring capabilities:

- **Error Tracking**: Automatic logging of errors with context
- **Performance Monitoring**: Real-time performance metrics (Core Web Vitals)
- **Analytics Events**: Track user behavior and feature usage
- **Centralized Dashboard**: View all monitoring data in one place

## Error Tracking

### Automatic Error Tracking

Errors are automatically tracked when they occur:

```typescript
// Uncaught errors are automatically logged
throw new Error('Something went wrong');

// Unhandled promise rejections are caught
Promise.reject('Failed to load data');
```

### Manual Error Logging

Use the error tracker to manually log errors:

```typescript
import { errorTracker } from '@/lib/errorTracker';

// Log an exception
try {
  // your code
} catch (error) {
  errorTracker.captureException(
    error as Error,
    'ComponentName',
    'high' // severity: low, medium, high, critical
  );
}

// Log a message
errorTracker.captureMessage(
  'User attempted unauthorized action',
  'medium',
  { userId: '123', action: 'delete' }
);
```

### Error Severity Levels

- **low**: Minor issues that don't affect functionality
- **medium**: Issues that impact user experience but have workarounds
- **high**: Serious issues that prevent feature usage
- **critical**: App-breaking issues requiring immediate attention

### Error Properties

Each error log includes:

```typescript
{
  id: UUID
  user_id: UUID | null
  error_type: string // Error name/type
  error_message: string
  error_stack: string | null // Stack trace
  component_name: string | null
  page_url: string
  user_agent: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  metadata: object // Additional context
  resolved: boolean
  created_at: timestamp
}
```

## Performance Monitoring

### Automatic Metrics

The platform automatically tracks:

1. **Page Load Performance**
   - Total page load time
   - DOM content loaded time
   - Time to interactive

2. **Core Web Vitals**
   - Largest Contentful Paint (LCP)
   - First Input Delay (FID)
   - Cumulative Layout Shift (CLS)

### Manual Performance Tracking

```typescript
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

const { logMetric, measureRenderTime, measureApiCall } = usePerformanceMonitor();

// Measure component render time
const startTime = performance.now();
// ... render logic
measureRenderTime('MyComponent', startTime);

// Measure API call
const apiStart = Date.now();
const response = await fetch('/api/data');
measureApiCall('fetchData', Date.now() - apiStart, response.ok);

// Log custom metric
logMetric({
  name: 'custom_operation',
  value: 123.45,
  metadata: { operation: 'data_processing' }
});
```

### Performance Thresholds

Recommended thresholds for Core Web Vitals:

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | ≤ 2.5s | 2.5s - 4.0s | > 4.0s |
| FID | ≤ 100ms | 100ms - 300ms | > 300ms |
| CLS | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |

## Analytics Events

### Page Views

Automatically tracked when navigating between pages.

### Custom Events

```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

const { trackEvent, trackClick, trackFeatureUse, trackConversion } = useAnalytics();

// Track custom event
trackEvent({
  eventName: 'search_performed',
  properties: {
    query: 'friction analysis',
    results: 42,
    filters: ['date', 'severity']
  }
});

// Track button click
trackClick('submit_report_button', {
  reportType: 'pdf',
  pages: 10
});

// Track feature usage
trackFeatureUse('ai_analysis', {
  model: 'gemini-2.5-pro',
  duration: 2500
});

// Track conversion
trackConversion('subscription_upgrade', 149);
```

### Event Properties

All events include:

```typescript
{
  id: UUID
  user_id: UUID | null
  event_name: string
  event_properties: object
  page_url: string
  session_id: string
  user_agent: string
  created_at: timestamp
}
```

## Monitoring Dashboard

Access the monitoring dashboard at `/monitoring`.

### Features

1. **Error Statistics**
   - Total errors
   - Critical errors count
   - Unresolved errors
   - Error rate percentage

2. **Recent Error Logs**
   - Last 10 errors with full context
   - Severity badges
   - Timestamp and component info

3. **Performance Charts**
   - Page load time trends
   - Core Web Vitals over time
   - API call duration

4. **Analytics Overview**
   - Event distribution
   - Top events by count
   - User engagement metrics

### Time Ranges

Filter data by:
- Last 1 hour
- Last 24 hours
- Last 7 days
- Last 30 days

## Alerts

### Critical Error Alerts

Errors with `critical` severity trigger immediate notifications:

```typescript
errorTracker.captureException(
  error,
  'PaymentProcessor',
  'critical' // Will alert admins
);
```

### Performance Degradation Alerts

Automatic alerts when:
- Error rate exceeds 5%
- Critical errors detected
- Performance metrics exceed thresholds

### Configuring Alerts

1. Go to **Settings → Alerts**
2. Create new alert rule
3. Set conditions (error rate, severity, etc.)
4. Configure notification channels (email, Slack)

## Best Practices

### Error Handling

1. **Always provide context**
   ```typescript
   errorTracker.captureException(error, 'UserProfile', 'high', {
     userId: user.id,
     operation: 'updateProfile',
     field: 'email'
   });
   ```

2. **Use appropriate severity levels**
   - Don't mark everything as critical
   - Reserve `critical` for app-breaking issues

3. **Include actionable information**
   - What was the user trying to do?
   - What data was involved?
   - What was the expected outcome?

### Performance Monitoring

1. **Monitor key user flows**
   ```typescript
   // Track checkout flow performance
   measureRenderTime('CheckoutFlow', startTime);
   ```

2. **Set performance budgets**
   - Page load < 3 seconds
   - API calls < 500ms
   - Component renders < 100ms

3. **Optimize based on data**
   - Review P95 and P99 metrics
   - Focus on high-traffic pages first
   - Monitor after deployments

### Analytics

1. **Name events consistently**
   ```typescript
   // Good: descriptive, snake_case
   trackEvent({ eventName: 'report_exported' });
   
   // Bad: vague, inconsistent
   trackEvent({ eventName: 'clicked' });
   ```

2. **Include relevant context**
   ```typescript
   trackFeatureUse('ai_analysis', {
     model: 'gemini-2.5-pro',
     tokens: 1500,
     duration_ms: 2500,
     success: true
   });
   ```

3. **Respect user privacy**
   - Don't log PII in event properties
   - Anonymize sensitive data
   - Follow GDPR/privacy regulations

### Database Maintenance

#### Clean up old logs

```sql
-- Delete error logs older than 90 days
DELETE FROM error_logs 
WHERE created_at < NOW() - INTERVAL '90 days';

-- Delete performance metrics older than 30 days
DELETE FROM performance_metrics 
WHERE created_at < NOW() - INTERVAL '30 days';

-- Delete analytics events older than 180 days
DELETE FROM analytics_events 
WHERE created_at < NOW() - INTERVAL '180 days';
```

#### Query for insights

```sql
-- Top error types
SELECT error_type, COUNT(*), AVG(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END)
FROM error_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY error_type
ORDER BY COUNT(*) DESC
LIMIT 10;

-- Performance by page
SELECT page_url, 
       AVG(metric_value) as avg_load_time,
       PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY metric_value) as p95
FROM performance_metrics
WHERE metric_name = 'page_load_time'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY page_url
ORDER BY avg_load_time DESC;

-- Most tracked events
SELECT event_name, COUNT(*) as event_count
FROM analytics_events
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY event_name
ORDER BY event_count DESC
LIMIT 20;
```

## Troubleshooting

### Errors Not Being Logged

1. Check that error tracker is initialized:
   ```typescript
   // Should be in main.tsx
   import { errorTracker } from './lib/errorTracker';
   errorTracker.setUserId(null);
   ```

2. Verify RLS policies allow insertions:
   ```sql
   -- Check policy
   SELECT * FROM pg_policies 
   WHERE tablename = 'error_logs';
   ```

3. Check browser console for tracker errors

### Performance Metrics Missing

1. Ensure Performance API is available:
   ```typescript
   if ('performance' in window) {
     // Performance monitoring available
   }
   ```

2. Check that `usePerformanceMonitor` hook is called in `App.tsx`

3. Verify browser supports PerformanceObserver

### Analytics Not Tracking

1. Check session ID generation:
   ```typescript
   const sessionId = sessionStorage.getItem('analytics_session_id');
   console.log('Session ID:', sessionId);
   ```

2. Verify `useAnalytics` hook is mounted

3. Check database permissions for `analytics_events` table

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/friction-analytics/issues)
- **Documentation**: [Full Docs](https://docs.lovable.dev)
- **Discord**: [Join Community](https://discord.com/channels/1119885301872070706/1280461670979993613)
