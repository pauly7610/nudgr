# Phase 4: Integrations & Tracking SDK

## Overview
Phase 4 implements the complete tracking infrastructure that allows customers to embed friction analytics on their websites, plus file storage and export capabilities.

## Components Implemented

### 1. Client-Side Tracking SDK (`public/friction-tracker.js`)

**Purpose**: JavaScript SDK that customers embed on their websites to capture friction events.

**Features**:
- **Rage Click Detection**: Detects 3+ rapid clicks in 1 second window
- **Dead Click Detection**: Identifies clicks that produce no response within 3 seconds
- **JavaScript Error Tracking**: Captures uncaught errors and unhandled promise rejections
- **Form Validation Errors**: Tracks form field validation failures
- **Heatmap Data**: Records all user interactions with elements
- **Performance Metrics**: Captures page load time, FCP, TTI
- **Batch Processing**: Queues events and sends in batches (configurable size/interval)
- **Session Management**: Generates unique session IDs per user visit

**Installation**:
```html
<script 
  src="https://your-domain.com/friction-tracker.js" 
  data-api-key="fk_xxxxx"
  data-batch-size="10"
  data-batch-interval="5000"
></script>
```

**Event Types Tracked**:
- `friction`: rage_click, dead_click, javascript_error, unhandled_rejection, form_validation_error
- `heatmap`: click interactions, pageviews
- `performance`: loadTime, firstContentfulPaint, timeToInteractive

### 2. Event Ingestion Edge Function (`ingest-events`)

**Purpose**: Backend endpoint that receives and processes tracking events from customer websites.

**Security**:
- API key validation via `x-api-key` header
- Rate limiting per API key (default: 1000 requests/minute)
- Domain whitelisting support (optional)
- CORS enabled for cross-origin requests

**Processing**:
- Validates API keys against `api_keys` table
- Enforces rate limits per minute window
- Processes different event types (friction, heatmap, performance)
- Updates `friction_events`, `heatmap_data`, `page_performance_metrics` tables
- Tracks API key usage (`last_used_at`)

**Response**:
```json
{
  "success": true,
  "processed": 15,
  "breakdown": {
    "friction": 5,
    "heatmap": 8,
    "performance": 2
  }
}
```

### 3. API Keys Management

**Database Table**: `api_keys`
- Stores customer API keys for tracking
- Supports domain whitelisting
- Rate limit configuration per key
- Active/inactive status toggle
- Usage tracking (last_used_at)

**UI Component**: `APIKeysManager`
- Create new API keys with custom names
- Copy/hide/show API keys
- Toggle active status
- Delete keys
- View creation date and last usage
- Installation instructions with code snippet

**Hook**: `useAPIKeys`
- CRUD operations for API keys
- Auto-generates secure API keys (format: `fk_xxxxx`)
- Toast notifications for all actions

### 4. File Storage & Exports

**Storage Buckets**:
- `session-recordings`: Video recordings of user sessions (.webm files)
- `friction-screenshots`: Screenshots of friction events (.png files)
- `pdf-exports`: Generated PDF reports

**Edge Functions**:
- `upload-recording`: Handles session recording uploads with metadata
- `upload-screenshot`: Stores friction event screenshots
- `export-pdf`: Generates PDF reports (friction summary, journey analysis, cohort comparison)

**Components**:
- `PDFExportPanel`: UI for generating and downloading PDF reports
- `RecordingsManager`: Browse and playback session recordings
- `Integrations` page: Central hub for exports and recordings

**Hook**: `useFileStorage`
- File upload mutations (recordings, screenshots)
- PDF export generation
- Queries for recordings and export jobs

### 5. Database Schema Updates

**New Tables**:
- `api_keys`: Customer API key management
- `export_jobs`: Track PDF export generation status
- `notification_log`: Alert notification history
- `session_recordings`: Session recording metadata

**Updated Tables**:
- `friction_events`: Added `screenshot_url` column

**RLS Policies**:
- Users can only view/manage their own API keys
- Users can view their own export jobs
- Admins can view session recordings and exports
- System can insert/update export jobs and recordings

## Data Flow

### Tracking Flow:
1. Customer embeds `friction-tracker.js` on their website
2. SDK detects friction events (rage clicks, errors, etc.)
3. Events batched and sent to `ingest-events` edge function
4. Edge function validates API key and rate limits
5. Events stored in appropriate tables (`friction_events`, `heatmap_data`, etc.)
6. Dashboard displays analytics in real-time

### Export Flow:
1. User requests PDF export with filters (date range, report type)
2. `export-pdf` function creates export job in database
3. Fetches relevant data based on report type
4. Generates HTML report and converts to PDF
5. Uploads to `pdf-exports` bucket
6. Updates job status to completed with download URL
7. User downloads PDF from UI

## Security Considerations

1. **API Key Format**: `fk_` prefix + 32 random alphanumeric characters
2. **Rate Limiting**: Per-key limits stored in `rate_limits` table
3. **Domain Whitelisting**: Optional domain restrictions per API key
4. **RLS Policies**: All tables protected with row-level security
5. **Service Role**: Edge functions use service role for system operations
6. **CORS**: Properly configured for cross-origin tracking

## Configuration Options

**SDK Configuration**:
- `data-api-key`: Required API key
- `data-endpoint`: Custom endpoint URL (optional)
- `data-batch-size`: Number of events per batch (default: 10)
- `data-batch-interval`: Batch send interval in ms (default: 5000)
- `data-enable-recording`: Enable session recording (default: false)

**API Key Settings**:
- `key_name`: Human-readable identifier
- `allowed_domains`: Whitelist of domains (empty = all domains)
- `rate_limit_per_minute`: Request limit (default: 1000)
- `is_active`: Enable/disable key

## Usage Example

**Customer Setup**:
```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
  <!-- Add friction tracking -->
  <script 
    src="https://yourapp.com/friction-tracker.js" 
    data-api-key="fk_abc123xyz789"
  ></script>
</head>
<body>
  <!-- Your website content -->
</body>
</html>
```

**Your Dashboard**:
1. Go to Settings → API Keys
2. Click "Create API Key"
3. Name it (e.g., "Customer XYZ - Production")
4. Optionally add allowed domains
5. Copy the generated API key
6. Share installation instructions with customer

## Future Enhancements

- Session recording capture (video)
- Screenshot automation on friction events
- Slack/email notifications for alerts
- Advanced PDF templates with charts
- Real-time dashboard updates via WebSocket
- SDK configuration dashboard
- Analytics on SDK performance
- Multi-region edge function deployment