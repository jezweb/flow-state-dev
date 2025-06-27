# Real API Integration for Flow State Dev GUI

## Overview

The Flow State Dev GUI now supports both mock and real API modes. This document explains how to set up and use the real API integration.

## Architecture

### Current Setup
- **Mock API Mode** (default): Uses `mockFlowStateApi.js` with simulated data
- **Real API Mode**: Uses `realFlowStateApi.js` connecting to Node.js server that exposes CLI functionality

### Files Created
1. **`server.js`** - Express server exposing CLI API as HTTP endpoints
2. **`realFlowStateApi.js`** - Browser client for real API server
3. **`flowStateApi.js`** - Unified API interface supporting both modes
4. **Environment files** - Configuration for API mode switching

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Flow State Dev CLI working properly
- GUI dependencies installed

### 1. Install Additional Dependencies
```bash
cd gui-temp
npm install express cors concurrently
```

### 2. API Mode Configuration

#### Mock API Mode (Default)
```bash
# Copy default config
cp .env .env.local
npm run dev
```

#### Real API Mode
```bash
# Use real API configuration
cp .env.real .env
npm run dev:real
```

This will:
- Start the Vite dev server (port 5173)
- Start the API server (port 3001)
- Connect GUI to real CLI functionality

### 3. Manual Setup
If you need to run components separately:

```bash
# Terminal 1 - Start API server
npm run server

# Terminal 2 - Start GUI with real API
VITE_USE_REAL_API=true npm run dev
```

## API Endpoints

The server exposes these endpoints at `http://localhost:3001/api`:

### Health & Status
- `GET /health` - Server health check
- `GET /version` - CLI version info

### Modules
- `GET /modules` - List all modules
- `GET /modules/categories` - Available categories
- `GET /modules/:name` - Get specific module
- `GET /modules/search/:query` - Search modules

### Projects
- `GET /projects` - Scan for projects
- `GET /projects/recent` - Recent projects
- `GET /projects/:path/info` - Project details
- `POST /projects/create` - Create new project

### Presets & Diagnostics
- `GET /presets` - Available stack presets
- `GET /diagnostics` - System diagnostics

### Settings
- `GET /settings` - User settings
- `PUT /settings` - Update settings

### Real-time Events
- `GET /events` - Server-sent events for progress tracking

## Configuration

### Environment Variables
- `VITE_USE_REAL_API` - 'true' for real API, 'false' for mock
- `VITE_API_BASE_URL` - API server URL (default: http://localhost:3001)

### GUI Settings Page
The Settings view now shows:
- Current API connection status
- Connection type (real/mock)
- Health check button
- Instructions for switching modes

## Features Implemented

### ✅ Working Features
1. **API Mode Switching** - Environment-based configuration
2. **Connection Status** - Real-time health monitoring
3. **Unified Interface** - Same API calls work for both modes
4. **Progress Tracking** - Server-sent events for real-time updates
5. **Error Handling** - Graceful fallbacks and user feedback

### ✅ Real API Endpoints
- Module discovery and listing
- Project scanning and creation
- System diagnostics
- Settings management
- Health monitoring

### ✅ Mock API Features
- All original functionality preserved
- Project creation simulation
- Module browsing
- Settings persistence (localStorage)

## Benefits of Real API Integration

1. **Actual CLI Functionality** - Real module discovery, project creation
2. **File System Access** - Genuine project scanning and file operations
3. **System Integration** - Real diagnostics and tool detection
4. **Progress Tracking** - Live updates during operations
5. **Persistence** - Settings saved to actual config files

## Troubleshooting

### Common Issues

#### "Cannot connect to API server"
- Ensure Node.js is installed
- Run `npm run server` to start API server
- Check port 3001 is available

#### "Module not found" errors in server
- Run from project root directory
- Ensure all CLI dependencies are installed
- Check `lib/api/` import paths

#### GUI shows "Mock API" in real mode
- Verify `.env` file has `VITE_USE_REAL_API=true`
- Restart development server after changing env vars
- Check browser console for connection errors

### Development Commands

```bash
# Development with mock API (default)
npm run dev

# Development with real API
npm run dev:real

# Production build with real API
npm run build

# Start production server
npm run start
```

## Next Steps

### Recommended Improvements
1. **Module Management** - Add/remove modules through GUI
2. **Project Templates** - Custom template management
3. **Git Integration** - Repository operations
4. **Terminal Integration** - Execute commands in GUI
5. **Error Recovery** - Better error handling and retry logic

### Performance Optimizations
1. **Caching** - Module and project data caching
2. **Debouncing** - Reduce API calls during rapid interactions
3. **Progressive Loading** - Load data as needed
4. **Background Sync** - Update data without blocking UI

## Security Considerations

- API server runs locally only
- No remote network access
- File system access limited to project directories
- Settings stored in user home directory
- No credential handling in browser

## Testing

Use the Settings page to:
1. Check API connection status
2. Test connection health
3. Switch between API modes
4. Monitor real-time status updates

The connection indicator will show:
- ✅ Green: Connected to API
- ⚠️ Yellow: Connection issues
- ❌ Red: API unavailable