# Extended Claude.md Templates Collection

## 6. WordPress Plugin Template

```markdown
# Claude Project Instructions - WordPress Plugin

## Project Overview
**Plugin Name**: [PLUGIN_NAME]
**Text Domain**: [plugin-slug]
**Type**: WordPress Plugin
**Min WP Version**: 6.0
**Min PHP Version**: 7.4
**Repository**: [SVN/Git URL]

## Plugin Structure
```
plugin-name/
├── plugin-name.php      # Main plugin file
├── includes/           # Core plugin files
│   ├── class-plugin.php
│   ├── class-activator.php
│   └── class-deactivator.php
├── admin/             # Admin functionality
│   ├── class-admin.php
│   ├── js/
│   └── css/
├── public/            # Frontend files
│   ├── class-public.php
│   ├── js/
│   └── css/
├── assets/            # Images, fonts
├── languages/         # Translation files
└── readme.txt         # WordPress.org readme
```

## Plugin Header
```php
/**
 * Plugin Name:       My Plugin Name
 * Plugin URI:        https://example.com/plugin
 * Description:       Brief description
 * Version:           1.0.0
 * Author:            Jez (Jeremy Dawes)
 * Author URI:        https://jezweb.com.au
 * License:           GPL-2.0+
 * Text Domain:       plugin-slug
 * Domain Path:       /languages
 */
```

## Key WordPress Patterns

### Activation/Deactivation
```php
register_activation_hook(__FILE__, [$this, 'activate']);
register_deactivation_hook(__FILE__, [$this, 'deactivate']);
```

### Hooks Pattern
```php
// Actions
add_action('init', [$this, 'init_function']);
add_action('wp_enqueue_scripts', [$this, 'enqueue_scripts']);

// Filters
add_filter('the_content', [$this, 'filter_content'], 10, 1);
```

### AJAX Handler
```php
// JavaScript
jQuery.ajax({
    url: ajaxurl,
    type: 'POST',
    data: {
        action: 'my_plugin_action',
        nonce: my_plugin_ajax.nonce,
        data: someData
    }
});

// PHP
add_action('wp_ajax_my_plugin_action', [$this, 'handle_ajax']);
add_action('wp_ajax_nopriv_my_plugin_action', [$this, 'handle_ajax']);
```

### Database Operations
```php
global $wpdb;
$table_name = $wpdb->prefix . 'my_plugin_table';

// Create table on activation
$charset_collate = $wpdb->get_charset_collate();
$sql = "CREATE TABLE $table_name (
    id mediumint(9) NOT NULL AUTO_INCREMENT,
    time datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
    PRIMARY KEY  (id)
) $charset_collate;";
require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
dbDelta($sql);
```

## Security Best Practices
1. **Nonces**: Always verify nonces
```php
if (!wp_verify_nonce($_POST['nonce'], 'my_plugin_nonce')) {
    wp_die('Security check failed');
}
```

2. **Capabilities**: Check user permissions
```php
if (!current_user_can('manage_options')) {
    return;
}
```

3. **Data Sanitization**:
```php
$safe_text = sanitize_text_field($_POST['text']);
$safe_html = wp_kses_post($_POST['html']);
$safe_sql = $wpdb->prepare("SELECT * FROM table WHERE id = %d", $id);
```

## Admin Pages
```php
// Add menu
add_action('admin_menu', function() {
    add_menu_page(
        'Plugin Title',
        'Menu Title',
        'manage_options',
        'plugin-slug',
        [$this, 'admin_page'],
        'dashicons-admin-generic',
        30
    );
});

// Settings API
register_setting('my_plugin_settings', 'my_plugin_options');
add_settings_section('section_id', 'Section Title', null, 'plugin-slug');
add_settings_field('field_id', 'Field Label', [$this, 'field_callback'], 'plugin-slug', 'section_id');
```

## Common Issues & Solutions

### Issue: White screen of death
**Solution**: Enable WP_DEBUG, check PHP error logs

### Issue: Plugin conflicts
**Solution**: Use unique prefixes, namespace your code

### Issue: Performance issues
**Solution**: Use transients for caching, optimize queries

## Testing Checklist
- [ ] Test on minimum WP/PHP versions
- [ ] Check with popular plugins (WooCommerce, Yoast)
- [ ] Validate with Plugin Check plugin
- [ ] Test multisite compatibility
- [ ] Verify uninstall cleanup
- [ ] Check accessibility (WCAG)

## Deployment
1. Update version in main file and readme
2. Update changelog in readme.txt
3. Tag in Git
4. Deploy to WordPress.org SVN
5. Create ZIP for manual distribution
```

---

## 7. TypeScript MCP Server (Model Context Protocol) Template

```markdown
# Claude Project Instructions - MCP Server

## Project Overview
**Server Name**: [MCP_SERVER_NAME]
**Type**: Model Context Protocol Server
**Protocol**: SSE (Server-Sent Events) / WebSocket
**Purpose**: [Context provider for AI models]
**npm Package**: [@username/mcp-server-name]

## MCP Architecture
```yaml
Transport:
  - Type: SSE/WebSocket
  - Port: 3000
  - Auth: Bearer token

Resources:
  - Documents: File system access
  - Databases: Query interfaces
  - APIs: External service bridges
  - Tools: Executable functions

Protocol:
  - Version: 1.0
  - Encoding: JSON-RPC 2.0
  - Streaming: SSE for updates
```

## Project Structure
```
mcp-server/
├── src/
│   ├── server.ts         # Main server entry
│   ├── handlers/         # Request handlers
│   ├── resources/        # Resource providers
│   ├── tools/           # Tool implementations
│   ├── transport/       # SSE/WebSocket logic
│   └── types.ts         # TypeScript types
├── dist/                # Compiled output
├── tests/
├── package.json
└── tsconfig.json
```

## TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## SSE Implementation
```typescript
// transport/sse.ts
import { Response } from 'express';

export class SSETransport {
  private clients: Map<string, Response> = new Map();

  addClient(clientId: string, res: Response) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    
    this.clients.set(clientId, res);
    
    // Send initial connection event
    this.sendEvent(clientId, 'connected', { clientId });
  }

  sendEvent(clientId: string, event: string, data: any) {
    const client = this.clients.get(clientId);
    if (client) {
      client.write(`event: ${event}\n`);
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  }

  broadcast(event: string, data: any) {
    this.clients.forEach((client) => {
      client.write(`event: ${event}\n`);
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    });
  }
}
```

## MCP Protocol Handler
```typescript
// handlers/protocol.ts
interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export class ProtocolHandler {
  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    try {
      switch (request.method) {
        case 'initialize':
          return this.handleInitialize(request);
        case 'resources/list':
          return this.handleListResources(request);
        case 'tools/call':
          return this.handleToolCall(request);
        default:
          throw new Error(`Unknown method: ${request.method}`);
      }
    } catch (error) {
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32603,
          message: error.message
        }
      };
    }
  }
}
```

## Resource Provider Pattern
```typescript
// resources/filesystem.ts
export class FileSystemResource {
  async list(path: string): Promise<Resource[]> {
    // Implementation
  }

  async read(uri: string): Promise<string> {
    // Implementation
  }

  async watch(uri: string, callback: (event: any) => void) {
    // Set up file watcher
  }
}
```

## Testing MCP Server
```typescript
// tests/server.test.ts
describe('MCP Server', () => {
  it('should handle initialize request', async () => {
    const response = await request(app)
      .post('/rpc')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: { capabilities: {} }
      });
    
    expect(response.body.result).toHaveProperty('capabilities');
  });
});
```

## Common Issues & Solutions

### Issue: SSE connection drops
**Solution**: Implement heartbeat, handle reconnection

### Issue: Large payloads
**Solution**: Implement chunking, use compression

### Issue: Type safety
**Solution**: Generate types from protocol schema

## Deployment
- Package as npm module
- Provide CLI interface
- Docker container option
- Integration examples
```

---

## 8. n8n Node Template

```markdown
# Claude Project Instructions - n8n Node

## Project Overview
**Node Name**: [N8N_NODE_NAME]
**Type**: n8n Custom Node
**Category**: [Data Transformation/Communication/etc]
**Version**: 1.0.0
**n8n Version**: >=1.0.0

## Node Structure
```
n8n-nodes-[name]/
├── nodes/
│   ├── [NodeName]/
│   │   ├── [NodeName].node.ts
│   │   ├── [NodeName].node.json
│   │   └── [nodeName].svg
│   └── shared/
│       └── GenericFunctions.ts
├── credentials/
│   └── [NodeName]Api.credentials.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Node Class Structure
```typescript
import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';

export class MyNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'My Node',
    name: 'myNode',
    icon: 'file:myNode.svg',
    group: ['transform'],
    version: 1,
    description: 'Node description',
    defaults: {
      name: 'My Node',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'myNodeApi',
        required: true,
      },
    ],
    properties: [
      // Node properties
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        // Process each item
        const newItem = {
          json: {},
          binary: {},
        };
        returnData.push(newItem);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: error.message } });
          continue;
        }
        throw new NodeOperationError(this.getNode(), error);
      }
    }

    return [returnData];
  }
}
```

## Credentials Implementation
```typescript
import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class MyNodeApi implements ICredentialType {
  name = 'myNodeApi';
  displayName = 'My Node API';
  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '={{$credentials.apiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: 'https://api.example.com',
      url: '/test',
    },
  };
}
```

## Common Patterns

### HTTP Requests
```typescript
const options: IHttpRequestOptions = {
  method: 'GET',
  url: 'https://api.example.com/data',
  headers: {
    Accept: 'application/json',
  },
  qs: {
    param: value,
  },
};

const response = await this.helpers.httpRequest(options);
```

### Error Handling
```typescript
try {
  // Operation
} catch (error) {
  if (error.response?.status === 404) {
    throw new NodeOperationError(
      this.getNode(),
      'Resource not found',
      { itemIndex: i }
    );
  }
  throw error;
}
```

### Options Pattern
```typescript
properties: [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new record',
        action: 'Create a record',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a record',
        action: 'Get a record',
      },
    ],
    default: 'get',
  },
  // Conditional fields based on operation
  {
    displayName: 'Fields',
    name: 'fields',
    type: 'string',
    displayOptions: {
      show: {
        operation: ['get'],
      },
    },
    default: '',
  },
]
```

## Testing
```json
// package.json scripts
{
  "scripts": {
    "dev": "n8n start --tunnel",
    "build": "tsc",
    "lint": "eslint nodes credentials --ext .ts",
    "test": "jest"
  }
}
```

## Publishing
1. Build the node: `npm run build`
2. Test locally: `npm link`
3. In n8n: `npm link n8n-nodes-[name]`
4. Publish: `npm publish`
5. Install: `n8n-node-[name]`

## Common Issues

### Issue: Node not appearing
**Solution**: Check package.json n8n configuration

### Issue: Credentials not working
**Solution**: Verify credential test endpoint

### Issue: Memory issues with large data
**Solution**: Use streaming, process in batches
```

---

## 9. React Native Phone App Template

```markdown
# Claude Project Instructions - React Native App

## Project Overview
**App Name**: [APP_NAME]
**Bundle ID**: com.jezweb.[appname]
**Type**: React Native (Expo/Bare)
**Target Platforms**: iOS 14+ / Android 8+
**State Management**: Redux Toolkit / Zustand
**Navigation**: React Navigation 6

## Project Structure
```
app-name/
├── src/
│   ├── screens/          # Screen components
│   ├── components/       # Reusable components
│   ├── navigation/       # Navigation setup
│   ├── services/         # API/external services
│   ├── store/           # State management
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Utilities
│   └── types/           # TypeScript types
├── assets/              # Images, fonts
├── ios/                 # iOS specific
├── android/             # Android specific
└── app.json            # Expo config
```

## Development Setup
```bash
# Install dependencies
npm install

# iOS setup
cd ios && pod install

# Run on iOS
npm run ios

# Run on Android
npm run android

# Expo (if using)
expo start
```

## Navigation Setup
```typescript
// navigation/AppNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

## State Management Pattern
```typescript
// store/userSlice.ts (Redux Toolkit)
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    isLoading: false,
  },
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
  },
});

// hooks/useAuth.ts
export const useAuth = () => {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  
  return {
    user,
    login: async (credentials) => {
      // Login logic
    },
  };
};
```

## API Integration
```typescript
// services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: Config.API_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Platform-Specific Code
```typescript
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.select({
      ios: 20,
      android: 0,
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
```

## Common Native Modules
```typescript
// Permissions
import { request, PERMISSIONS } from 'react-native-permissions';

// Camera
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

// Push Notifications
import messaging from '@react-native-firebase/messaging';

// Biometrics
import TouchID from 'react-native-touch-id';
```

## Testing
```typescript
// __tests__/App.test.tsx
import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';
import App from '../App';

it('renders correctly', () => {
  renderer.create(<App />);
});
```

## Build & Deployment

### iOS
```bash
# Build for TestFlight
cd ios
fastlane beta

# Archive in Xcode
# Product > Archive
```

### Android
```bash
# Build APK
cd android
./gradlew assembleRelease

# Build AAB
./gradlew bundleRelease
```

## Common Issues & Solutions

### Issue: Metro bundler issues
**Solution**: Clear cache: `npx react-native start --reset-cache`

### Issue: iOS build fails
**Solution**: Clean build: `cd ios && rm -rf build && pod install`

### Issue: Android Gradle issues
**Solution**: `cd android && ./gradlew clean`

## Performance Optimization
1. Use FlatList for long lists
2. Implement memo and useCallback
3. Optimize images (use WebP)
4. Enable Hermes on Android
5. Use lazy loading for screens
```

---

## 10. React Vite Web App Template

```markdown
# Claude Project Instructions - React Vite App

## Project Overview
**App Name**: [REACT_APP_NAME]
**Type**: React SPA with Vite
**React Version**: 18.3.x
**UI Library**: [MUI/Ant Design/Tailwind]
**State**: [Zustand/Redux Toolkit/TanStack Query]
**Deployment**: [Netlify/Vercel]

## Project Structure
```
react-app/
├── src/
│   ├── components/      # Reusable components
│   │   ├── common/     # Buttons, inputs, etc
│   │   └── layout/     # Header, footer, etc
│   ├── pages/          # Route pages
│   ├── hooks/          # Custom hooks
│   ├── services/       # API services
│   ├── store/          # State management
│   ├── utils/          # Helpers
│   ├── types/          # TypeScript types
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
├── vite.config.ts
└── package.json
```

## Vite Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
```

## Routing Setup
```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Lazy load pages
const HomePage = lazy(() => import('@pages/HomePage'));
const DashboardPage = lazy(() => import('@pages/DashboardPage'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

## State Management (Zustand)
```typescript
// store/useAppStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  setUser: (user: User | null) => void;
  toggleTheme: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        theme: 'light',
        setUser: (user) => set({ user }),
        toggleTheme: () => set((state) => ({ 
          theme: state.theme === 'light' ? 'dark' : 'light' 
        })),
      }),
      { name: 'app-store' }
    )
  )
);
```

## API Integration with TanStack Query
```typescript
// hooks/useApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@services/api';

export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => api.getUser(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.updateUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user', data.id] });
    },
  });
};
```

## Component Pattern
```typescript
// components/common/DataTable.tsx
import { memo } from 'react';

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
}

export const DataTable = memo(<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
}: DataTableProps<T>) => {
  return (
    <table>
      {/* Table implementation */}
    </table>
  );
});

DataTable.displayName = 'DataTable';
```

## Testing Setup
```typescript
// __tests__/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@components/common/Button';

describe('Button', () => {
  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Environment Variables
```env
# .env.development
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=My React App
VITE_ENABLE_ANALYTICS=false

# .env.production
VITE_API_URL=https://api.production.com
VITE_APP_NAME=My React App
VITE_ENABLE_ANALYTICS=true
```

## Common Patterns

### Error Boundary
```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends Component {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error caught:', error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

## Performance Optimization
1. Code splitting with lazy()
2. Memoization with memo, useMemo, useCallback
3. Virtual scrolling for long lists
4. Image optimization with lazy loading
5. Bundle analysis with rollup-plugin-visualizer

## Deployment
```yaml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
```

---

## 11. AI Web App (Vue + Supabase + Flowise) Template

```markdown
# Claude Project Instructions - AI Web App

## Project Overview
**App Name**: [AI_APP_NAME]
**Type**: AI-Powered Vue Application
**Stack**: Vue 3 + Vuetify 3 + Supabase + Flowise
**AI Features**: [Chat/Analysis/Generation/etc]
**Flowise URL**: [http://localhost:3000]

## Architecture Overview
```yaml
Frontend:
  - Vue 3 with Composition API
  - Vuetify 3 for UI
  - Pinia for state

Backend:
  - Supabase for auth/database
  - Flowise for AI workflows
  - Edge Functions for processing

AI Pipeline:
  - Flowise chains/agents
  - Vector storage in Supabase
  - Embeddings with pgvector
  - Rate limiting with Redis
```

## Database Schema
```sql
-- Enable vector extension
create extension if not exists vector;

-- Conversations table
create table conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Messages table
create table messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations on delete cascade,
  role text check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb,
  created_at timestamp with time zone default now()
);

-- Document embeddings
create table document_sections (
  id uuid default gen_random_uuid() primary key,
  document_id uuid not null,
  content text,
  embedding vector(1536),
  metadata jsonb,
  created_at timestamp with time zone default now()
);

-- Create embedding search function
create function match_document_sections(
  embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  similarity float
)
language sql stable
as $$
  select
    id,
    content,
    1 - (document_sections.embedding <=> embedding) as similarity
  from document_sections
  where 1 - (document_sections.embedding <=> embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;
```

## Flowise Integration
```typescript
// services/flowise.ts
export class FlowiseService {
  private baseUrl = import.meta.env.VITE_FLOWISE_URL;
  private apiKey = import.meta.env.VITE_FLOWISE_API_KEY;

  async predict(flowId: string, input: string, overrides?: any) {
    const response = await fetch(`${this.baseUrl}/api/v1/prediction/${flowId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        question: input,
        overrideConfig: overrides
      })
    });

    if (!response.ok) throw new Error('Flowise request failed');
    
    // Handle streaming response
    if (response.headers.get('content-type')?.includes('text/event-stream')) {
      return this.handleStream(response);
    }
    
    return response.json();
  }

  private async handleStream(response: Response) {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    return {
      async *[Symbol.asyncIterator]() {
        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              yield JSON.parse(line.slice(6));
            }
          }
        }
      }
    };
  }
}
```

## Vue Components

### AI Chat Component
```vue
<!-- components/AIChat.vue -->
<template>
  <v-container>
    <v-card>
      <v-card-text class="chat-container" ref="chatContainer">
        <div v-for="message in messages" :key="message.id">
          <ChatMessage 
            :message="message" 
            :is-streaming="message.id === streamingId"
          />
        </div>
      </v-card-text>
      
      <v-card-actions>
        <v-text-field
          v-model="input"
          @keydown.enter="sendMessage"
          :disabled="isLoading"
          placeholder="Ask anything..."
          variant="outlined"
          density="compact"
        >
          <template #append-inner>
            <v-btn 
              @click="sendMessage"
              :loading="isLoading"
              icon="mdi-send"
              size="small"
            />
          </template>
        </v-text-field>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { useAIStore } from '@/stores/ai';
import { storeToRefs } from 'pinia';

const aiStore = useAIStore();
const { messages, isLoading, streamingId } = storeToRefs(aiStore);

const input = ref('');
const chatContainer = ref(null);

async function sendMessage() {
  if (!input.value.trim() || isLoading.value) return;
  
  const userMessage = input.value;
  input.value = '';
  
  await aiStore.sendMessage(userMessage);
  
  // Auto-scroll to bottom
  await nextTick();
  chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
}
</script>
```

### AI Store (Pinia)
```typescript
// stores/ai.ts
export const useAIStore = defineStore('ai', () => {
  const messages = ref<Message[]>([]);
  const isLoading = ref(false);
  const streamingId = ref<string | null>(null);
  const flowise = new FlowiseService();
  const supabase = useSupabase();

  async function sendMessage(content: string) {
    isLoading.value = true;
    
    // Add user message
    const userMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    messages.value.push(userMessage);
    
    // Create assistant message placeholder
    const assistantMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };
    messages.value.push(assistantMessage);
    streamingId.value = assistantMessage.id;
    
    try {
      // Get relevant context from vector store
      const context = await searchRelevantContext(content);
      
      // Stream response from Flowise
      const stream = await flowise.predict(
        import.meta.env.VITE_FLOWISE_CHATFLOW_ID,
        content,
        { context }
      );
      
      for await (const chunk of stream) {
        const message = messages.value.find(m => m.id === assistantMessage.id);
        if (message) {
          message.content += chunk.token;
        }
      }
      
      // Save to database
      await saveConversation(userMessage, assistantMessage);
      
    } catch (error) {
      console.error('AI Error:', error);
      const message = messages.value.find(m => m.id === assistantMessage.id);
      if (message) {
        message.content = 'Sorry, I encountered an error. Please try again.';
      }
    } finally {
      isLoading.value = false;
      streamingId.value = null;
    }
  }
  
  return {
    messages,
    isLoading,
    streamingId,
    sendMessage
  };
});
```

## Document Processing
```typescript
// utils/documents.ts
export async function processDocument(file: File) {
  // 1. Upload to Supabase Storage
  const { data: upload } = await supabase.storage
    .from('documents')
    .upload(`${userId}/${file.name}`, file);
    
  // 2. Extract text (using edge function)
  const { data: extracted } = await supabase.functions
    .invoke('extract-text', { body: { path: upload.path } });
    
  // 3. Create embeddings
  const chunks = splitIntoChunks(extracted.text);
  const embeddings = await createEmbeddings(chunks);
  
  // 4. Store in vector database
  const { error } = await supabase
    .from('document_sections')
    .insert(
      chunks.map((chunk, i) => ({
        document_id: documentId,
        content: chunk,
        embedding: embeddings[i],
        metadata: { filename: file.name }
      }))
    );
}
```

## Rate Limiting
```typescript
// middleware/rateLimit.ts
const rateLimiter = new Map();

export function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimits = rateLimiter.get(userId) || [];
  
  // Clean old entries (older than 1 minute)
  const recentRequests = userLimits.filter(
    time => now - time < 60000
  );
  
  if (recentRequests.length >= 10) {
    return false; // Rate limit exceeded
  }
  
  recentRequests.push(now);
  rateLimiter.set(userId, recentRequests);
  return true;
}
```

## Performance Optimization
1. **Streaming responses** for better UX
2. **Vector caching** for repeated queries
3. **Conversation summarization** for context management
4. **Lazy loading** previous conversations
5. **Web Workers** for embedding generation

## Monitoring & Analytics
```typescript
// Track AI usage
await supabase.from('ai_usage').insert({
  user_id,
  tokens_used,
  model,
  cost_estimate,
  response_time,
  flow_id
});
```

## Common Issues & Solutions

### Issue: Slow initial response
**Solution**: Implement "thinking" animation, pre-warm Flowise

### Issue: Context window limits
**Solution**: Implement sliding window, summarize old messages

### Issue: Embedding search accuracy
**Solution**: Tune similarity threshold, implement reranking
```

---

## Quick Reference Guide

| Project Type | Key Technologies | Best For |
|-------------|------------------|----------|
| **WordPress Plugin** | PHP, WordPress Hooks, MySQL | Content management extensions |
| **MCP Server** | TypeScript, SSE, JSON-RPC | AI model context providers |
| **n8n Node** | TypeScript, n8n SDK | Workflow automation |
| **React Native** | React, Expo, Native APIs | Cross-platform mobile apps |
| **React Vite** | React 18, Vite, TanStack Query | Modern web applications |
| **AI Web App** | Vue 3, Supabase, Flowise | AI-powered applications |

## Combining Templates

For complex projects, combine sections:
- AI Web App + MCP Server = AI app with custom context
- React Vite + n8n Node = Web app with automation
- WordPress + n8n = WordPress automation plugin