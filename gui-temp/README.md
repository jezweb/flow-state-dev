# Flow State Dev GUI

A visual interface for Flow State Dev - create modern web projects with a few clicks!

## Features

- **Visual Project Creation** - Create projects with an intuitive wizard interface
- **Module Explorer** - Browse and search all available modules
- **Preset Selection** - Choose from pre-configured stacks or build your own
- **Real-time Progress** - See exactly what's happening during project creation
- **System Diagnostics** - Check your development environment health
- **Drag & Drop** - Build custom stacks by selecting modules visually

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

## Development

The GUI is built with:
- Vue 3 (Composition API)
- Vuetify 3 (Material Design)
- Pinia (State Management)
- Vue Router
- Vite

### Project Structure

```
src/
├── components/     # Reusable UI components
├── services/       # API integration
├── stores/         # Pinia state stores
├── views/          # Page components
├── router/         # Route configuration
├── App.vue         # Root component
└── main.js         # Application entry
```

### API Integration

The GUI uses the Flow State Dev API from `../lib/api/`. All API calls are wrapped in the `flowStateApi.js` service for easy error handling and progress tracking.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Contributing

Feel free to submit issues and pull requests! The GUI is designed to be easy to extend with new features.

## License

MIT - Same as Flow State Dev