# Tailwind CSS UI Module

This module provides Tailwind CSS integration for Flow State Dev projects, supporting both Vue and React frameworks.

## Features

- **Utility-First CSS** - Rapidly build modern websites without leaving your HTML
- **JIT Mode** - Just-In-Time compiler for faster builds and smaller CSS
- **Dark Mode** - Built-in dark mode support with class or media query strategies
- **Responsive Design** - Mobile-first responsive utilities
- **Component Examples** - Pre-built UI components for Vue and React
- **Tree Shaking** - Only the styles you use are included in production
- **Customizable** - Extend or override the default theme

## Module Structure

```
tailwind/
├── module.js           # Module class definition
├── config.json         # Module metadata
├── templates/
│   ├── config/        # Tailwind and PostCSS configs
│   ├── components/    # UI component examples
│   │   ├── vue/      # Vue components
│   │   └── react/    # React components
│   ├── utilities/     # Helper utilities
│   └── themes/        # Theme presets
└── hooks/             # Module lifecycle hooks
```

## Configuration Options

- `darkMode`: Dark mode strategy ('class', 'media', or false)
- `plugins`: Tailwind plugins to include (forms, typography, etc.)
- `componentExamples`: Include example UI components
- `customColors`: Include custom color palette
- `preflight`: Include Tailwind's base styles reset

## Compatible With

### Frontend Frameworks
- Vue 3
- React
- Svelte
- Angular
- Solid

### Component Libraries
- Headless UI
- Radix UI
- Shadcn/ui
- Catalyst UI

## Usage

The module is automatically available when using Flow State Dev:

```bash
fsd init my-app
# Select Tailwind CSS when prompted for UI library
```

Or use with presets:

```bash
fsd init my-app --preset react-full-stack
# Tailwind can be selected as the UI library
```

## Component Examples

### Button (Vue)
```vue
<template>
  <Button variant="primary" size="lg" @click="handleClick">
    Click me
  </Button>
</template>

<script setup>
import Button from '@/components/ui/Button.vue'
</script>
```

### Button (React)
```jsx
import Button from '@/components/ui/Button'

function App() {
  return (
    <Button variant="primary" size="lg" onClick={handleClick}>
      Click me
    </Button>
  )
}
```

## Utility Functions

### cn() - Class Name Utility
```javascript
import { cn } from '@/utils/cn'

// Combine and deduplicate class names
const classes = cn(
  'text-base',
  isActive && 'font-bold',
  'hover:underline'
)
```

## Customization

### Extending the Theme
```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      },
      fontFamily: {
        display: ['Inter var', 'sans-serif'],
      }
    }
  }
}
```

### Adding Plugins
```javascript
// tailwind.config.js
export default {
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ]
}
```

## Dark Mode

Toggle dark mode by adding the `dark` class to your HTML element:

```javascript
// Toggle dark mode
document.documentElement.classList.toggle('dark')
```

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind UI](https://tailwindui.com) - Premium components
- [Headless UI](https://headlessui.com) - Unstyled accessible components
- [Heroicons](https://heroicons.com) - Beautiful hand-crafted SVG icons