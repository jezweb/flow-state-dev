# Getting Started

Welcome! This guide will get you up and running with the project in just a few minutes.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **Supabase Account** - [Sign up free](https://supabase.com)

## Quick Start

### 1. Clone the Repository

```bash
git clone [your-repo-url]
cd [project-name]
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Copy the environment template and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

> 💡 Find these in your Supabase project settings under API

### 4. Database Setup

Run the database migrations:

```bash
npm run db:migrate
# or check the Supabase dashboard for SQL scripts
```

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:5173](http://localhost:5173) to see your app!

## Project Structure

```
├── src/
│   ├── components/     # Reusable Vue components
│   ├── views/          # Page components
│   ├── stores/         # Pinia stores
│   ├── services/       # API services
│   ├── composables/    # Vue composables
│   ├── router/         # Route definitions
│   └── main.js         # App entry point
├── public/             # Static assets
├── docs/               # Documentation (you are here!)
└── .claude/            # AI assistant context
```

## First Steps

### 1. Create Your First User

1. Navigate to the sign-up page
2. Enter your email and password
3. Check your email for verification
4. Log in with your credentials

### 2. Explore the Dashboard

The dashboard is your home base:
- View your projects/content
- Access settings
- Monitor activity

### 3. Create Your First Item

Click the "Create New" button and follow the prompts.

## Common Tasks

### Running Tests
```bash
npm run test        # Run unit tests
npm run test:e2e    # Run end-to-end tests
```

### Building for Production
```bash
npm run build       # Creates dist/ folder
npm run preview     # Preview production build
```

### Code Quality
```bash
npm run lint        # Check code style
npm run lint:fix    # Auto-fix issues
npm run type-check  # TypeScript checking
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

#### Supabase Connection Issues
- Check your `.env` file has correct values
- Ensure your Supabase project is active
- Verify network connectivity

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- Read the [Development Guide](development.md) for coding standards
- Check out [Architecture Overview](../context/architecture.md)
- Join our team chat for questions
- Start building something awesome!

## Getting Help

- 📖 Check the [documentation](../README.md)
- 💬 Ask in team chat
- 🐛 Report issues on GitHub
- 📧 Email: support@example.com

---

> 🚀 You're all set! Happy coding!