# Phase 3: AI Integration & Real-time Updates

## Overview
Phase 3 brings powerful AI-driven friction detection, real-time WebSocket updates, and predictive analytics to the friction analytics platform.

## Edge Functions

### 1. `detect-friction`
**Purpose**: AI-powered behavioral analysis and friction pattern detection

**Authentication**: Required (JWT)

**How it works:**
1. Fetches recent friction events from database (last 100)
2. Sends data to Lovable AI (Gemini 2.5 Flash)
3. Receives structured analysis with:
   - Behavioral anomalies
   - Critical friction points
   - Predictive insights
4. Calculates aggregate friction scores per page
5. Returns comprehensive analysis with recommendations

**Response format:**
```typescript
{
  analysis: string;           // AI-generated insights
  frictionScores: Array<{
    page: string;
    avgFrictionScore: number;
    eventCount: number;
    recentEvents: Array<{
      type: string;
      severity: number;
      timestamp: string;
    }>;
  }>;
  totalEvents: number;
  timestamp: string;
}
```

**Rate limiting**: Inherits from AI Gateway (429 on rate limit, 402 on credit depletion)

### 2. `score-friction`
**Purpose**: Real-time friction scoring and heatmap aggregation

**Authentication**: Public (no JWT required)

**Scoring algorithm:**
```typescript
Base scores by event type:
- error: 80
- timeout: 70
- failed_validation: 60
- multiple_attempts: 50
- slow_response: 40
- confusion: 30
- hesitation: 20
- default: 10

Adjustments:
+ 20 for fatal/critical errors
+ 15 for form/submit elements
Max score: 100
```

**Features:**
- Automatic heatmap data aggregation
- Alert triggering for friction spikes (≥5 high-severity events)
- Real-time score calculation

**Response format:**
```typescript
{
  success: boolean;
  processed: number;
  highSeverityCount: number;
  averageScore: number;
}
```

### 3. `realtime-dashboard`
**Purpose**: WebSocket server for real-time dashboard updates

**Authentication**: Required (JWT)

**Connection URL:**
```
wss://nykvaozegqidulsgqrfg.supabase.co/functions/v1/realtime-dashboard
```

**Message types:**

**Client → Server:**
```typescript
{ type: 'subscribe', channel: string }
{ type: 'ping' }
```

**Server → Client:**
```typescript
{ type: 'connection', message: string, clientId: string }
{ type: 'subscribed', channel: string }
{ type: 'pong' }
{ type: 'friction_alert', data: any }
{ type: 'anomaly_detected', data: any }
```

**Features:**
- Automatic reconnection (5s delay)
- Heartbeat ping/pong (30s interval)
- Connection state management
- Broadcast to all connected clients

## React Hooks

### `useRealtimeDashboard()`
Manages WebSocket connection for real-time updates.

**Returns:**
```typescript
{
  isConnected: boolean;
  messages: RealtimeMessage[];
  subscribe: (channel: string) => void;
  disconnect: () => void;
}
```

**Features:**
- Auto-connection on mount
- Auto-reconnection on disconnect
- Message history (last 50 messages)
- Toast notifications for important events

### `useFrictionDetection()`
Manages AI friction detection and scoring.

**Returns:**
```typescript
{
  detectFriction: () => void;
  scoreFriction: (events: any[]) => void;
  isDetecting: boolean;
  isScoring: boolean;
  detectionResult: any;
  scoringResult: any;
}
```

## React Components

### `<AIFrictionDetection />`
AI-powered friction detection dashboard with:
- One-click analysis trigger
- Real-time analysis progress
- Summary statistics
- AI-generated insights
- Top friction pages ranking
- Visual progress indicators

### `<RealtimeUpdates />`
Live friction event feed with:
- WebSocket connection status
- Real-time event stream
- Event type icons
- Scrollable message history
- Auto-scrolling to latest

### `<PredictiveAnalytics />`
AI predictions for upcoming patterns:
- Friction increase predictions
- Conversion drop forecasts
- Performance issue warnings
- Improvement opportunities
- Confidence scores
- Impact levels (high/medium/low)

## Database Functions

### `upsert_heatmap_data()`
Efficiently aggregates heatmap interaction data.

**Parameters:**
```sql
p_page_url TEXT
p_element_selector TEXT
p_interaction_type TEXT
p_friction_score INTEGER
```

**Logic:**
- Inserts new record or updates existing
- Increments interaction count
- Calculates rolling average friction score
- Updates timestamp

**Uses UPSERT pattern with unique constraint:**
```sql
UNIQUE (page_url, element_selector, interaction_type, date_bucket)
```

## Integration Guide

### 1. Track Friction Events
```typescript
import { useFrictionDetection } from '@/hooks/useFrictionDetection';

const { scoreFriction } = useFrictionDetection();

// When user encounters friction
scoreFriction([{
  event_type: 'error',
  element_selector: '#submit-button',
  page_url: window.location.href,
  user_action: 'click',
  error_message: 'Validation failed',
  metadata: { /* additional context */ }
}]);
```

### 2. Run AI Analysis
```typescript
import { useFrictionDetection } from '@/hooks/useFrictionDetection';

const { detectFriction, detectionResult } = useFrictionDetection();

// Trigger analysis
detectFriction();

// Access results
console.log(detectionResult.analysis); // AI insights
console.log(detectionResult.frictionScores); // Page rankings
```

### 3. Real-time Updates
```typescript
import { useRealtimeDashboard } from '@/hooks/useRealtimeDashboard';

const { isConnected, messages } = useRealtimeDashboard();

// Display connection status
<Badge>{isConnected ? 'Connected' : 'Disconnected'}</Badge>

// Show recent messages
{messages.map(msg => (
  <div key={msg.timestamp}>{msg.type}: {msg.data}</div>
))}
```

## Architecture Decisions

### Why Gemini 2.5 Flash?
- **Free during promotional period** (Sept 29 - Oct 6, 2025)
- Fast inference for real-time analysis
- Strong at pattern recognition
- Cost-effective for high-volume analysis

### Why WebSocket for Real-time?
- **Low latency** for instant updates
- Bi-directional communication
- Efficient for multiple subscribers
- Native browser support

### Why Edge Functions?
- **Serverless scaling** - no infrastructure management
- Automatic deployment with code changes
- Built-in rate limiting and auth
- Close to database for fast queries

## Security Considerations

1. **JWT Authentication**: All sensitive endpoints require authentication
2. **Public scoring endpoint**: Allows anonymous friction tracking (by design)
3. **Rate limiting**: Inherited from AI Gateway and Supabase
4. **RLS policies**: All database queries respect user permissions
5. **Service role key**: Used only in edge functions, never exposed

## Performance Optimizations

1. **Heatmap aggregation**: UPSERT pattern reduces database writes
2. **Message batching**: WebSocket broadcasts to all clients simultaneously
3. **Limited history**: Only last 50 messages kept in memory
4. **Indexed queries**: All frequently-queried columns are indexed
5. **Computed columns**: Scores calculated in database (GENERATED ALWAYS AS)

## Monitoring & Debugging

### Edge Function Logs
View logs in Lovable Cloud dashboard → Functions → [function-name]

### WebSocket Debugging
```typescript
// Enable detailed logging
const wsUrl = 'wss://...';
console.log('Connecting to:', wsUrl);
ws.onmessage = (e) => console.log('Received:', e.data);
ws.onerror = (e) => console.error('Error:', e);
```

### Common Issues

**Issue**: WebSocket won't connect
**Solution**: Check JWT token validity, verify URL format

**Issue**: AI analysis returns 429
**Solution**: Rate limited - wait and retry with exponential backoff

**Issue**: Scores not updating in heatmap
**Solution**: Check unique constraint, verify upsert function is being called

## Next Steps: Phase 4

Phase 4 will add:
- Slack/email alerting integrations
- PDF export functionality
- Storage buckets for session recordings
- Screenshot capture automation
- Visualization asset management
