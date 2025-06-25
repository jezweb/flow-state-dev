# React Frontend Framework Module

This module provides a modern React 18 setup with Vite, TypeScript support, and various state management options.

## Features

- **React 18** with latest features (Concurrent Mode, Suspense, etc.)
- **Vite** for fast development and optimized builds
- **TypeScript** support (optional)
- **React Router v6** for routing
- **State Management** options:
  - Context API (default)
  - Redux Toolkit
  - Zustand
- **ESLint** configuration for code quality
- **Testing** setup with Vitest and React Testing Library
- **Error Boundaries** for better error handling
- **Custom Hooks** for auth and API calls

## Module Structure

```
react/
├── module.js           # Module class definition
├── config.json         # Module metadata
├── templates/
│   ├── base/          # Core React files
│   ├── router/        # React Router templates
│   ├── state/         # State management templates
│   ├── hooks/         # Custom React hooks
│   └── typescript/    # TypeScript configuration
└── hooks/             # Module lifecycle hooks
```

## Configuration Options

When using this module, you can configure:

- `typescript`: Enable TypeScript support (default: true)
- `router`: Include React Router (default: true)
- `stateManagement`: Choose state solution ('context', 'redux', 'zustand')
- `testing`: Include testing setup (default: true)

## Compatible Modules

### UI Libraries
- Tailwind CSS
- Material UI
- Chakra UI
- Ant Design

### Backend Services
- Supabase
- Firebase
- Express
- NestJS

## Usage

The module will be automatically available when using Flow State Dev:

```bash
fsd init my-react-app
# Select React when prompted for frontend framework
```

Or use directly with presets:

```bash
fsd init my-app --preset react-full-stack
```

## Development

After project generation:

```bash
cd my-react-app
npm install
npm run dev
```

## Building for Production

```bash
npm run build
npm run preview  # Preview production build
```

## State Management Examples

### Context API (Default)
```jsx
import { useAuth } from './hooks/useAuth'

function App() {
  const { user, login, logout } = useAuth()
  // ...
}
```

### Redux Toolkit
```jsx
import { useSelector, useDispatch } from 'react-redux'
import { setUser } from './store/slices/authSlice'

function App() {
  const user = useSelector(state => state.auth.user)
  const dispatch = useDispatch()
  // ...
}
```

### Zustand
```jsx
import { useStore } from './store/useStore'

function App() {
  const { user, setUser } = useStore()
  // ...
}
```