# Friction Analytics Platform

> Real-time user friction detection and analytics platform to identify and resolve UX issues before they impact conversions.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Analytics
- **Real-time Friction Detection** - AI-powered identification of user struggles
- **Session Recordings** - Visual replay of user interactions with friction highlights
- **Heatmaps & Click Tracking** - Visualize user behavior patterns
- **Form Analytics** - Track field errors, abandonment, and completion times
- **Performance Monitoring** - Page load times, time to interactive, bounce rates

### Advanced Features
- **AI Analysis** - Gemini/GPT-powered insights and recommendations
- **Cohort Analysis** - Segment users by behavior, demographics, or custom criteria
- **A/B Testing** - Experiment management with friction-based metrics
- **Journey Mapping** - Visual user flow analysis with friction points
- **Anomaly Detection** - Automatic alerting for unusual patterns

### Integrations
- **Slack Notifications** - Real-time alerts for critical friction events
- **Marketing Playbooks** - Pre-built strategies for common friction patterns
- **PDF Exports** - Shareable reports with insights and recommendations
- **REST API** - Full programmatic access to all features

### Subscription Tiers
- **Free** - Basic tracking, 1K events/month, 7-day retention
- **Professional ($149/mo)** - Unlimited events, AI analysis, 90-day retention
- **Enterprise ($499/mo)** - White-labeling, API access, custom retention, SLA

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/Vite)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │ Journey  │  │ Cohorts  │  │ Settings │   │
│  │          │  │   Map    │  │ Analysis │  │          │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Lovable Cloud (Supabase Backend)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │ Edge Functions│  │   Storage    │     │
│  │   Database   │  │  (Serverless) │  │   (Files)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Row Level Security (RLS) + Authentication           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Lovable  │  │  Slack   │  │  Stripe  │                  │
│  │   AI     │  │   API    │  │ Payments │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### Key Technologies
- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **AI**: Lovable AI (Gemini 2.5 Pro/Flash, GPT-5)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Testing**: Vitest + React Testing Library
- **Build Tool**: Vite

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:
- **Node.js** >= 18.x ([Download](https://nodejs.org/))
- **npm** >= 9.x (comes with Node.js) or **bun** >= 1.0
- **Git** ([Download](https://git-scm.com/))
- A **Lovable** account (for Cloud backend)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/friction-analytics.git
   cd friction-analytics
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

4. **Open your browser**
   ```
   http://localhost:8080
   ```

The app will automatically connect to the Lovable Cloud backend (no additional setup required).

## 📦 Installation

### For Development

```bash
# Clone the repository
git clone https://github.com/yourusername/friction-analytics.git
cd friction-analytics

# Install dependencies
npm install

# Start development server with hot reload
npm run dev
```

### For Production

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy (see Deployment section)
```

### Environment Variables

The `.env` file is automatically managed by Lovable Cloud. Key variables include:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

**⚠️ Never edit the `.env` file manually** - it's auto-generated and updated by the platform.

## ⚙️ Configuration

### Authentication Setup

1. **Enable Email Confirmation (for production)**
   - Go to Settings → Authentication in the Lovable Cloud dashboard
   - Toggle email confirmation as needed
   - For development, auto-confirm is enabled by default

2. **Configure Redirect URLs**
   - Add your production domain to allowed redirect URLs
   - Include both `yourdomain.com` and `www.yourdomain.com`

### Subscription Configuration

Edit `src/pages/Pricing.tsx` to customize:
- Pricing tiers and amounts
- Feature availability per tier
- Usage limits and overage pricing

### Dashboard Customization

Configure default widgets in `src/hooks/useDashboardConfig.ts`:
```typescript
const DEFAULT_LAYOUT = [
  { id: 'stats', x: 0, y: 0, w: 12, h: 2 },
  { id: 'frictionMap', x: 0, y: 2, w: 6, h: 4 },
  // ... add your widgets
];
```

## 📖 Usage

### Installing the Tracking SDK

Add to your website's `<head>`:

```html
<script src="https://your-domain.com/friction-tracker.js"></script>
<script>
  FrictionTracker.init({
    apiKey: 'your_api_key',
    endpoint: 'https://your-domain.com',
    enableSessionRecording: true,
    enableHeatmaps: true,
    sampleRate: 1.0 // 100% of sessions
  });
</script>
```

### Creating User Cohorts

```typescript
// Via UI: Cohorts → Create New Cohort
// Via API:
POST /api/cohorts
{
  "name": "High-Value Users",
  "criteria": {
    "sessionCount": { "min": 10 },
    "conversionRate": { "min": 0.05 },
    "lastActive": { "within": "7d" }
  }
}
```

### Setting Up Alerts

```typescript
// Via UI: Settings → Alerts → Create Alert
// Configure conditions:
{
  "alertType": "friction_spike",
  "conditions": {
    "metric": "friction_score",
    "threshold": 80,
    "duration": "5m"
  },
  "channels": ["email", "slack"]
}
```

## 🔌 API Documentation

See [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) for complete API reference.

### Quick Examples

**Authentication**
```bash
curl -X POST https://your-domain.com/auth/v1/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secure_password"}'
```

**Ingest Friction Events**
```bash
curl -X POST https://your-domain.com/functions/v1/ingest-events \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "events": [{
      "type": "click_rage",
      "pageUrl": "/checkout",
      "severity": 8,
      "metadata": {"element": "#submit-button"}
    }]
  }'
```

**Retrieve Analytics**
```bash
curl https://your-domain.com/functions/v1/api-access \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "X-API-Key: YOUR_API_KEY"
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage

# Open interactive UI
npm run test:ui
```

See [README.test.md](./README.test.md) for detailed testing documentation.

### Writing Tests

```typescript
// Component test example
import { render, screen } from '@/test/test-utils';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## 🚢 Deployment

### Deploy to Lovable Cloud (Recommended)

1. Click **Publish** in the top-right corner
2. Your app is automatically deployed with:
   - Global CDN
   - Automatic SSL
   - Backend integration
   - Environment variables

### Custom Domain Setup

1. Go to **Settings → Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. SSL is automatically provisioned

### Deploy to Vercel/Netlify

```bash
# Build the project
npm run build

# Deploy the dist/ folder to your platform
# Set environment variables in platform dashboard
```

## 📚 Additional Documentation

- [Installation Guide](./docs/INSTALLATION.md) - Detailed installation instructions
- [API Reference](./docs/API_DOCUMENTATION.md) - Complete API documentation
- [Architecture](./docs/ARCHITECTURE.md) - System architecture overview
- [Security](./docs/SECURITY.md) - Security best practices and guidelines
- [Monitoring](./docs/MONITORING.md) - Error tracking, performance monitoring, analytics
- [Testing Guide](./README.test.md) - Testing best practices
- [Phase 2: Analytics](./docs/PHASE_2_ANALYTICS.md) - Advanced analytics features
- [Phase 3: AI & Realtime](./docs/PHASE_3_AI_REALTIME.md) - AI integration guide
- [Phase 4: SDK](./docs/PHASE_4_TRACKING_SDK.md) - Tracking SDK implementation
- [Rate Limiting](./docs/RATE_LIMITING.md) - Rate limit configuration

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Write tests for new features
- Use semantic commit messages
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [https://docs.lovable.dev](https://docs.lovable.dev)
- **Discord Community**: [Join Discord](https://discord.com/channels/1119885301872070706/1280461670979993613)
- **Email**: support@lovable.dev
- **Issues**: [GitHub Issues](https://github.com/yourusername/friction-analytics/issues)

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
- Charts powered by [Recharts](https://recharts.org)

---

**Made with ❤️ using Lovable**
