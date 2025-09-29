# Rate Limiting System

This application implements a robust rate limiting system to protect backend resources and ensure fair usage across all users.

## Overview

Rate limiting prevents abuse by restricting the number of requests a user can make within a specific time window.

## Current Limits

### AI Analysis Endpoint
- **Endpoint**: `analyze-friction`
- **Limit**: 10 requests per minute per user
- **Window**: 60 seconds (rolling)
- **Identifier**: IP address or authorization token

## How It Works

1. **Request Tracking**: Each request is tracked in the `rate_limits` table with:
   - Identifier (IP address or auth token)
   - Endpoint name
   - Request count
   - Window start time

2. **Window Reset**: When a time window expires, the counter automatically resets

3. **Rate Limit Headers**: All responses include:
   - `X-RateLimit-Remaining`: Number of requests remaining
   - `X-RateLimit-Reset`: When the limit will reset

4. **Cleanup**: Old rate limit records are automatically cleaned up via the `cleanup_old_rate_limits()` function

## Response Codes

- **200**: Request successful (within limits)
- **429**: Rate limit exceeded
  ```json
  {
    "error": "Rate limit exceeded. Please try again later.",
    "resetAt": "2025-09-29T18:30:00.000Z"
  }
  ```

## Implementation Details

### Database Schema
```sql
CREATE TABLE public.rate_limits (
  id UUID PRIMARY KEY,
  identifier TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(identifier, endpoint)
);
```

### Shared Utility
Location: `supabase/functions/_shared/rateLimit.ts`

Key functions:
- `checkRateLimit()`: Validates if request is within limits
- `getRateLimitHeaders()`: Generates response headers

### Usage in Edge Functions
```typescript
import { checkRateLimit, getRateLimitHeaders } from "../_shared/rateLimit.ts";

// Check rate limit
const rateLimitResult = await checkRateLimit(identifier, 'endpoint-name', {
  maxRequests: 10,
  windowMs: 60000
});

if (!rateLimitResult.allowed) {
  return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
    status: 429,
    headers: getRateLimitHeaders(rateLimitResult)
  });
}
```

## Customizing Limits

To modify rate limits for an endpoint, update the config in the edge function:

```typescript
await checkRateLimit(identifier, 'endpoint-name', {
  maxRequests: 20,    // Allow 20 requests
  windowMs: 300000    // Per 5 minutes
});
```

## Monitoring

Rate limit data can be queried from the `rate_limits` table:

```sql
-- View current rate limits
SELECT * FROM rate_limits 
WHERE window_start > NOW() - INTERVAL '1 hour';

-- Check top users by request count
SELECT identifier, endpoint, request_count 
FROM rate_limits 
ORDER BY request_count DESC 
LIMIT 10;
```

## Best Practices

1. **Graceful Degradation**: The system fails open if there's a database error
2. **User Feedback**: Display clear messages when limits are hit
3. **Monitoring**: Track 429 responses to adjust limits as needed
4. **Cleanup**: Run cleanup function periodically to maintain performance
