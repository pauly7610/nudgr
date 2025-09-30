# API Documentation

Complete API reference for the Friction Analytics Platform.

## Table of Contents

- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
  - [Events Ingestion](#events-ingestion)
  - [Analytics](#analytics)
  - [Friction Detection](#friction-detection)
  - [Cohorts](#cohorts)
  - [Session Recordings](#session-recordings)
  - [Exports](#exports)
- [Webhooks](#webhooks)
- [Error Handling](#error-handling)
- [SDKs](#sdks)

## Authentication

All API requests require authentication using either:

### API Key Authentication

Include your API key in the request header:

```http
Authorization: Bearer YOUR_API_KEY
X-API-Key: YOUR_API_KEY
```

### Getting Your API Key

1. Navigate to **Settings → API Keys**
2. Click **Generate New Key**
3. Copy and securely store your key
4. Set allowed domains and rate limits

### Example Request

```bash
curl -X GET "https://your-domain.com/functions/v1/api-access" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "X-API-Key: YOUR_API_KEY"
```

## Rate Limiting

Rate limits are enforced per API key:

| Tier | Requests/Minute | Requests/Day |
|------|----------------|--------------|
| Free | 60 | 1,000 |
| Professional | 1,000 | 100,000 |
| Enterprise | Custom | Custom |

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1634567890
```

### Rate Limit Exceeded Response

```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60,
  "limit": 1000,
  "remaining": 0
}
```

## Endpoints

### Events Ingestion

#### Ingest Friction Events

Send friction events from your application.

**Endpoint:** `POST /functions/v1/ingest-events`

**Request Body:**

```json
{
  "events": [
    {
      "sessionId": "uuid-v4",
      "eventType": "click_rage",
      "pageUrl": "/checkout",
      "timestamp": "2025-09-30T10:00:00Z",
      "elementSelector": "#submit-button",
      "userAction": "click",
      "severityScore": 8,
      "errorMessage": null,
      "metadata": {
        "clickCount": 5,
        "duration": 2500,
        "userAgent": "Mozilla/5.0...",
        "viewport": { "width": 1920, "height": 1080 }
      }
    }
  ]
}
```

**Event Types:**
- `click_rage` - Rapid repeated clicks on same element
- `dead_click` - Clicks on non-interactive elements
- `error_click` - Clicks triggering JavaScript errors
- `form_error` - Form validation failures
- `slow_load` - Pages taking >3s to load
- `navigation_loop` - User stuck in navigation loop
- `scroll_thrash` - Excessive scrolling behavior

**Response:**

```json
{
  "success": true,
  "eventsProcessed": 1,
  "errors": []
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Invalid event data",
  "details": [
    {
      "field": "events[0].eventType",
      "message": "Must be a valid event type"
    }
  ]
}
```

---

### Analytics

#### Get Dashboard Analytics

Retrieve aggregated analytics for the dashboard.

**Endpoint:** `GET /functions/v1/realtime-dashboard`

**Query Parameters:**
- `startDate` (ISO 8601) - Start of date range
- `endDate` (ISO 8601) - End of date range
- `cohortId` (UUID) - Filter by cohort (optional)
- `pageUrl` (string) - Filter by page (optional)

**Example:**

```bash
curl -X GET "https://your-domain.com/functions/v1/realtime-dashboard?startDate=2025-09-01&endDate=2025-09-30" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response:**

```json
{
  "summary": {
    "totalEvents": 15234,
    "totalSessions": 3421,
    "avgFrictionScore": 42.5,
    "topFrictionEvents": ["click_rage", "form_error"]
  },
  "timeSeries": [
    {
      "date": "2025-09-01",
      "events": 512,
      "sessions": 124,
      "frictionScore": 38.2
    }
  ],
  "topPages": [
    {
      "url": "/checkout",
      "frictionScore": 78.5,
      "eventCount": 245
    }
  ]
}
```

---

### Friction Detection

#### Analyze Friction

Run AI-powered friction analysis on a specific page or session.

**Endpoint:** `POST /functions/v1/analyze-friction`

**Request Body:**

```json
{
  "pageUrl": "/checkout",
  "sessionId": "uuid-v4",
  "includeRecommendations": true
}
```

**Response:**

```json
{
  "frictionScore": 78.5,
  "frictionEvents": [
    {
      "type": "click_rage",
      "severity": 8,
      "count": 12,
      "element": "#submit-button"
    }
  ],
  "insights": {
    "summary": "Users experiencing high friction on checkout button",
    "rootCauses": [
      "Button appears disabled but is clickable",
      "No loading state feedback",
      "Unclear error messages"
    ],
    "recommendations": [
      "Add loading spinner during processing",
      "Improve error message visibility",
      "Add disabled state styling"
    ]
  },
  "aiAnalysis": {
    "model": "gemini-2.5-pro",
    "confidence": 0.92,
    "generatedAt": "2025-09-30T10:00:00Z"
  }
}
```

---

### Cohorts

#### Create Cohort

Define a new user cohort based on criteria.

**Endpoint:** `POST /api/cohorts`

**Request Body:**

```json
{
  "name": "High-Value Churned Users",
  "description": "Users who spent >$500 but haven't returned in 30 days",
  "criteria": {
    "totalSpent": { "min": 500 },
    "lastActive": { "before": "30d" },
    "sessionCount": { "min": 5 },
    "frictionScore": { "min": 60 }
  }
}
```

**Response:**

```json
{
  "id": "uuid-v4",
  "name": "High-Value Churned Users",
  "userCount": 234,
  "createdAt": "2025-09-30T10:00:00Z"
}
```

#### List Cohorts

**Endpoint:** `GET /api/cohorts`

**Response:**

```json
{
  "cohorts": [
    {
      "id": "uuid-v4",
      "name": "High-Value Churned Users",
      "userCount": 234,
      "avgFrictionScore": 67.8,
      "createdAt": "2025-09-30T10:00:00Z"
    }
  ]
}
```

---

### Session Recordings

#### Upload Recording

Upload a session recording file.

**Endpoint:** `POST /functions/v1/upload-recording`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `sessionId` (UUID) - Session identifier
- `file` (File) - Recording file (JSON or video)
- `metadata` (JSON) - Additional session metadata

**Response:**

```json
{
  "success": true,
  "recordingId": "uuid-v4",
  "storageUrl": "internal-storage-path",
  "duration": 245.5
}
```

#### List Recordings

**Endpoint:** `GET /api/recordings`

**Query Parameters:**
- `sessionId` (UUID) - Filter by session
- `startDate` / `endDate` - Date range
- `minFrictionScore` (number) - Minimum friction score

**Response:**

```json
{
  "recordings": [
    {
      "id": "uuid-v4",
      "sessionId": "uuid-v4",
      "duration": 245.5,
      "frictionEventsCount": 12,
      "createdAt": "2025-09-30T10:00:00Z",
      "thumbnailUrl": null
    }
  ],
  "total": 156,
  "page": 1,
  "perPage": 20
}
```

---

### Exports

#### Generate PDF Report

Create a PDF export of analytics data.

**Endpoint:** `POST /functions/v1/export-pdf`

**Request Body:**

```json
{
  "reportType": "friction_analysis",
  "dateRange": {
    "start": "2025-09-01",
    "end": "2025-09-30"
  },
  "sections": [
    "summary",
    "frictionEvents",
    "topPages",
    "cohortAnalysis",
    "recommendations"
  ],
  "cohortId": "uuid-v4"
}
```

**Response:**

```json
{
  "jobId": "uuid-v4",
  "status": "processing",
  "estimatedTime": 30
}
```

#### Check Export Status

**Endpoint:** `GET /api/exports/{jobId}`

**Response:**

```json
{
  "jobId": "uuid-v4",
  "status": "completed",
  "downloadUrl": "https://storage.../report.pdf",
  "expiresAt": "2025-10-07T10:00:00Z"
}
```

---

## Webhooks

Configure webhooks to receive real-time notifications.

### Setup

1. Go to **Settings → Integrations → Webhooks**
2. Add your endpoint URL
3. Select events to receive
4. Save and verify

### Event Types

- `friction.detected` - New friction event detected
- `cohort.updated` - Cohort membership changed
- `alert.triggered` - Alert threshold exceeded
- `export.completed` - PDF export ready

### Webhook Payload

```json
{
  "event": "friction.detected",
  "timestamp": "2025-09-30T10:00:00Z",
  "data": {
    "eventId": "uuid-v4",
    "sessionId": "uuid-v4",
    "eventType": "click_rage",
    "severityScore": 8,
    "pageUrl": "/checkout"
  },
  "signature": "sha256=..."
}
```

### Verifying Webhooks

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return `sha256=${hash}` === signature;
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Missing required field: sessionId",
    "details": {
      "field": "sessionId",
      "expected": "UUID v4"
    }
  },
  "requestId": "uuid-v4"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTHENTICATION_ERROR` | 401 | Invalid or missing API key |
| `AUTHORIZATION_ERROR` | 403 | Insufficient permissions |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INVALID_REQUEST` | 400 | Malformed request |
| `NOT_FOUND` | 404 | Resource not found |
| `SERVER_ERROR` | 500 | Internal server error |

---

## SDKs

### JavaScript/TypeScript

```bash
npm install @friction-analytics/sdk
```

```typescript
import { FrictionAnalytics } from '@friction-analytics/sdk';

const analytics = new FrictionAnalytics({
  apiKey: 'YOUR_API_KEY',
  endpoint: 'https://your-domain.com'
});

// Track event
await analytics.track({
  eventType: 'click_rage',
  pageUrl: window.location.href,
  elementSelector: '#submit-button',
  severityScore: 8
});

// Get analytics
const data = await analytics.getAnalytics({
  startDate: '2025-09-01',
  endDate: '2025-09-30'
});
```

### Python

```bash
pip install friction-analytics
```

```python
from friction_analytics import FrictionAnalytics

analytics = FrictionAnalytics(
    api_key='YOUR_API_KEY',
    endpoint='https://your-domain.com'
)

# Track event
analytics.track({
    'event_type': 'form_error',
    'page_url': '/signup',
    'severity_score': 6
})

# Get analytics
data = analytics.get_analytics(
    start_date='2025-09-01',
    end_date='2025-09-30'
)
```

---

## Support

- **API Issues**: support@lovable.dev
- **Documentation**: [https://docs.lovable.dev](https://docs.lovable.dev)
- **Status Page**: [https://status.lovable.dev](https://status.lovable.dev)
