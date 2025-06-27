import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

/**
 * Composable for handling keyboard shortcuts throughout the app
 */
export function useKeyboardShortcuts() {
  const router = useRouter()

  const shortcuts = {
    // Navigation shortcuts
    'ctrl+h': () => router.push('/'),
    'ctrl+n': () => router.push('/create'),
    'ctrl+m': () => router.push('/modules'),
    'ctrl+p': () => router.push('/projects'),
    'ctrl+d': () => router.push('/diagnostics'),
    'ctrl+,': () => router.push('/settings'),
    
    // Quick actions
    'ctrl+r': () => window.location.reload(),
    'ctrl+shift+d': () => toggleDarkMode(),
    'ctrl+k': () => focusSearch(),
    'escape': () => handleEscape(),
    
    // Help
    'ctrl+?': () => showHelp(),
    'f1': () => showHelp()
  }

  function handleKeydown(event) {
    const key = getKeyString(event)
    
    if (shortcuts[key]) {
      event.preventDefault()
      shortcuts[key]()
    }
  }

  function getKeyString(event) {
    const parts = []
    
    if (event.ctrlKey || event.metaKey) parts.push('ctrl')
    if (event.shiftKey) parts.push('shift')
    if (event.altKey) parts.push('alt')
    
    // Handle special keys
    const specialKeys = {
      'Escape': 'escape',
      'F1': 'f1',
      '/': '?'  // Handle ? key
    }
    
    const key = specialKeys[event.key] || event.key.toLowerCase()
    
    // For ? key, check if shift is pressed
    if (event.key === '/' && event.shiftKey) {
      parts.push('?')
    } else if (!specialKeys[event.key]) {
      parts.push(key)
    } else {
      parts.push(key)
    }
    
    return parts.join('+')
  }

  function toggleDarkMode() {
    // Dispatch custom event for theme toggle
    window.dispatchEvent(new CustomEvent('toggle-theme'))
  }

  function focusSearch() {
    // Focus the search bar
    const searchInput = document.querySelector('.search-container input')
    if (searchInput) {
      searchInput.focus()
    }
  }

  function handleEscape() {
    // Close any open dialogs or modals
    window.dispatchEvent(new CustomEvent('escape-pressed'))
  }

  function showHelp() {
    // Dispatch custom event to show help dialog
    window.dispatchEvent(new CustomEvent('show-help'))
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })

  return {
    shortcuts: Object.keys(shortcuts)
  }
}

/**
 * Get formatted shortcut display text
 */
export function formatShortcut(shortcut) {
  return shortcut
    .split('+')
    .map(key => {
      const keyMap = {
        'ctrl': '⌘',
        'shift': '⇧',
        'alt': '⌥',
        'escape': 'Esc',
        '?': '?'
      }
      return keyMap[key] || key.toUpperCase()
    })
    .join('')
}

/**
 * Available shortcuts for help display
 */
export const availableShortcuts = [
  { key: 'ctrl+h', description: 'Go to Home' },
  { key: 'ctrl+n', description: 'Create New Project' },
  { key: 'ctrl+m', description: 'Browse Modules' },
  { key: 'ctrl+p', description: 'My Projects' },
  { key: 'ctrl+d', description: 'Diagnostics' },
  { key: 'ctrl+,', description: 'Settings' },
  { key: 'ctrl+r', description: 'Reload Page' },
  { key: 'ctrl+shift+d', description: 'Toggle Dark Mode' },
  { key: 'ctrl+k', description: 'Focus Search' },
  { key: 'escape', description: 'Close Dialog/Modal' },
  { key: 'ctrl+?', description: 'Show Help' },
  { key: 'f1', description: 'Show Help' }
]