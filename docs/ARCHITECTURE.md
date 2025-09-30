# Architecture Overview

Detailed technical architecture of the Friction Analytics Platform.

## System Architecture

### High-Level Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        Client Layer                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │
│  │   React    │  │  Tracking  │  │   Service  │                 │
│  │    App     │  │    SDK     │  │   Worker   │                 │
│  └────────────┘  └────────────┘  └────────────┘                 │
└──────────────────────────────────────────────────────────────────┘
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                              │
│  ┌──────────────────────────────────────────────────────┐        │
│  │  Rate Limiting • Authentication • CORS • Validation  │        │
│  └──────────────────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────────────────┘
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                   Application Services                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │
│  │   Ingest   │  │  Analytics │  │   Export   │                 │
│  │   Events   │  │   Engine   │  │  Service   │                 │
│  └────────────┘  └────────────┘  └────────────┘                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │
│  │  Friction  │  │   Alerts   │  │    AI      │                 │
│  │  Detector  │  │   Manager  │  │  Analysis  │                 │
│  └────────────┘  └────────────┘  └────────────┘                 │
└──────────────────────────────────────────────────────────────────┘
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                      Data Layer                                   │
│  ┌──────────────────┐  ┌──────────────────┐                     │
│  │   PostgreSQL     │  │  Object Storage  │                     │
│  │  (Primary DB)    │  │  (Recordings)    │                     │
│  └──────────────────┘  └──────────────────┘                     │
└──────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Architecture

```typescript
src/
├── pages/               # Route components
│   ├── Index.tsx       # Dashboard
│   ├── JourneyMap.tsx  # Journey visualization
│   ├── UserCohorts.tsx # Cohort analysis
│   └── Settings.tsx    # Configuration
│
├── components/         # Reusable components
│   ├── ui/            # Base UI components (shadcn)
│   ├── analytics/     # Analytics widgets
│   ├── journey/       # Journey mapping
│   └── cohort/        # Cohort components
│
├── hooks/             # Custom React hooks
│   ├── useAuth.ts     # Authentication
│   ├── useFrictionData.ts
│   └── useAnalytics.ts
│
└── integrations/      # External services
    └── supabase/      # Backend client
```

### Backend Architecture (Edge Functions)

```
supabase/functions/
├── ingest-events/     # Event ingestion endpoint
├── analyze-friction/  # AI-powered analysis
├── detect-friction/   # Friction detection logic
├── realtime-dashboard/# Real-time metrics
├── score-friction/    # Severity scoring
├── send-friction-alert/ # Alert dispatch
├── api-access/        # Public API gateway
└── export-pdf/        # Report generation
```

## Data Flow

### 1. Event Ingestion Flow

```
User Action → Tracking SDK → Edge Function → Validation → Database
                                    ↓
                            Friction Detection → AI Analysis
                                    ↓
                              Alert System → Notifications
```

### 2. Analytics Query Flow

```
Dashboard → React Query → Edge Function → PostgreSQL → Aggregation
                                                ↓
                                        Cache (Client) → UI Update
```

### 3. AI Analysis Flow

```
Request → Edge Function → Lovable AI → Gemini/GPT → Response
                              ↓
                        Store Insights → Database
```

## Database Schema

### Core Tables

**friction_events**
```sql
- id: UUID (PK)
- session_id: UUID (FK)
- event_type: TEXT (click_rage, form_error, etc.)
- page_url: TEXT
- element_selector: TEXT
- severity_score: INTEGER (1-10)
- metadata: JSONB
- created_at: TIMESTAMP
```

**sessions**
```sql
- id: UUID (PK)
- user_id: UUID (FK, nullable)
- session_start: TIMESTAMP
- session_end: TIMESTAMP
- page_url: TEXT
- user_agent: TEXT
- metadata: JSONB
```

**cohorts**
```sql
- id: UUID (PK)
- name: TEXT
- criteria: JSONB
- created_by: UUID (FK)
- created_at: TIMESTAMP
```

**subscriptions**
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- tier: ENUM (free, professional, enterprise)
- status: TEXT
- current_period_start: TIMESTAMP
- current_period_end: TIMESTAMP
```

**usage_records**
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- usage_type: TEXT (session_recordings, data_storage)
- amount: NUMERIC
- period_start: DATE
- period_end: DATE
```

## Security Architecture

### Row Level Security (RLS)

All tables have RLS policies to ensure data isolation:

```sql
-- Example: friction_events table
CREATE POLICY "Admins can view all events"
  ON friction_events FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Analysts can view events"
  ON friction_events FOR SELECT
  USING (has_role(auth.uid(), 'analyst'));
```

### Authentication Flow

1. User signs up/logs in via Supabase Auth
2. JWT token issued with user claims
3. Token validated on each request
4. RLS policies enforce data access
5. API keys for external integrations

### API Security

- **Rate Limiting**: Per-key limits stored in `rate_limits` table
- **CORS**: Configured per API key with allowed domains
- **Encryption**: All data encrypted at rest and in transit
- **Secrets**: Managed via Lovable Cloud secrets system

## Scalability Considerations

### Horizontal Scaling

- **Edge Functions**: Auto-scale based on traffic
- **Database**: PostgreSQL with connection pooling
- **Storage**: Object storage for large files (recordings, exports)

### Performance Optimizations

1. **Client-Side**
   - React Query for caching
   - Code splitting with React.lazy
   - Debouncing for real-time updates

2. **Server-Side**
   - Database indexes on frequently queried columns
   - Materialized views for complex analytics
   - Query result caching

3. **Network**
   - CDN for static assets
   - Gzip/Brotli compression
   - HTTP/2 multiplexing

### Database Performance

**Indexes:**
```sql
CREATE INDEX idx_friction_events_session
  ON friction_events(session_id);

CREATE INDEX idx_friction_events_page_url
  ON friction_events(page_url);

CREATE INDEX idx_sessions_user_id
  ON sessions(user_id);
```

**Partitioning:**
```sql
-- Partition friction_events by date for better query performance
CREATE TABLE friction_events_2025_09 PARTITION OF friction_events
  FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');
```

## Monitoring & Observability

### Metrics Collection

- **Application Metrics**: Request latency, error rates
- **Business Metrics**: Active users, friction events/day
- **Infrastructure Metrics**: CPU, memory, database connections

### Logging Strategy

```typescript
// Structured logging
logger.info('Friction event processed', {
  eventId,
  sessionId,
  eventType,
  severity,
  processingTime: Date.now() - startTime
});
```

### Alerting

- Critical errors → Immediate notification
- Performance degradation → Alert after 5 minutes
- Business KPI thresholds → Daily summary

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────┐
│           Lovable Cloud CDN              │
│                                          │
│  ┌──────────────┐  ┌──────────────┐    │
│  │  Static App  │  │ Edge Functions│    │
│  │   (React)    │  │  (Serverless) │    │
│  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────┐
│        Supabase Infrastructure           │
│                                          │
│  ┌──────────────┐  ┌──────────────┐    │
│  │  PostgreSQL  │  │   Storage    │    │
│  │  (Managed)   │  │   Buckets    │    │
│  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────┘
```

### CI/CD Pipeline

1. Code push to main branch
2. Automated tests run
3. Build production bundle
4. Deploy to staging environment
5. Smoke tests
6. Promote to production
7. Monitor deployment

## Technology Decisions

### Why React?
- Component reusability
- Large ecosystem
- Excellent TypeScript support
- Server-side rendering capable

### Why Supabase?
- Built-in authentication
- Real-time capabilities
- PostgreSQL (ACID compliance)
- Row Level Security
- Edge functions for serverless compute

### Why TanStack Query?
- Automatic caching and invalidation
- Background refetching
- Optimistic updates
- DevTools for debugging

### Why Vitest?
- Fast test execution
- Native TypeScript support
- Compatible with Vite
- Modern testing API

## Future Considerations

### Potential Enhancements

1. **Data Warehouse Integration**: BigQuery/Snowflake for long-term analytics
2. **Message Queue**: Redis/RabbitMQ for async processing
3. **Search Engine**: Elasticsearch for log analysis
4. **Caching Layer**: Redis for frequently accessed data
5. **GraphQL API**: Alternative to REST for flexible queries

### Scaling Beyond Current Architecture

- Microservices for independent scaling of components
- Event sourcing for audit trails
- CQRS pattern for read/write optimization
- Multi-region deployment for global users

