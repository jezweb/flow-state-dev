# Claude.md Templates Collection

## 1. AI Integration Project Template

```markdown
# Claude Project Instructions - AI Integration

## Project Overview
**Project Name**: [AI_PROJECT_NAME]
**Type**: AI Integration/Automation Tool
**AI Services**: [OpenAI/Claude/Gemini/Local LLM]
**Status**: [Development/Testing/Production]

## AI Configuration
```yaml
Primary AI:
  - Service: [OpenAI/Anthropic/Google]
  - Model: [gpt-4/claude-3/gemini-pro]
  - Context Window: [128k/200k]
  - Rate Limits: [TPM/RPM limits]

Vector Database:
  - Service: Qdrant
  - Embedding Model: [text-embedding-3-small]
  - Dimensions: [1536/768]
  - Collection: [collection_name]

AI Tools:
  - Workflow: n8n/Flowise
  - RAG: LangChain/LlamaIndex
  - Monitoring: Langfuse/Helicone
```

## API Keys & Endpoints
```env
# Never commit actual keys!
VITE_OPENAI_API_KEY=
VITE_ANTHROPIC_API_KEY=
VITE_QDRANT_URL=
VITE_QDRANT_API_KEY=
VITE_EMBEDDING_MODEL=
```

## AI Patterns & Best Practices

### Standard AI Call Pattern
```javascript
// composables/useAI.js
const { response, error, loading, tokens } = await useAI({
  prompt: userInput,
  system: "You are a helpful assistant",
  temperature: 0.7,
  maxTokens: 1000
})
```

### Vector Search Pattern
```javascript
// composables/useVectorSearch.js
const results = await searchVectors({
  query: "user question",
  limit: 5,
  scoreThreshold: 0.7
})
```

### Rate Limiting Strategy
- Implement exponential backoff
- Queue requests during high load
- Show user-friendly "thinking" states
- Cache common queries

## Prompt Engineering Guidelines
1. **System Prompts**: Store in `/prompts/system/`
2. **User Prompts**: Template with variables
3. **Few-shot Examples**: Keep in `/prompts/examples/`
4. **Version Control**: Track prompt changes

## Common AI Issues & Solutions

### Issue: Hallucinations in responses
**Solution**: 
- Add "only use provided context" to prompts
- Implement fact-checking layer
- Show confidence scores

### Issue: Token limit exceeded
**Solution**:
- Implement sliding window for context
- Summarize previous messages
- Use gpt-3.5-turbo for summaries

### Issue: Slow response times
**Solution**:
- Stream responses
- Show typing indicators
- Pre-generate common responses

## Testing AI Features
- [ ] Test with minimal context
- [ ] Test with maximum context
- [ ] Test rate limit handling
- [ ] Test error responses
- [ ] Test streaming vs batch
- [ ] Verify costs stay within budget

## Monitoring & Analytics
- Track token usage per user
- Monitor response times
- Log prompt/response pairs
- Track user satisfaction
- Alert on high costs

## Special AI Instructions
1. Always show thinking/processing states
2. Implement "Stop Generation" button
3. Save conversation history locally
4. Allow prompt editing/regeneration
5. Show token count and cost estimate
```

---

## 2. Chrome Extension Template

```markdown
# Claude Project Instructions - Chrome Extension

## Project Overview
**Extension Name**: [EXTENSION_NAME]
**Type**: Chrome Extension
**Manifest Version**: 3
**Purpose**: [What it does]
**Chrome Store URL**: [If published]

## Extension Architecture
```yaml
Structure:
  - Background: Service Worker (background.js)
  - Content Scripts: [injected scripts]
  - Popup: Vue 3 + Vuetify
  - Options Page: Settings management
  - Side Panel: [if applicable]

Permissions:
  - activeTab
  - storage
  - [other permissions]

APIs Used:
  - chrome.storage
  - chrome.tabs
  - chrome.runtime
  - [other APIs]
```

## Key Files Structure
```
extension/
├── manifest.json      # Extension configuration
├── background.js      # Service worker
├── content/          # Content scripts
│   ├── inject.js     # Main injection
│   └── styles.css    # Injected styles
├── popup/            # Popup UI (Vue app)
│   ├── App.vue
│   └── main.js
├── options/          # Options page
└── assets/           # Icons and images
```

## Development Workflow

### Local Development
```bash
# Build extension
npm run build:extension

# Watch mode for popup
npm run dev:popup

# Load unpacked in Chrome
# Navigate to: chrome://extensions/
# Enable Developer mode
# Click "Load unpacked"
```

### Critical Patterns

#### Message Passing
```javascript
// From content script to background
chrome.runtime.sendMessage({
  action: 'processData',
  data: pageData
})

// From popup to content script
chrome.tabs.sendMessage(tabId, {
  action: 'extractContent'
})
```

#### Storage Sync
```javascript
// Save data
await chrome.storage.sync.set({ key: value })

// Get data
const { key } = await chrome.storage.sync.get('key')
```

## Chrome Store Deployment
1. Create screenshots (1280x800)
2. Update version in manifest.json
3. Build production bundle
4. Create ZIP file
5. Upload to Chrome Developer Dashboard

## Common Extension Issues

### Issue: Content script not injecting
**Solution**: Check manifest matches patterns, verify permissions

### Issue: Service worker going inactive
**Solution**: Use alarms API for periodic tasks

### Issue: CORS errors in popup
**Solution**: Make requests from background script

## Testing Checklist
- [ ] Test on fresh Chrome profile
- [ ] Test with conflicting extensions
- [ ] Test all permissions work
- [ ] Test on different websites
- [ ] Verify memory usage
- [ ] Check for console errors
```

---

## 3. Supabase + Vue 3 SaaS Template

```markdown
# Claude Project Instructions - SaaS Application

## Project Overview
**App Name**: [SAAS_NAME]
**Type**: Multi-tenant SaaS
**Status**: [MVP/Growth/Scale]
**Pricing Model**: [Freemium/Subscription]
**Stripe Integration**: [Yes/No]

## Database Architecture
```yaml
Schema Design:
  - Multi-tenancy: Row Level Security (RLS)
  - Tenant field: organization_id
  - User relationship: many-to-many via memberships

Key Tables:
  - organizations (tenant root)
  - users (Supabase auth)
  - memberships (user <-> org)
  - subscriptions (Stripe sync)
  - [domain tables]

RLS Patterns:
  - Always filter by organization_id
  - Check membership status
  - Respect role permissions
```

## Authentication Flow
```javascript
// Standard auth check pattern
const { data: { session } } = await supabase.auth.getSession()
if (!session) return navigateTo('/login')

// Get user's organization
const { data: membership } = await supabase
  .from('memberships')
  .select('*, organizations(*)')
  .eq('user_id', session.user.id)
  .single()
```

## Subscription Management
```javascript
// Check subscription status
const hasActiveSubscription = computed(() => {
  return membership.value?.organization?.subscription_status === 'active'
})

// Feature gating
if (!hasActiveSubscription.value && feature === 'premium') {
  return navigateTo('/upgrade')
}
```

## Common SaaS Patterns

### Onboarding Flow
1. User signs up
2. Create organization
3. Set up profile
4. Invite team members
5. Start trial/subscription

### Billing Integration
```env
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_MONTHLY=
STRIPE_PRICE_ID_YEARLY=
```

### Email Notifications
- Welcome email
- Trial ending
- Payment failed
- Team invitations
- Weekly digests

## Multi-tenant Considerations
1. **Data Isolation**: RLS policies on all tables
2. **Performance**: Indexes on organization_id
3. **Backups**: Per-tenant export capability
4. **Customization**: Tenant-specific settings
5. **Analytics**: Aggregate without exposing tenant data

## Testing Multi-tenancy
- [ ] Create multiple test organizations
- [ ] Verify data isolation
- [ ] Test switching between orgs
- [ ] Verify RLS policies work
- [ ] Test subscription limits
- [ ] Check team permissions
```

---

## 4. n8n Workflow Integration Template

```markdown
# Claude Project Instructions - n8n Integration

## Project Overview
**Project Name**: [WORKFLOW_PROJECT]
**n8n Instance**: [Self-hosted/Cloud]
**Type**: Automation Platform Integration
**Webhook URL**: [Base webhook URL]

## n8n Configuration
```yaml
Workflows:
  - Data Processing: [workflow_id]
  - Email Automation: [workflow_id]
  - API Integration: [workflow_id]
  - Scheduled Tasks: [workflow_id]

Triggers:
  - Webhooks: [/webhook/xyz]
  - Cron: [schedules]
  - Email: [monitored inbox]
  - Database: [change detection]

Credentials:
  - Stored in n8n
  - Never in code
  - Use credential_id references
```

## Integration Patterns

### Trigger n8n Workflow
```javascript
// composables/useN8n.js
const triggerWorkflow = async (workflowId, data) => {
  const response = await fetch(`${N8N_URL}/webhook/${workflowId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return response.json()
}
```

### Webhook Security
```javascript
// Verify n8n webhook signature
const verifyWebhookSignature = (payload, signature) => {
  const hash = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')
  return hash === signature
}
```

## Common Workflows

### User Onboarding
1. Webhook receives new user data
2. Create records in multiple systems
3. Send welcome email sequence
4. Schedule follow-up tasks
5. Update CRM

### Data Sync
1. Schedule node runs hourly
2. Fetch data from API
3. Transform with Code node
4. Update Supabase
5. Send summary email

## n8n Best Practices
1. **Error Handling**: Use Error Trigger node
2. **Logging**: Send to logging service
3. **Testing**: Use Test Webhook URL
4. **Version Control**: Export workflows as JSON
5. **Documentation**: Comment complex nodes

## Debugging n8n Issues
- Check execution history
- Enable verbose logging
- Test nodes individually
- Verify credentials work
- Check rate limits
```

---

## 5. Netlify Functions (Serverless) Template

```markdown
# Claude Project Instructions - Netlify Functions

## Project Overview
**Project Name**: [SERVERLESS_PROJECT]
**Type**: Jamstack with Serverless Functions
**Functions Runtime**: Node.js 18.x
**Deploy Status**: [![Netlify Status](https://api.netlify.com/api/v1/badges/[id]/deploy-status)](link)

## Functions Structure
```
netlify/functions/
├── auth/              # Auth-related functions
│   ├── login.js
│   └── verify.js
├── api/               # API endpoints
│   ├── users.js
│   └── data.js
├── scheduled/         # Cron functions
│   └── daily-sync.js
└── _utils/            # Shared utilities
    ├── auth.js
    └── database.js
```

## Environment Configuration
```env
# Netlify Environment Variables
DATABASE_URL=
JWT_SECRET=
API_KEY=
WEBHOOK_SECRET=

# Function-specific
RATE_LIMIT_PER_MINUTE=60
FUNCTION_TIMEOUT=10
```

## Function Patterns

### Standard Function Template
```javascript
// netlify/functions/example.js
import { verifyAuth } from './_utils/auth.js'

export async function handler(event, context) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  }

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    // Auth check
    const user = await verifyAuth(event.headers.authorization)
    if (!user) {
      return { 
        statusCode: 401, 
        headers,
        body: JSON.stringify({ error: 'Unauthorized' })
      }
    }

    // Your logic here
    const result = await processRequest(event.body)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    }
  } catch (error) {
    console.error('Function error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}
```

### Scheduled Function
```javascript
// netlify/functions/scheduled-task.js
export async function handler(event, context) {
  // Verify Netlify trigger
  if (event.headers['x-netlify-event'] !== 'schedule') {
    return { statusCode: 401 }
  }

  // Run scheduled task
  await performScheduledWork()
  
  return { statusCode: 200 }
}

// netlify.toml
[[functions]]
  schedule = "0 0 * * *" # Daily at midnight
```

## Edge Functions
```javascript
// netlify/edge-functions/geo-redirect.js
export default async (request, context) => {
  const country = context.geo?.country?.code || 'US'
  
  if (country === 'AU') {
    return Response.redirect('https://au.example.com', 301)
  }
  
  return context.next()
}
```

## Common Issues & Solutions

### Issue: Function timeout
**Solution**: 
- Default timeout is 10s, max 26s
- Move heavy work to background functions
- Use streaming responses for large data

### Issue: Cold starts
**Solution**:
- Keep functions warm with scheduled pings
- Minimize dependencies
- Use ES modules

### Issue: CORS errors
**Solution**:
- Always handle OPTIONS
- Set headers on all responses
- Configure in netlify.toml

## Performance Optimization
1. Bundle functions with esbuild
2. Share code via _utils directory
3. Cache external API responses
4. Use connection pooling for DB
5. Implement request queuing

## Monitoring
- Netlify Function logs
- Custom error tracking
- Performance metrics
- Usage analytics
- Cost monitoring
```

---

## Quick Template Selector

Based on your project type, use:

1. **AI/LLM Integration** → Template #1
2. **Browser Extension** → Template #2  
3. **SaaS Application** → Template #3
4. **Automation/n8n** → Template #4
5. **Serverless/Netlify** → Template #5

You can also mix and match sections from different templates!