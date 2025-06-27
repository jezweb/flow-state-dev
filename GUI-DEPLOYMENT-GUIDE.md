# Flow State Dev GUI - Complete Setup and Deployment Guide

## 🚀 Overview

The Flow State Dev GUI now supports both **Mock API** (immediate testing) and **Real API** (full CLI integration) modes. This guide provides step-by-step instructions for both deployment scenarios.

## 📋 Prerequisites

### Required Software
- **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
- **npm** (included with Node.js)
- **Git** (for cloning/updates)

### Environment Check
```bash
# Verify Node.js installation
node --version  # Should show v18.x.x or higher
npm --version   # Should show npm version

# Verify Flow State Dev CLI
cd /path/to/flow-state-dev
node bin/fsd.js --version  # Should show 2.1.3
```

## 🎯 Quick Start (Mock API Mode)

**Fastest way to get the GUI running with simulated data:**

```bash
# Navigate to project
cd /path/to/flow-state-dev/gui-temp

# Install dependencies (if not already installed)
npm install

# Start development server with mock API
npm run dev

# Open browser to: http://localhost:5173
```

This mode provides:
- ✅ Full GUI functionality
- ✅ Simulated project data
- ✅ All views and components working
- ✅ Settings persistence
- ✅ No server setup required

## 🔥 Full Integration (Real API Mode)

**Complete setup with actual CLI functionality:**

### Step 1: Install Dependencies
```bash
cd /path/to/flow-state-dev/gui-temp

# Install all dependencies including server components
npm install

# Verify installation
ls node_modules/express node_modules/cors node_modules/concurrently
```

### Step 2: Choose Deployment Method

#### Option A: Automated Full Stack
```bash
# Start both GUI and API server simultaneously
npm run dev:real

# This will:
# 1. Copy real API configuration
# 2. Start the API server (port 3001)
# 3. Start the GUI dev server (port 5173)
# 4. Open browser automatically
```

#### Option B: Manual Control
```bash
# Terminal 1 - Start API server
npm run server

# Terminal 2 - Start GUI in real API mode
VITE_USE_REAL_API=true npm run dev

# Or copy config first:
cp .env.real .env
npm run dev
```

#### Option C: Production Build
```bash
# Build GUI for production
npm run build

# Start production server (serves GUI + API)
npm run start

# Access at: http://localhost:3001
```

## 🔧 Configuration Options

### Environment Variables
Create or modify `.env` file in `gui-temp/`:

```bash
# Mock API Mode (default)
VITE_USE_REAL_API=false
VITE_API_BASE_URL=http://localhost:3001

# Real API Mode
VITE_USE_REAL_API=true
VITE_API_BASE_URL=http://localhost:3001
```

### Quick Mode Switching
```bash
# Switch to mock mode
cp .env .env.local && npm run dev

# Switch to real mode  
cp .env.real .env && npm run dev

# Or use predefined scripts
npm run dev:mock    # Mock API mode
npm run dev:real    # Real API mode
```

## 🧪 Testing and Verification

### 1. Mock API Testing
```bash
cd gui-temp
npm run dev

# Test in browser:
# 1. Visit http://localhost:5173
# 2. Go to Settings page
# 3. Verify "Mock API" status
# 4. Test all views and features
```

### 2. Real API Testing
```bash
cd gui-temp
npm run dev:real

# Test in browser:
# 1. Visit http://localhost:5173
# 2. Go to Settings page
# 3. Verify "Real API - Connected" status
# 4. Test project scanning
# 5. Test module discovery
# 6. Test diagnostics
```

### 3. API Connection Testing
The Settings page provides real-time connection monitoring:
- **Connection Status**: Shows current API mode and health
- **Test Button**: Click refresh to test connection
- **Error Messages**: Displays connection issues with suggestions

## 🔍 Troubleshooting

### Common Issues

#### "Cannot connect to API server"
```bash
# Check if server is running
curl http://localhost:3001/api/health

# If not running, start the server:
cd gui-temp
npm run server

# Check for port conflicts:
lsof -i :3001  # Kill conflicting processes if needed
```

#### "Module not found" errors
```bash
# Reinstall dependencies
cd gui-temp
rm -rf node_modules package-lock.json
npm install

# Verify Node.js version
node --version  # Must be 18+
```

#### "EADDRINUSE" port errors
```bash
# Port 3001 in use - kill the process:
lsof -ti:3001 | xargs kill

# Or use different port:
PORT=3002 npm run server
```

#### GUI shows "Mock API" when expecting real
```bash
# Check environment configuration:
cat .env

# Should show:
# VITE_USE_REAL_API=true

# If not, copy real config:
cp .env.real .env

# Restart development server:
npm run dev
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=flow-state:* npm run server

# Check browser console for errors
# Check Network tab for API calls
```

## 📱 Production Deployment

### Build for Production
```bash
cd gui-temp

# Build optimized GUI
npm run build

# Start production server
npm run start

# Access at: http://localhost:3001
```

### Docker Deployment (Optional)
```dockerfile
# Create Dockerfile in gui-temp/
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001
CMD ["npm", "run", "start"]
```

```bash
# Build and run container
docker build -t flow-state-gui .
docker run -p 3001:3001 flow-state-gui
```

## 🎛️ Advanced Configuration

### Custom API Server Settings
Edit `gui-temp/server.js`:
```javascript
const port = process.env.PORT || 3001;
const apiTimeout = process.env.API_TIMEOUT || 30000;
```

### Proxy Configuration
For development behind proxy, edit `gui-temp/vite.config.js`:
```javascript
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
}
```

## 📊 Performance Monitoring

### Server Performance
```bash
# Monitor API server
curl http://localhost:3001/api/health

# Response time testing
time curl http://localhost:3001/api/modules
```

### GUI Performance
- Use browser DevTools → Performance tab
- Monitor Network tab for API call times
- Check Memory usage in browser

## 🔐 Security Considerations

- API server runs locally only (localhost:3001)
- No remote network access by default
- File system access limited to project directories
- Settings stored in user home directory (~/.fsd/)
- No authentication required for local development

## 📚 Additional Resources

### Documentation Files
- `README-API-INTEGRATION.md` - Technical implementation details
- `REAL-API-INTEGRATION-SUMMARY.md` - Development summary
- Main `README.md` - Flow State Dev CLI documentation

### Support
- Check browser console for errors
- Review API server logs
- Test with mock API mode first
- Verify Node.js and npm versions

---

## 🎉 Success Criteria

**Mock API Mode Success:**
- ✅ GUI loads at http://localhost:5173
- ✅ Settings page shows "Mock API - Connected"
- ✅ All views accessible and functional
- ✅ Project data displayed correctly

**Real API Mode Success:**
- ✅ GUI loads at http://localhost:5173
- ✅ API server responds at http://localhost:3001/api/health
- ✅ Settings page shows "Real API - Connected" 
- ✅ Actual modules and projects discovered
- ✅ Diagnostics show real system information

Both modes provide a complete, professional GUI for Flow State Dev with seamless switching between simulated and real data!