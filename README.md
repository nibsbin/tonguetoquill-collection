# Tonguetoquill Web

A professional markdown document editor.

## Technology Stack

- **Framework**: SvelteKit 5 (full-stack: frontend + backend)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **Database**: PostgreSQL via Supabase (Phase 10)
- **Authentication**: Mock Provider (Phases 1-9), Supabase Auth (Phase 10+)
- **Development**: Mock services for rapid AI agent development
- **Deployment**: Vercel (adapter-auto)

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm 10.x or later

### Installation

1. Clone the repository:

```sh
git clone https://github.com/nibsbin/tonguetoquill-web.git
cd tonguetoquill-web
```

2. Install dependencies:

```sh
npm install
```

3. Create a `.env` file from the template:

```sh
cp .env.example .env
```

4. Start the development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Development Scripts

- `npm run dev` - Run development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run all tests (unit + e2e)
- `npm run test:unit` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run check` - Type check and validate
- `npm run lint` - Run ESLint
- `npm run format` - Run Prettier

## Project Structure

```
src/
├── lib/                 # Reusable components, services, stores, utilities
│   ├── components/      # Svelte UI components
│   ├── services/        # Authentication and document service providers
│   ├── stores/          # State management
│   └── utils/           # Helper functions
├── routes/              # Route-based pages and API endpoints
│   ├── (app)/           # Authenticated application routes
│   ├── (auth)/          # Login, registration pages
│   ├── (marketing)/     # Public pages
│   └── api/             # API endpoints (server routes)
└── hooks.server.ts      # Server-side middleware (authentication)
```

## Environment Variables

See `.env.example` for required environment variables. Key variables:

- `USE_AUTH_MOCKS=true` - Enable mock authentication provider
- `USE_DB_MOCKS=true` - Enable mock document service
- `MOCK_JWT_SECRET` - Secret key for mock JWT generation (dev only)
- `PUBLIC_APP_NAME` - Application name (client-accessible)

## Mock Provider Strategy

Phases 1-9 use **mock providers** to enable fast, parallel AI agent development without external dependencies. Real Supabase integration occurs in Phase 10.

Benefits:

- ✅ Fast environment startup
- ✅ No Docker/external dependencies
- ✅ Deterministic testing
- ✅ Easy debugging
- ✅ Offline development

## MVP Feature Scope

### Included in MVP

- ✅ Single-user document editing
- ✅ User authentication
- ✅ Markdown editor with formatting toolbar
- ✅ Live preview pane
- ✅ Auto-save with 7-second debounce
- ✅ Document list (create, open, delete)
- ✅ Mobile-responsive layout
- ✅ Section 508 compliance
- ✅ Keyboard shortcuts

### Explicitly Excluded from MVP

- ❌ Document templates
- ❌ Document sharing/collaboration
- ❌ Version history
- ❌ Offline support
- ❌ Advanced search and filtering
- ❌ Quillmark integration (post-MVP)

## Building for Production

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

## Deployment

This project is configured to deploy to Vercel using the SvelteKit adapter-auto. See `prose/plans/MVP_PLAN.md` Phase 11 for deployment instructions.

## Documentation

- `prose/plans/MVP_PLAN.md` - Detailed MVP implementation plan
- `prose/designs/` - Technical design documents
  - `backend/` - Backend architecture and schemas
  - `frontend/` - Frontend architecture and components
  - `quillmark/` - Quillmark integration (post-MVP)

## License

MIT
