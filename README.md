
# UX Friction Analyzer - MVP

## Project Overview

UX Friction Analyzer is a comprehensive tool designed to help product teams identify, analyze, and resolve friction points in user journeys. By visualizing where users struggle, teams can make data-driven decisions to improve user experience and increase conversions.

This project represents the MVP (Minimum Viable Product) version of the UX Friction Analyzer, focusing on core functionality for marketing analytics teams.

## Core Features

- **Journey Friction Mapping**: Visualize user flows with drop-off rates and friction indicators
- **Real-time Friction Alerts**: Set thresholds and receive notifications for unusual friction patterns
- **User Cohort Analysis**: Compare friction patterns across different user segments
- **Marketing Funnel Diagnostics**: Diagnose issues in marketing funnels and campaigns
- **Session Recordings**: Watch actual user sessions experiencing high friction
- **Collaboration Tools**: Team annotation and discussion features
- **Marketing Playbooks**: Best practices library for solving common friction issues
- **Stale Content Analysis**: Identify underperforming content and features
- **Marketing Performance Metrics**: Track CTR, impressions, views, and conversion rates
- **User Authentication Analytics**: Compare behavior between authenticated and non-authenticated users

## Technology Stack

This project is built with:

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- Recharts for data visualization
- Tanstack React Query for data fetching

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```sh
# Clone the repository
git clone https://github.com/pauly7610/nudgr

# Navigate to the project directory
cd ux-friction-analyzer

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Build for Production

```sh
npm run build
```

## Project Structure

- `/src/components` - React components organized by feature area
- `/src/data` - Mock data for demonstration purposes
- `/src/hooks` - Custom React hooks
- `/src/pages` - Main application pages/routes
- `/src/components/metrics` - Specialized components for metrics and analytics

## Deployment

The project can be deployed to any static hosting service that supports single-page applications.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Future Roadmap

See the [PRD.md](PRD.md) file for details on planned features and enhancements beyond the MVP.
