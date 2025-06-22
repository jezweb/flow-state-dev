# [PROJECT_NAME]

A Vue 3 + Supabase application built with Flow State Dev.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment setup

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
- `VITE_SUPABASE_URL` - Get from Supabase project settings
- `VITE_SUPABASE_ANON_KEY` - Get from Supabase project settings

### 3. Run development server

```bash
npm run dev
```

Visit http://localhost:3000

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **Vuetify 3** - Material Design component library
- **Supabase** - Backend as a Service
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Vite** - Build tool

## Project Structure

```
src/
├── components/    # Reusable components
├── composables/   # Composition utilities
├── router/        # Route definitions
├── stores/        # Pinia stores
├── services/      # API services
├── views/         # Page components
└── main.js        # App entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint and fix files
- `npm run format` - Format code with Prettier

## Deployment

### Netlify (Recommended)

1. Push to GitHub
2. Connect to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables
6. Deploy!

### Important: SPA Routing

Create `public/_redirects`:
```
/*    /index.html   200
```

## License

MIT