# API Documentation

## Overview

This application uses Supabase as the backend, which provides:
- RESTful API automatically generated from your database
- Real-time subscriptions via WebSockets
- Authentication endpoints
- Storage API for file uploads

## Base Configuration

```javascript
// src/services/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Authentication Endpoints

### Sign Up
```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
  options: {
    data: {
      first_name: 'John',
      last_name: 'Doe'
    }
  }
})
```

### Sign In
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password'
})
```

### Sign Out
```javascript
const { error } = await supabase.auth.signOut()
```

### Get Current User
```javascript
const { data: { user } } = await supabase.auth.getUser()
```

## Database Operations

### Querying Data

#### Select All
```javascript
const { data, error } = await supabase
  .from('posts')
  .select('*')
```

#### Select Specific Columns
```javascript
const { data, error } = await supabase
  .from('posts')
  .select('id, title, created_at')
```

#### With Filters
```javascript
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('status', 'published')
  .gte('created_at', '2024-01-01')
  .order('created_at', { ascending: false })
  .limit(10)
```

#### With Joins
```javascript
const { data, error } = await supabase
  .from('posts')
  .select(`
    *,
    author:user_id (
      id,
      name,
      avatar_url
    ),
    comments (
      id,
      content,
      created_at
    )
  `)
```

### Creating Data

```javascript
const { data, error } = await supabase
  .from('posts')
  .insert({
    title: 'New Post',
    content: 'Post content',
    user_id: user.id
  })
  .select() // Returns the created record
```

### Updating Data

```javascript
const { data, error } = await supabase
  .from('posts')
  .update({ 
    title: 'Updated Title',
    updated_at: new Date().toISOString()
  })
  .eq('id', postId)
  .select()
```

### Deleting Data

```javascript
const { error } = await supabase
  .from('posts')
  .delete()
  .eq('id', postId)
```

## Real-time Subscriptions

### Subscribe to Changes
```javascript
const channel = supabase
  .channel('posts-changes')
  .on(
    'postgres_changes',
    {
      event: '*', // 'INSERT' | 'UPDATE' | 'DELETE' | '*'
      schema: 'public',
      table: 'posts'
    },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()

// Cleanup
channel.unsubscribe()
```

### Presence (Who's Online)
```javascript
const channel = supabase.channel('room1')

channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState()
    console.log('Online users:', state)
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ 
        user_id: user.id,
        online_at: new Date().toISOString()
      })
    }
  })
```

## Storage API

### Upload File
```javascript
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`public/${user.id}/avatar.png`, file, {
    cacheControl: '3600',
    upsert: true
  })
```

### Get Public URL
```javascript
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(`public/${user.id}/avatar.png`)
```

### Download File
```javascript
const { data, error } = await supabase.storage
  .from('avatars')
  .download(`public/${user.id}/avatar.png`)
```

### Delete File
```javascript
const { data, error } = await supabase.storage
  .from('avatars')
  .remove([`public/${user.id}/avatar.png`])
```

## Error Handling

All Supabase operations return `{ data, error }`:

```javascript
const { data, error } = await supabase
  .from('posts')
  .select('*')

if (error) {
  console.error('Error fetching posts:', error.message)
  // Handle error appropriately
  throw error
}

// Use data
console.log('Posts:', data)
```

## Row Level Security (RLS)

RLS policies are defined in SQL and enforced by Supabase:

```sql
-- Example: Users can only see their own posts
CREATE POLICY "Users can view own posts" ON posts
  FOR SELECT USING (auth.uid() = user_id);

-- Example: Anyone can read published posts
CREATE POLICY "Public can view published posts" ON posts
  FOR SELECT USING (status = 'published');
```

## Rate Limits

Supabase has the following rate limits:
- **Anonymous requests**: 60 requests per minute
- **Authenticated requests**: 100 requests per minute
- **Real-time messages**: 10 per second per client

## Best Practices

1. **Always handle errors** - Check for `error` in responses
2. **Use RLS** - Implement Row Level Security policies
3. **Optimize queries** - Select only needed columns
4. **Clean up subscriptions** - Unsubscribe when components unmount
5. **Cache when possible** - Reduce unnecessary API calls

## Pagination

```javascript
const PAGE_SIZE = 10

const { data, error, count } = await supabase
  .from('posts')
  .select('*', { count: 'exact' })
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
  .order('created_at', { ascending: false })
```

## Search

```javascript
// Full text search
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .textSearch('content', 'search term')

// Pattern matching
const { data, error } = await supabase
  .from('users')
  .select('*')
  .ilike('name', '%john%')
```

---

> 📡 For more details, see the [Supabase Documentation](https://supabase.com/docs)