# Phase 2: Analytics & Dashboard Configuration

## Overview
Phase 2 extends the friction analytics platform with comprehensive event tracking, heatmap aggregation, and customizable dashboards.

## Database Schema

### Heatmap Data (`heatmap_data`)
Aggregated interaction data for visualizing user behavior:
- **Interaction types**: click, hover, scroll, form_field, rage_click
- **Position tracking**: x/y coordinates and viewport dimensions
- **Metrics**: interaction count, duration, friction score (0-100)
- **Time-based aggregation**: date_bucket for daily rollups

**Use cases:**
- Identify high-friction UI elements
- Detect rage click patterns
- Optimize page layouts based on interaction patterns

### Scroll Depth Analytics (`scroll_depth_analytics`)
Track how far users scroll on each page:
- Max and average scroll percentages
- Bounce points (where users leave)
- Session counts per page
- Daily aggregations

**Use cases:**
- Identify engaging vs. ignored content
- Optimize content placement
- Reduce bounce rates

### Page Performance Metrics (`page_performance_metrics`)
Performance tracking per page:
- Load time, time to interactive, first contentful paint
- Bounce rate and exit rate
- Average time on page
- Total page views

**Use cases:**
- Identify slow-loading pages
- Correlate performance with bounce rates
- Prioritize optimization efforts

### Form Analytics (`form_analytics`)
Detailed form field analysis:
- Field-level error tracking
- Error rate calculations (auto-computed)
- Abandonment metrics
- Common error messages (JSONB array)
- Time to complete

**Use cases:**
- Reduce form abandonment
- Fix problematic form fields
- Improve validation messages

### Dashboard Configurations (`dashboard_configs`)
Save and share custom dashboard layouts:
- Custom widget layouts (JSONB)
- Filter configurations
- Default dashboard per user
- Role-based sharing (admin/analyst/viewer)

**Use cases:**
- Personalized analytics views
- Team collaboration
- Role-specific dashboards

### Alert Configurations (`alerts_config`)
Automated alerting system:
- Alert types: friction_spike, error_rate, conversion_drop, performance, custom
- Flexible conditions (JSONB)
- Multiple notification channels
- Active/inactive toggle
- Last triggered timestamp

**Use cases:**
- Real-time friction monitoring
- Proactive issue detection
- Team notifications

## React Hooks

### `useHeatmapData(pageUrl?, dateRange?)`
Fetch and filter heatmap interaction data.

### `useTopFrictionElements(limit)`
Get elements with highest friction scores.

### `useFormAnalytics(pageUrl?)`
Fetch form field analytics.

### `useTopFormErrors(limit)`
Get fields with highest error rates.

### `useDashboardConfigs()`
Fetch user's dashboard configurations.

### `useCreateDashboard()`
Create new dashboard configuration.

### `useUpdateDashboard()`
Update existing dashboard.

### `useAlerts()`
Fetch user's alert configurations.

### `useCreateAlert()`
Create new alert.

### `useToggleAlert()`
Enable/disable alert.

## Components

### `<HeatmapViewer>`
Visual display of interaction heatmap data with friction scores.

### `<FormErrorsPanel>`
Top form errors with error rates and progress bars.

## Security

All tables have Row-Level Security (RLS) enabled:
- **Analysts & Admins**: Full read access to analytics data
- **Viewers**: Read-only access to their own sessions
- **System**: Insert/update permissions for data ingestion
- **Dashboard configs**: Users can only manage their own
- **Shared dashboards**: Visible based on role permissions
- **Alerts**: Users manage their own, admins see all

## Next Steps: Phase 3

Phase 3 will implement:
- AI-powered friction detection edge functions
- Real-time friction scoring
- WebSocket dashboard updates
- Behavioral anomaly identification
- Predictive journey optimization
