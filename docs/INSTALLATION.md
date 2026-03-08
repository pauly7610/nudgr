# Installation Guide

Comprehensive installation instructions for the Friction Analytics Platform.

## Prerequisites Checklist

Before installing, ensure you have:

- [ ] **Node.js 18.x or higher** ([Download](https://nodejs.org/))
  ```bash
  node --version  # Should be >= 18.0.0
  ```

- [ ] **npm 9.x or higher** (comes with Node.js)
  ```bash
  npm --version  # Should be >= 9.0.0
  ```

- [ ] **Git** ([Download](https://git-scm.com/))
  ```bash
  git --version
  ```

- [ ] **A Railway account** (or another backend host)

- [ ] **Modern web browser** (Chrome, Firefox, Safari, or Edge)

## Installation Methods

### Method 1: Quick Start (Recommended)

**Best for**: Getting started quickly with default configuration

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/friction-analytics.git
cd friction-analytics

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Method 2: Using Bun (Faster)

**Best for**: Faster dependency installation and hot reload

```bash
# 1. Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# 2. Clone and setup
git clone https://github.com/yourusername/friction-analytics.git
cd friction-analytics

# 3. Install and run
bun install
bun dev
```

### Method 3: Fork on Lovable

**Best for**: No local setup, edit in browser

1. Visit the project on Lovable
2. Click **Remix this project**
3. Start editing immediately in the browser

## Post-Installation Setup

### 1. Verify Installation

After installation, verify everything works:

```bash
# Check if dev server starts without errors
npm run dev

# In another terminal, run tests
npm test

# Check TypeScript compilation
npm run build
```

### 2. Create Your First Admin User

1. Navigate to `http://localhost:8080/auth`
2. Click **Sign Up**
3. Enter your email and password
4. Click **Sign Up** (email confirmation is disabled in development)

### 3. Assign Admin Role

Use the included test data generator:
1. Go to **Settings → Testing**
2. Click **Generate Sample Data**
3. This creates sample friction events for your account

### 4. Generate API Key

For API access:

1. Navigate to **Settings → API Keys**
2. Click **Generate New Key**
3. Name your key (e.g., "Development")
4. Set rate limits (1000/min recommended for dev)
5. Copy and save your key securely

### 5. Configure Slack (Optional)

For friction alerts in Slack:

1. Create a Slack App at [api.slack.com/apps](https://api.slack.com/apps)
2. Enable Incoming Webhooks
3. Copy the webhook URL
4. Go to **Settings → Integrations → Slack**
5. Paste the webhook URL
6. Test the integration

## Environment Configuration

### Development Environment

Configure frontend environment values:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_REALTIME_WS_URL=ws://localhost:4000/ws/realtime-dashboard
```

Configure backend environment values in `backend/.env` (copy from `backend/.env.example`).

### Production Environment

When deploying to production, ensure these environment variables are set:

- Frontend: `VITE_API_BASE_URL`, `VITE_REALTIME_WS_URL`
- Backend: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN`

## Troubleshooting

### Installation Fails

**Problem**: `npm install` fails with dependency errors

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and lockfile
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Port Already in Use

**Problem**: Port 8080 is already in use

**Solution**:
```bash
# Find and kill the process using port 8080
# On macOS/Linux:
lsof -ti:8080 | xargs kill -9

# On Windows:
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Or change the port in vite.config.ts
```

### Build Errors

**Problem**: TypeScript errors during `npm run build`

**Solution**:
```bash
# Check for TypeScript errors
npx tsc --noEmit

# Fix or ignore specific errors in tsconfig.json
```

### Cannot Connect to Backend

**Problem**: API calls failing with CORS errors

**Solution**:
- Ensure you're running the dev server (`npm run dev`)
- Check that `.env` file exists and has correct values
- Clear browser cache and hard reload (Cmd/Ctrl + Shift + R)

### Database Connection Issues

**Problem**: "Failed to connect to database"

**Solution**:
1. Check internet connection
2. Verify Lovable Cloud project is active
3. Check `VITE_API_BASE_URL` in `.env` is correct
4. Try regenerating the project environment

## Next Steps

After successful installation:

1. **Explore the Dashboard** - Navigate to `http://localhost:8080`
2. **Read the Documentation** - Check out [README.md](../README.md)
3. **Run the Tests** - `npm test` to ensure everything works
4. **Install Tracking SDK** - Add to your website (see [PHASE_4_TRACKING_SDK.md](./PHASE_4_TRACKING_SDK.md))
5. **Generate Sample Data** - Settings → Testing → Generate Sample Data

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting Guide](https://docs.lovable.dev/tips-tricks/troubleshooting)
2. Search [GitHub Issues](https://github.com/yourusername/friction-analytics/issues)
3. Ask in [Discord Community](https://discord.com/channels/1119885301872070706/1280461670979993613)
4. Email support@lovable.dev

## System Requirements

### Minimum Requirements

- **CPU**: 2 cores
- **RAM**: 4 GB
- **Storage**: 500 MB free space
- **OS**: macOS 10.15+, Windows 10+, or Linux

### Recommended Requirements

- **CPU**: 4+ cores
- **RAM**: 8+ GB
- **Storage**: 2+ GB free space
- **Internet**: 10 Mbps+ for dev server hot reload

### Browser Compatibility

| Browser | Minimum Version | Recommended |
|---------|----------------|-------------|
| Chrome | 90+ | Latest |
| Firefox | 88+ | Latest |
| Safari | 14+ | Latest |
| Edge | 90+ | Latest |

## Deployment

See [Deployment Guide](./DEPLOYMENT.md) for production deployment instructions.
