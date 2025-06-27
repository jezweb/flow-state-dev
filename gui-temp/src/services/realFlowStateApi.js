/**
 * Real Flow State Dev API Service
 * 
 * Connects to the Node.js server to provide actual CLI functionality
 */

class RealFlowStateAPI {
  constructor(baseURL = 'http://localhost:3001') {
    this.baseURL = baseURL;
    this.eventSource = null;
    this.progressCallback = null;
    this.errorCallback = null;
  }

  /**
   * Make HTTP request with error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}/api${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Connect to server-sent events for real-time updates
   */
  connectEvents(onProgress, onError) {
    if (this.eventSource) {
      this.eventSource.close();
    }

    this.progressCallback = onProgress;
    this.errorCallback = onError;

    try {
      this.eventSource = new EventSource(`${this.baseURL}/api/events`);
      
      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'progress':
              if (this.progressCallback) {
                this.progressCallback(data.data);
              }
              break;
            case 'error':
              if (this.errorCallback) {
                this.errorCallback(new Error(data.error));
              }
              break;
            case 'connected':
              console.log('Connected to API events');
              break;
          }
        } catch (error) {
          console.error('Failed to parse event data:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        if (this.errorCallback) {
          this.errorCallback(new Error('Connection to API lost'));
        }
      };
    } catch (error) {
      console.error('Failed to connect to events:', error);
    }
  }

  /**
   * Disconnect from events
   */
  disconnectEvents() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.progressCallback = null;
    this.errorCallback = null;
  }

  // Health and Status
  async getHealth() {
    return this.request('/health');
  }

  async getVersion() {
    return this.request('/version');
  }

  async getDiagnostics() {
    return this.request('/diagnostics');
  }

  // Modules API
  async getModules(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/modules?${params}`);
  }

  async getModule(name) {
    return this.request(`/modules/${encodeURIComponent(name)}`);
  }

  async getModuleCategories() {
    return this.request('/modules/categories');
  }

  async searchModules(query, options = {}) {
    const params = new URLSearchParams(options);
    return this.request(`/modules/search/${encodeURIComponent(query)}?${params}`);
  }

  // Projects API
  async getProjects(searchPaths = []) {
    const params = new URLSearchParams();
    if (searchPaths.length > 0) {
      params.set('paths', searchPaths.join(','));
    }
    return this.request(`/projects?${params}`);
  }

  async getRecentProjects() {
    return this.request('/projects/recent');
  }

  async getProjectInfo(projectPath) {
    return this.request(`/projects/${encodeURIComponent(projectPath)}/info`);
  }

  async createProject(projectName, options = {}) {
    return this.request('/projects/create', {
      method: 'POST',
      body: JSON.stringify({ projectName, options })
    });
  }

  async getPresets() {
    return this.request('/presets');
  }

  // Settings API
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(settings) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }
}

// Create singleton instance
const realApiInstance = new RealFlowStateAPI();

// Export API functions to match mock API interface
export async function getHealth() {
  return realApiInstance.getHealth();
}

export async function getVersion() {
  return realApiInstance.getVersion();
}

export async function getDiagnostics() {
  return realApiInstance.getDiagnostics();
}

export async function getModules(filters) {
  return realApiInstance.getModules(filters);
}

export async function getModule(name) {
  return realApiInstance.getModule(name);
}

export async function getModuleCategories() {
  return realApiInstance.getModuleCategories();
}

export async function searchModules(query, options) {
  return realApiInstance.searchModules(query, options);
}

export async function getProjects(searchPaths) {
  return realApiInstance.getProjects(searchPaths);
}

export async function getRecentProjects() {
  return realApiInstance.getRecentProjects();
}

export async function getProjectInfo(projectPath) {
  return realApiInstance.getProjectInfo(projectPath);
}

export async function createProject(projectName, options) {
  return realApiInstance.createProject(projectName, options);
}

export async function getPresets() {
  return realApiInstance.getPresets();
}

export async function getSettings() {
  return realApiInstance.getSettings();
}

export async function updateSettings(settings) {
  return realApiInstance.updateSettings(settings);
}

// Progress and event handling
export function onProgress(callback) {
  realApiInstance.connectEvents(callback, null);
}

export function onError(callback) {
  realApiInstance.connectEvents(null, callback);
}

export function onProgressAndError(onProgress, onError) {
  realApiInstance.connectEvents(onProgress, onError);
}

export function disconnect() {
  realApiInstance.disconnectEvents();
}

// Export the class for advanced usage
export { RealFlowStateAPI };

// Default export for consistency
export default realApiInstance;