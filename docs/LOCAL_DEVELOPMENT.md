# Local Supabase Development Guide

Flow State Dev now includes comprehensive support for local Supabase development, allowing you to develop faster with complete control over your database and services.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Setup Commands](#setup-commands)
- [Development Workflow](#development-workflow)
- [Environment Configuration](#environment-configuration)
- [Database Management](#database-management)
- [Troubleshooting](#troubleshooting)
- [Platform-Specific Notes](#platform-specific-notes)

## Prerequisites

Local Supabase development requires:
1. **Package Manager** - Homebrew (macOS/Linux) or Scoop (Windows)
2. **Docker** - For running Supabase services
3. **Supabase CLI** - For managing local development

## Quick Start

```bash
# 1. Set up local development tools
fsd setup-local

# 2. Initialize Supabase in your project
fsd supabase init

# 3. Start local Supabase
fsd supabase start

# 4. Start development
npm run dev:local
```

## Setup Commands

### `fsd setup-local`
Interactive setup wizard that:
- Detects your OS and installed tools
- Guides you through installing missing components
- Verifies everything is working correctly

### `fsd supabase <command>`
Manage your local Supabase instance:

```bash
fsd supabase init    # Initialize Supabase in project
fsd supabase start   # Start local Supabase
fsd supabase stop    # Stop local Supabase
fsd supabase status  # Check current status
fsd supabase reset   # Reset database to initial state
fsd supabase migrate # Run database migrations
fsd supabase seed    # Seed database with test data
```

## Development Workflow

### 1. Starting Fresh
```bash
# Create new project
fsd init my-app

# Set up local development
cd my-app
fsd setup-local
fsd supabase init

# Start developing
npm run dev:local
```

### 2. Daily Development
```bash
# Start everything
npm run dev:local

# Or start services separately
fsd supabase start
npm run dev
```

### 3. Database Changes
```bash
# Create a new migration
supabase migration new add_user_profiles

# Edit the migration file in supabase/migrations/

# Apply migrations
fsd supabase migrate

# Reset database if needed
fsd supabase reset
```

## Environment Configuration

### Local vs Remote Development

Flow State Dev projects support both local and remote Supabase:

#### Local Development (.env.local)
```env
# Local Supabase (default keys)
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Remote Development (.env)
```env
# Supabase Cloud
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
```

### Environment Priority
1. `.env.local` - Local overrides (gitignored)
2. `.env.[mode]` - Mode-specific (e.g., .env.production)
3. `.env` - Default values

## Database Management

### Migrations
Migrations are SQL files that define your database schema:

```sql
-- supabase/migrations/20240101000000_create_profiles.sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);
```

### Seeding Data
Create test data in `supabase/seed.sql`:

```sql
-- Insert test users (local development only!)
INSERT INTO auth.users (id, email, encrypted_password)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 
   'test@example.com', 
   crypt('password123', gen_salt('bf')));

-- Insert related data
INSERT INTO profiles (user_id, username)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'testuser');
```

### Useful Commands
```bash
# View current schema
supabase db dump

# Reset to clean state
fsd supabase reset

# Connect with psql
psql postgresql://postgres:postgres@localhost:54322/postgres
```

## Local Services

When running locally, you have access to:

### Supabase Studio
- **URL**: http://localhost:54323
- **Purpose**: Visual database management
- **Features**: Table editor, SQL editor, Auth management

### API Gateway
- **URL**: http://localhost:54321
- **Purpose**: REST and Realtime API
- **Usage**: Your app connects here

### Email Testing (Inbucket)
- **URL**: http://localhost:54324
- **Purpose**: Catch all test emails
- **Usage**: Test auth emails, password resets

### Database
- **URL**: postgresql://postgres:postgres@localhost:54322/postgres
- **Username**: postgres
- **Password**: postgres
- **Purpose**: Direct database access

## Troubleshooting

### Common Issues

#### Docker Not Running
```bash
# Check Docker status
docker ps

# Start Docker Desktop or alternative
# macOS: Open Docker Desktop app
# Linux: sudo systemctl start docker
```

#### Port Conflicts
```bash
# Check what's using Supabase ports
lsof -i :54321,54322,54323,54324

# Stop conflicting services or use different ports
```

#### Permission Errors
```bash
# Linux/macOS: Add user to docker group
sudo usermod -aG docker $USER

# Then log out and back in
```

#### Supabase Won't Start
```bash
# Clean up and restart
fsd supabase stop
docker system prune -a  # Warning: removes all Docker data
fsd supabase start
```

### Platform-Specific Notes

#### macOS
- Docker Desktop is recommended
- Alternatives: OrbStack (paid), Colima (free)
- If using Colima: `colima start` before using Supabase

#### Windows
- Use WSL2 for best performance
- Docker Desktop required
- Run commands in WSL2 terminal

#### Linux
- Native Docker support
- May need to configure systemd
- Check firewall rules for ports

## Best Practices

### 1. **Use Local for Development**
- Faster iteration
- No internet required
- Safe to experiment

### 2. **Keep Migrations Clean**
- One change per migration
- Name migrations descriptively
- Test rollbacks

### 3. **Environment Separation**
- Never commit `.env.local`
- Use different Supabase projects for staging/production
- Keep local seeds separate from production data

### 4. **Regular Resets**
- Reset database regularly during development
- Ensures migrations work from scratch
- Catches dependency issues early

### 5. **Document Everything**
- Add comments to migrations
- Document RLS policies
- Keep README updated

## Advanced Usage

### Custom Docker Configuration
Create `supabase/config.toml` for custom settings:

```toml
[api]
port = 54321
schemas = ["public", "custom"]

[db]
port = 54322
max_connections = 200

[studio]
port = 54323
```

### Multiple Projects
Run multiple Supabase instances:

```bash
# Project 1
cd project1
supabase start

# Project 2 (different ports)
cd project2
supabase start --port 54331
```

### Production Parity
Ensure local matches production:

```bash
# Pull remote schema
supabase db pull

# Generate types
supabase gen types typescript > src/types/supabase.ts
```

## Integration with Claude Code

When using Claude Code with local Supabase:

1. **Update CLAUDE.md** with local URLs
2. **Pre-approve commands** in `.claude/settings.json`
3. **Document local setup** in project README

Claude Code can now:
- Run migrations directly
- Modify database schema
- Test edge functions locally
- Debug auth flows

## Next Steps

1. Run `fsd setup-local` to get started
2. Initialize Supabase in your project
3. Start building with full local control
4. Check `fsd doctor` for health status

For more help:
- Run `fsd supabase --help`
- Check [Supabase Docs](https://supabase.com/docs)
- Open an issue on GitHub