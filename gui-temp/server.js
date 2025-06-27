#!/usr/bin/env node

/**
 * API Server for Flow State Dev GUI
 * 
 * Exposes the CLI API functionality as HTTP endpoints for the browser-based GUI
 */

import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlowStateAPI } from '../lib/api/flow-state-api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Initialize Flow State API
const flowStateApi = new FlowStateAPI();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'dist')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    api: flowStateApi.getStatus()
  });
});

// Version info
app.get('/api/version', async (req, res) => {
  try {
    const version = await flowStateApi.getVersion();
    res.json(version);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Modules endpoints
app.get('/api/modules', async (req, res) => {
  try {
    const filters = req.query;
    const modules = await flowStateApi.getModules(filters);
    res.json(modules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/modules/categories', async (req, res) => {
  try {
    const categories = await flowStateApi.modules.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/modules/:name', async (req, res) => {
  try {
    const module = await flowStateApi.modules.get(req.params.name);
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }
    res.json(module);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/modules/search/:query', async (req, res) => {
  try {
    const results = await flowStateApi.modules.search(req.params.query, req.query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Projects endpoints
app.get('/api/projects', async (req, res) => {
  try {
    const searchPaths = req.query.paths ? req.query.paths.split(',') : undefined;
    const projects = await flowStateApi.projects.scan({ paths: searchPaths });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/projects/recent', async (req, res) => {
  try {
    const projects = await flowStateApi.projects.list();
    // Sort by last modified and take the most recent
    const recent = projects
      .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
      .slice(0, 10);
    res.json(recent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/projects/:path/info', async (req, res) => {
  try {
    const projectPath = decodeURIComponent(req.params.path);
    const projectInfo = await flowStateApi.projects.get(projectPath);
    if (!projectInfo) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(projectInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Project creation endpoints
app.get('/api/presets', async (req, res) => {
  try {
    const presets = await flowStateApi.getPresets();
    res.json(presets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projects/create', async (req, res) => {
  try {
    const { projectName, options } = req.body;
    if (!projectName) {
      return res.status(400).json({ error: 'Project name is required' });
    }
    
    const result = await flowStateApi.createProject(projectName, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Diagnostics endpoints
app.get('/api/diagnostics', async (req, res) => {
  try {
    const diagnostics = await flowStateApi.runDiagnostics();
    res.json(diagnostics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Settings endpoints
app.get('/api/settings', (req, res) => {
  // For now, return basic settings from localStorage equivalent
  const defaultSettings = {
    darkMode: false,
    searchPaths: [
      join(process.env.HOME || process.env.USERPROFILE, 'claude'),
      join(process.env.HOME || process.env.USERPROFILE, 'projects'),
      join(process.env.HOME || process.env.USERPROFILE, 'dev')
    ],
    editor: 'vscode',
    terminal: 'default',
    notifications: true,
    autoSave: true
  };
  
  res.json(defaultSettings);
});

app.put('/api/settings', (req, res) => {
  // For now, just acknowledge the update
  res.json({ success: true, settings: req.body });
});

// WebSocket-like endpoint for progress updates
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

  // Listen for API events
  const handleProgress = (data) => {
    res.write(`data: ${JSON.stringify({ type: 'progress', data })}\n\n`);
  };

  const handleError = (error) => {
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
  };

  flowStateApi.on('progress', handleProgress);
  flowStateApi.on('error', handleError);

  // Cleanup on disconnect
  req.on('close', () => {
    flowStateApi.off('progress', handleProgress);
    flowStateApi.off('error', handleError);
  });
});

// Serve GUI at root
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// Initialize API and start server
async function startServer() {
  try {
    console.log('Initializing Flow State Dev API...');
    await flowStateApi.initialize();
    
    app.listen(port, () => {
      console.log(`Flow State Dev GUI Server running at http://localhost:${port}`);
      console.log(`API endpoints available at http://localhost:${port}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();