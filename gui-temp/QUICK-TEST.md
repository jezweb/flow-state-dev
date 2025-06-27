# Quick Test Guide for Flow State Dev GUI

## 🚀 Immediate Testing (No Node.js Required)

Open the static test file to verify GUI components work:

```bash
# Open test file in browser
open gui-temp/test-gui.html
# or navigate to: file:///path/to/flow-state-dev/gui-temp/test-gui.html
```

This provides a basic verification that the GUI components are functional.

## ⚡ Mock API Mode (Recommended Start)

When Node.js is available:

```bash
cd gui-temp

# Install dependencies (one time)
npm install

# Start mock mode (no server needed)
npm run dev

# Visit: http://localhost:5173
```

### Mock Mode Test Checklist:
- [ ] GUI loads without errors
- [ ] Navigate to all views (Home, Create, Modules, Projects, Diagnostics, Settings)
- [ ] Settings page shows "Mock API - Connected"
- [ ] Mock project data displays in Projects view
- [ ] Mock modules display in Modules view
- [ ] Create project wizard works with progress simulation
- [ ] Diagnostics shows mock system information
- [ ] Dark mode toggle works
- [ ] Keyboard shortcuts work (Ctrl+K for search, F1 for help)

## 🔥 Real API Mode (Full Integration)

```bash
cd gui-temp

# Start both GUI and API server
npm run dev:real

# Visit: http://localhost:5173
```

### Real API Mode Test Checklist:
- [ ] GUI loads without errors
- [ ] Settings page shows "Real API - Connected"
- [ ] Projects view shows actual projects from filesystem
- [ ] Modules view shows real CLI modules
- [ ] Diagnostics shows actual system information
- [ ] Project creation creates real projects
- [ ] All mock features also work in real mode

## 🧪 API Health Check

Test the API server directly:

```bash
# Test server endpoints
curl http://localhost:3001/api/health
curl http://localhost:3001/api/version
curl http://localhost:3001/api/modules
```

## 🔍 Troubleshooting

### Common Issues:

**"Cannot GET /"** 
- Server is running but GUI not built
- Run: `npm run build` then `npm run start`

**Connection errors in Settings**
- Check if API server is running on port 3001
- Verify .env file has correct VITE_USE_REAL_API setting

**Import errors in browser console**
- Clear browser cache
- Check all files are properly saved
- Restart development server

## ✅ Success Indicators

### Mock Mode Success:
- Browser console shows: "Using mock API"
- Settings page: "Mock API - Connected" with green indicator
- All views load with sample data
- No network errors in browser DevTools

### Real API Mode Success:
- Browser console shows: "Using real API" and "Real API connection established"
- Settings page: "Real API - Connected" with green indicator
- API server responds at http://localhost:3001/api/health
- Projects view shows actual filesystem projects
- Modules view shows real CLI modules

Both modes provide full GUI functionality - mock mode uses simulated data while real mode connects to the actual Flow State Dev CLI.