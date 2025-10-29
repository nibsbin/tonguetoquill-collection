# Tonguetoquill MVP Implementation Plan (Revised)

## Overview

This document outlines a phased approach to implementing the Tonguetoquill MVP - a professional markdown document editor with authentication, auto-save, and Section 508 compliance. The plan balances backend and frontend development to enable incremental testing and validation.

**Technology Stack:**

- **Framework**: SvelteKit 5 (full-stack: frontend + backend)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **Database**: PostgreSQL via Supabase (Phase 10)
- **Authentication**: Mock Provider (Phases 1-9), Supabase Auth (Phase 10+)
- **Development**: Mock services for rapid AI agent development
- **Deployment**: Vercel (adapter-auto)

**MVP Scope**: Single-user document editing with authentication, markdown editor, live preview, auto-save, and mobile-responsive UI.

**Development Strategy**: Uses **mock providers** for Phases 1-9 to enable parallel development without external dependencies. Real Supabase integration occurs in Phase 10. Follow KISS and DRY principles to minimize complexity.

---

## Phase 1: Foundation & Infrastructure

**Goal**: Establish project structure, development environment, and core infrastructure.

### 1.1 Project Initialization

**SvelteKit 5 Full-Stack Project:**

- Initialize SvelteKit 5 project with TypeScript
- Select options: TypeScript strict mode, ESLint, Prettier, Playwright, Vitest
- Configure Tailwind CSS 4.0
- Set up TypeScript strict mode

**Project Structure:**
Organize into logical directories:

- `src/lib/`: Reusable components, services, stores, utilities
  - `components/`: Svelte UI components
  - `services/`: Authentication and document service providers
  - `stores/`: State management
  - `utils/`: Helper functions
- `src/routes/`: Route-based pages and API endpoints
  - `(app)/`: Authenticated application routes
  - `(auth)/`: Login, registration pages
  - `(marketing)/`: Public pages
  - `api/`: API endpoints (server routes)
- `src/hooks.server.ts`: Server-side middleware (authentication)

**Core Dependencies:**

- `shadcn-svelte`: Component library with built-in Lucide icons and Sonner toast notifications
- CodeMirror 6 packages (see `prose/designs/frontend/MARKDOWN_EDITOR.md` - Dependencies section)
- `zod`: Schema validation for runtime validation, form schemas, and type-safe environment variables

**Environment Configuration:**

- Create `.env` file for development (not committed)
- Create `.env.example` template (committed to repo)
- Configure SvelteKit to load environment variables
- Use `PUBLIC_` prefix for client-accessible variables

**Development Tools:**

- ESLint configuration for SvelteKit and TypeScript
- Prettier configuration with Svelte plugin
- Set up git hooks with `husky` (pre-commit linting)
- Configure VS Code settings for optimal DX (optional)

**Development Scripts:**
Standard SvelteKit scripts in `package.json`:

- `dev`: Run development server
- `build`: Build for production
- `preview`: Preview production build
- `test`: Run unit tests
- `test:e2e`: Run end-to-end tests
- `check`: Type check and validate
- `lint`: Run ESLint
- `format`: Run Prettier

**Environment Configuration:**
Development environment variables (`.env` file):

- `USE_AUTH_MOCKS=true`: Enable mock authentication provider
- `USE_DB_MOCKS=true`: Enable mock document service
- `NODE_ENV=development`: Development mode
- `MOCK_JWT_SECRET`: Secret key for mock JWT generation
- `PUBLIC_APP_NAME`: Application name (client-accessible)

Template file (`.env.example`) committed to repository as reference.

**Deliverables:**

- Single SvelteKit 5 full-stack project initialized
- Project structure with organized directories (`lib/`, `routes/`)
- Tailwind CSS 4.0 configured and working
- TypeScript strict mode enabled
- ESLint and Prettier configured
- Git hooks for pre-commit linting
- Environment variable system configured
- Development scripts ready (`npm run dev`)
- Basic "Hello World" page at root route
- README with setup instructions
- Mock provider flags configured in `.env`

---

## Phase 2: Authentication & Database Contracts with Mock Providers

**Goal**: Define contracts and implement mock providers for rapid development without external dependencies.

**Note**: This phase uses **mock providers** to enable fast, parallel AI agent development. Real Supabase integration happens in Phase 10.

### 2.1 Authentication Contract Definition

**Tasks:**

- Define AuthContract interface (TypeScript) with all authentication methods
- Define core types: `User`, `Session`, `AuthResult`, `UUID`
- Define `AuthError` class with proper error codes
- Define `TokenPayload` interface for JWT structure
- Document expected behaviors, error types, and edge cases
- Create contract test suite (runs against mocks now, real providers later)
- Document mock limitations vs real Supabase behavior

**Type Safety Considerations:**

- Use `UUID` type alias for all user/session IDs (validates format in strict mode)
- Use `Record<string, any>` instead of `object` for metadata (more flexible)
- `getCurrentUser` returns `User | null` (handle missing user gracefully)
- All timestamps use ISO 8601 strings or Unix timestamps (consistent)
- Error codes are strongly typed (prevents typos)

**Contract Interface:**
Define TypeScript interfaces for authentication with proper type safety:

- `UUID` type for all user and session identifiers
- `User` interface (id, email, dodid, profile, timestamps)
- `Session` interface (access_token, refresh_token, expiry, user)
- `AuthResult` interface (user, session)
- `AuthContract` interface defining all authentication methods
- `AuthError` class with strongly-typed error codes
- `TokenPayload` interface for JWT structure

**Key Methods:**

- `signUp`: Create new user account
- `signIn`: Authenticate user and create session
- `signOut`: Invalidate session
- `refreshSession`: Refresh expired access token
- `getCurrentUser`: Retrieve user from access token
- `resetPassword`: Initiate password reset flow
- `verifyEmail`: Confirm email verification

**Type Safety Requirements:**

- All IDs use UUID type instead of plain strings
- Error codes are strongly typed (prevents typos)
- Nullable return types where appropriate (e.g., `User | null`)
- Metadata uses `Record<string, any>` for flexibility

**Reference**: `prose/designs/backend/AUTH.md`

### 2.2 Mock Authentication Provider

**Tasks:**

- Implement MockAuthProvider implementing the AuthContract interface
- Use in-memory Map-based storage for users and sessions
- Generate proper UUIDs using `crypto.randomUUID()`
- Simulate realistic network delays (100-300ms)
- Generate JWT-like tokens for testing
- Implement all error cases with proper AuthError instances
- Session management with realistic expiry times (1 hour access, 7 day refresh)

**Mock JWT Token Structure:**
Mock tokens must match Supabase JWT format for seamless Phase 10 migration:

```typescript
interface MockTokenPayload {
	sub: UUID; // user ID (subject)
	email: string; // user email
	exp: number; // expiry timestamp (Unix epoch)
	iat: number; // issued at timestamp (Unix epoch)
	role: 'authenticated'; // user role (always 'authenticated' for MVP)
	aud: 'authenticated'; // audience claim
}
```

**Token Generation Strategy:**

- Use simple base64 encoding for MVP (not cryptographically secure)
- Format: `header.payload.signature` (standard JWT structure)
- Header: `{"alg":"HS256","typ":"JWT"}` (base64 encoded)
- Payload: MockTokenPayload (base64 encoded)
- Signature: HMAC-SHA256 of header.payload with MOCK_JWT_SECRET
- Store signature validation logic for middleware

**Mock Features:**

- Email format validation
- Password strength validation (optional for MVP)
- Duplicate user detection
- Invalid credentials handling
- Session expiry simulation
- Deterministic behavior for testing

**Reference**: `prose/designs/backend/AUTH.md`

### 2.3 Database Schema Contracts & Mock Service

**Tasks:**

- Define database schema interfaces (User, Document types)
- Document table structure matching `prose/designs/backend/SCHEMAS.md`
- Implement MockDocumentService with in-memory storage
- Enforce real constraints (content size ≤ 524,288 bytes, name length ≤ 255)
- Implement realistic validation and error handling
- Support all CRUD operations with ownership verification

**Document Type Definitions:**

- `Document` interface (id, owner_id, name, content, content_size_bytes, timestamps)
- `DocumentMetadata` interface (same as Document but without content field for performance)
- `DocumentListResult` interface (documents array, pagination info)
- `DocumentError` class with strongly-typed error codes
- All IDs use UUID type for consistency

**Validation Rules:**

- Document name: 1-255 characters, trimmed, no leading/trailing whitespace
- Content: Max 524,288 bytes (0.5 MB)
- Ownership verification on all operations
- Accurate content_size_bytes calculation using UTF-8 byte length

**Mock Document Service Methods:**

- `createDocument`: Create new document (validate name, content size, generate UUID)
- `getDocumentMetadata`: Return metadata only (no content field for performance)
- `getDocumentContent`: Return full document with content
- `updateDocumentContent`: Update content (validate size, ownership)
- `updateDocumentName`: Rename document (validate name, ownership)
- `deleteDocument`: Delete document (verify ownership)
- `listUserDocuments`: Return paginated list of user's documents (metadata only)

All methods accept UUID parameters for user and document IDs, and verify ownership before operations.

**Mock Storage:**

- Use Map for in-memory storage
- Generate realistic timestamps
- Calculate content_size_bytes accurately
- Support data export/import for testing scenarios

**Reference**: `prose/designs/backend/SCHEMAS.md`, `prose/designs/backend/SERVICES.md`

### 2.4 Authentication Routes with Mock Backend

**Implement Routes:**

- `POST /auth/register`: User registration (via MockAuthProvider)
- `POST /auth/login`: User login, set HTTP-only cookies
- `POST /auth/refresh`: Refresh access tokens
- `POST /auth/logout`: Clear session cookies
- `POST /auth/reset-password`: Password reset flow (mock email sending)
- `POST /auth/verify-email`: Email verification (mock validation)
- `GET /auth/me`: Get current user information
- `GET /auth/callback`: OAuth callback stub (future Keycloak)

**Mock Authentication Middleware:**

- Extract and validate mock JWT tokens from cookies
- Verify signature using MOCK_JWT_SECRET
- Check token expiry (reject if exp < current time)
- Attach user context to request
- Handle expired tokens with proper error responses

**Error Handling:**

- Implement standard error response format: `{ "error": "error_code", "message": "description" }`
- Handle common auth errors (401, 403, 400)
- Realistic error messages matching Supabase error formats

**Environment Configuration:**

```bash
# .env for development with mocks
USE_AUTH_MOCKS=true
USE_DB_MOCKS=true
# NOTE: Dev secret only for mock JWT generation - DO NOT use in production
MOCK_JWT_SECRET=dev-secret-key
```

**Reference**: `prose/designs/backend/AUTH.md`

### 2.5 Contract Testing Framework

**Tasks:**

- Set up contract test suite using Vitest
- Write tests that will run against BOTH mock and real providers
- Test all authentication flows (signup, login, logout, refresh)
- Test all error conditions (duplicate email, invalid credentials, etc.)
- Test edge cases (empty strings, special characters, size limits)
- Use conditional test execution (skip real provider tests during mock-only development)

**Test Coverage:**

- Authentication operations (signup, login, logout, session refresh)
- Document CRUD operations (create, read, update, delete, list)
- Validation logic (email format, password strength, content size limits)
- Error handling (proper error codes and messages)
- Authorization (ownership verification)
- Edge cases and boundary conditions

Contract tests ensure that mock providers behave identically to real providers. The same test suite will validate real Supabase integration in Phase 10.

**Mock vs Real Provider Differences:**

Document key behavioral differences between mock and real Supabase providers:

| Feature               | Mock Provider              | Real Supabase Provider                     |
| --------------------- | -------------------------- | ------------------------------------------ |
| Email Verification    | Simulated (no emails sent) | Real emails sent via configured SMTP       |
| Password Reset        | Simulated flow             | Real email with reset link                 |
| Rate Limiting         | Not enforced               | Built-in rate limiting active              |
| Concurrent Sessions   | Simple in-memory tracking  | Database-backed session management         |
| Network Failures      | Can simulate delays        | Real network conditions                    |
| Token Refresh         | Deterministic timing       | Clock-based expiration                     |
| JWKS Validation       | Simple signature check     | Full JWKS endpoint validation with caching |
| Database Transactions | In-memory Map operations   | PostgreSQL ACID transactions               |

**Reference**: Testing section in `prose/designs/backend/AUTH.md`

**Deliverables:**

- Complete AuthContract interface and documentation
- Fully functional MockAuthProvider with JWT token generation
- MockDocumentService with validation
- Authentication routes using mock providers
- Contract test suite (passes with mocks)
- Environment-based provider switching
- Documentation of mock vs real behavior differences

---

## Phase 3: Document Service Backend (Mock Implementation)

**Goal**: Implement document CRUD operations with authorization using mock storage.

### 3.1 Document Service Implementation

**Core Methods:**

- `createDocument(userId, name, content)`: Create new document in memory
- `getDocumentMetadata(userId, documentId)`: Get metadata only
- `getDocumentContent(userId, documentId)`: Get full document with content
- `updateDocumentContent(userId, documentId, content)`: Update content
- `updateDocumentName(userId, documentId, name)`: Rename document
- `deleteDocument(userId, documentId)`: Delete document from memory
- `listUserDocuments(userId, limit, offset)`: List user's documents (metadata only)

**Validation:**

- Document name: 1-255 characters, no leading/trailing whitespace
- Content: Max 524,288 bytes (0.5 MB)
- Ownership verification on all operations
- Realistic timestamp generation
- Accurate content_size_bytes calculation

**Mock Data Persistence:**

- In-memory Map storage
- Optional: Export/import mock data to JSON for testing
- Simulate realistic delays (50-200ms)

**Reference**: `prose/designs/backend/SERVICES.md`

### 3.2 Document API Routes

**Implement Routes:**

- `POST /api/documents`: Create document
- `GET /api/documents`: List user's documents (pagination)
- `GET /api/documents/:id`: Get document with content
- `GET /api/documents/:id/metadata`: Get metadata only
- `PUT /api/documents/:id/content`: Update content
- `PUT /api/documents/:id/name`: Update name
- `DELETE /api/documents/:id`: Delete document

**Authorization:**

- All routes require authentication (mock JWT validation)
- Verify document ownership before any operation

**Error Handling:**

- 404: Document not found
- 403: Not authorized (wrong owner)
- 400: Validation errors
- 413: Content too large

**Deliverables:**

- Complete mock document service with authorization
- API endpoints for all document operations
- Unit tests for service methods
- API integration tests (against mocks)

---

## Phase 4: Frontend Authentication & Layout

**Goal**: Implement authentication UI and application layout structure.

### 4.1 Authentication UI

**Login Page (`(auth)/login`):**

- Email and password form
- Client-side validation (progressive enhancement)
- Server action for authentication (calls mock API)
- Error display (inline + summary)
- Redirect to app on success

**Registration Flow:**

- Registration form with email, password, DODID
- Server-side validation
- Email verification flow (mock)
- Success/error handling

**Session Management:**

- Server hooks for JWT validation (mock tokens)
- Automatic token refresh (proactive, 5 minutes before expiry)
- Redirect to login on auth failure
- User context in page data

**Reference**: `prose/designs/backend/AUTH.md`, `prose/designs/frontend/API_INTEGRATION.md`

### 4.2 Application Layout

**Main Layout (`(app)/+layout.svelte`):**

- Top menu bar (48px height)
- Sidebar (collapsible: 224px expanded, 48px collapsed)
- Main content area
- Responsive breakpoints (mobile drawer, tablet/desktop sidebar)

**Components:**

- Sidebar: Navigation, document list, user profile, settings
- TopMenu: Document name, save status, actions (download, more)
- Toast container for notifications

**State Management:**

- Authentication store (user info, login/logout)
- Preferences store (sidebar state, auto-save setting)
- LocalStorage persistence for preferences

**Reference**: `prose/designs/frontend/UI_COMPONENTS.md`, `prose/designs/frontend/ARCHITECTURE.md`

### 4.3 Design System Foundation

**Implement Core Tokens:**

- Color palette (zinc-900 theme, USAF blue accent)
- Typography system (system, monospace, serif stacks)
- Spacing scale (4px base unit)
- Border radius, shadows, transitions
- Tailwind CSS configuration

**Accessibility Setup:**

- Focus indicator styles (2px solid USAF blue, 3px in high contrast)
- Color contrast validation (4.5:1 minimum)
- `prefers-contrast` and `prefers-reduced-motion` support
- Skip to main content link

**Reference**: `prose/designs/frontend/DESIGN_SYSTEM.md`

**Deliverables:**

- Working authentication flow (login/logout) with mocks
- Application layout with responsive sidebar
- Design system tokens in Tailwind config
- Accessibility foundation (focus, contrast, motion preferences)

---

## Phase 5: Document Management UI

**Goal**: Implement document list, creation, and deletion.

### 5.1 Document List & Navigation

**Document List (Sidebar):**

- Display user's documents (name, creation date)
- "New Document" button
- Selected state highlighting
- Empty state message
- Loading skeleton during fetch
- Error handling and retry

**Document Store:**

- Global store for document list
- Active document ID tracking
- CRUD operation methods
- Loading/error states

**API Integration:**

- Fetch documents on app load (from mock API)
- Optimistic updates for create/delete
- Error handling with rollback
- Toast notifications for success/errors

**Reference**: `prose/designs/frontend/STATE_MANAGEMENT.md`, `prose/designs/frontend/API_INTEGRATION.md`

### 5.2 Document Creation & Deletion

**Create Document:**

- "New Document" button in sidebar
- Default name: "Untitled Document" or timestamp-based
- Blank markdown content
- Immediate navigation to new document
- Optimistic UI update

**Delete Document:**

- Confirmation dialog before deletion
- Optimistic removal from list
- Rollback on error
- Toast notification on success/error

**Dialogs:**

- Reusable Dialog component
- Modal backdrop with dismiss
- Focus trap and keyboard handling (ESC to close)
- Mobile adaptation (bottom sheet < 640px)

**Reference**: `prose/designs/frontend/UI_COMPONENTS.md`

### 5.3 Basic E2E Tests

**Test Coverage:**

- User can create a new document
- Document appears in sidebar list
- User can delete a document with confirmation
- Error handling when API fails

**Testing Strategy:**

- Use Playwright for E2E tests
- Run against mock API (no Supabase dependency)
- Focus on critical user flows only
- Keep test suite lightweight for fast iteration

**Deliverables:**

- Document list in sidebar with navigation
- Create and delete document functionality
- Confirmation dialogs
- Optimistic updates with error handling
- Basic E2E tests for document CRUD

---

## Phase 6: Markdown Editor & Preview

**Goal**: Implement core editing experience with live preview.

**Implementation Guide**: This phase implements the editor architecture detailed in `prose/designs/frontend/MARKDOWN_EDITOR.md`. Follow the 8 implementation phases outlined in that document for a structured approach to building the CodeMirror 6 editor with extended markdown support.

**Recommended Implementation Approach:**

For optimal development velocity and reduced risk, implement the editor in stages:

1. **Start with Basic Markdown** (MARKDOWN_EDITOR.md Phases 1-2):
   - Initialize CodeMirror 6 with standard markdown support
   - Implement toolbar and basic formatting
   - Get the core editing experience working first
   - This unblocks other development work and provides immediate value

2. **Add Extended Syntax Iteratively** (MARKDOWN_EDITOR.md Phases 3-5):
   - Begin with simple `---` delimiter recognition
   - Add basic SCOPE/QUILL keyword highlighting
   - Incrementally add folding and advanced features
   - This reduces complexity and allows for testing at each stage

3. **Polish and Optimize** (MARKDOWN_EDITOR.md Phases 6-8):
   - Add auto-completion, mobile optimization, and accessibility features
   - Complete the extended markdown implementation

**Phase Mapping to MARKDOWN_EDITOR.md:**

- Phase 6.1 (this phase) encompasses MARKDOWN_EDITOR.md Phases 1-5
- Additional polish work (Phases 6-8 in MARKDOWN_EDITOR.md) continues within Phase 6 scope
- Prioritize getting basic markdown working before complex Lezer grammar development

### 6.1 Markdown Editor

**Editor Implementation:**

Implement CodeMirror 6 editor with extended markdown support. See `prose/designs/frontend/MARKDOWN_EDITOR.md` for complete architecture, including:

- Custom Lezer grammar for SCOPE/QUILL metadata blocks
- Horizontal rule disambiguation algorithm
- Folding strategy and implementation
- Syntax highlighting theme
- Auto-completion configuration
- Accessibility features

**Key Features:**

- CodeMirror 6 with custom language mode for extended markdown
- Syntax highlighting for standard markdown and metadata blocks (SCOPE/QUILL)
- Code folding for YAML frontmatter and inline metadata blocks
- Line numbers and active line highlighting
- Auto-indent and smart indentation
- Undo/redo with transaction history

**Toolbar:**

- Formatting buttons: Bold, Italic, Strikethrough
- Block formatting: Code block, Quote
- Lists: Bullet, Numbered
- Link insertion
- Button groups with dividers
- Active state when formatting at cursor
- Tooltips with keyboard shortcuts

**Keyboard Shortcuts:**

- Ctrl/Cmd+B: Bold
- Ctrl/Cmd+I: Italic
- Ctrl/Cmd+S: Save (manual trigger)
- Ctrl/Cmd+Shift+[: Fold block
- Ctrl/Cmd+Shift+]: Unfold block
- Additional shortcuts per DESIGN_SYSTEM.md

**Reference**: `prose/designs/frontend/MARKDOWN_EDITOR.md`, `prose/designs/frontend/UI_COMPONENTS.md`, `prose/designs/frontend/DESIGN_SYSTEM.md`

### 6.2 Live Preview

**Preview Component:**

- Rendered markdown in split pane
- White background with professional typography
- Max-width 800px, centered
- Generous padding (responsive)
- Debounced rendering (updates after user stops typing)

**Markdown Rendering:**

- Parse extended markdown with metadata blocks (SCOPE/QUILL)
- Support GitHub Flavored Markdown (tables, strikethrough)
- Syntax highlighting for code blocks
- Responsive images and tables
- Proper handling of inline metadata blocks per PARSE.md

**Performance:**

- Debounced preview updates (50 delay)
- Preserve scroll position during updates
- Show previous render to avoid flashes (per DESIGN_SYSTEM.md loading states)

**Reference**: `prose/designs/frontend/MARKDOWN_EDITOR.md`, `prose/designs/frontend/UI_COMPONENTS.md`, `prose/designs/frontend/DESIGN_SYSTEM.md`

### 6.3 Responsive Layout

**Desktop (≥1024px):**

- Split panes: Editor (50%) | Preview (50%)
- Resizable divider (optional for MVP)

**Tablet (768px-1023px):**

- Collapsible preview or tabbed view
- Full editor with toggle to preview

**Mobile (<768px):**

- Tabbed interface: Editor OR Preview
- Tab bar for switching
- Full-screen drawer sidebar

**Reference**: `prose/designs/frontend/DESIGN_SYSTEM.md` - Navigation Patterns

### 6.4 Editor E2E Tests

**Test Coverage:**

- User can type markdown in editor
- Toolbar formatting buttons work (bold, italic, etc.)
- Keyboard shortcuts apply formatting
- Preview updates after typing (debounced)
- Editor content persists when switching documents

**Testing Strategy:**

- Test core editing interactions
- Verify toolbar functionality
- Keep tests focused on user-facing behavior
- Skip low-level CodeMirror internals

**Deliverables:**

- CodeMirror 6 markdown editor with custom language mode
- Extended markdown syntax highlighting (SCOPE/QUILL blocks)
- Code folding for metadata blocks
- Formatting toolbar with keyboard shortcuts
- Live preview with debounced updates
- Responsive layout (split/tabbed views)
- E2E tests for editor interactions

---

## Phase 6.5: UI Alignment & Theming

**Goal**: Align UI implementation with the desired layout and theming demonstrated in `prose/legacymock_project`.

**Note**: This mini-phase ensures the visual design and user experience matches the reference implementation before proceeding with auto-save and advanced features.

### 6.5.1 UI Rework Implementation

**Reference Plan**: See `prose/plans/UI_REWORK.md` for complete implementation strategy and detailed tasks.

**Objectives:**

- Update design tokens (colors, typography, spacing) to match mock project
- Rework Sidebar component structure and behavior
- Update TopMenu to simplified layout
- Refine Editor Toolbar styling and button layout
- Adjust Editor and Preview styling for proper theming
- Implement Settings popover with preference toggles
- Verify responsive behavior at all breakpoints
- Polish interactions and animations

**Key Changes:**

**Design Tokens:**

- Color palette: zinc-900 background, zinc-800 surfaces, zinc-700 borders
- Typography: Lato for UI, monospace for editor, Crimson Text for preview
- Sidebar width: 48px collapsed, 224px expanded (reduced from 256px)
- Component heights: 48px for top menu and toolbar

**Visual Updates:**

- Sidebar: Add logo, reorganize header, update footer with Profile + Settings
- Top Menu: Simplify to document name + Download + More menu
- Toolbar: Icon-only buttons with mode toggle tabs
- Preview: White background with professional typography
- Settings: Popover with toggle switches for preferences

**Deliverables:**

- Updated Tailwind config and CSS variables
- Reworked Sidebar, TopMenu, EditorToolbar components
- Updated editor and preview styling
- Settings popover implementation
- Responsive layouts verified at all breakpoints
- Visual match with mock project confirmed
- No regressions in functionality or accessibility

**Reference**: `prose/plans/UI_REWORK.md`, `prose/legacy/mock_project/`

---

## Phase 6.6: Technical Debt Repair - Feature Parity Recovery

**Goal**: Recover feature parity after Phase 6.5 UI rework by implementing missing functionality and fixing regressions.

**Note**: Phase 6.5 successfully updated visual design and theming but removed or left incomplete several critical features. This phase restores full functionality while maintaining the improved UI.

### 6.6.1 Critical Functionality Restoration

**Reference Plan**: See `prose/plans/REPAIR.md` for complete analysis, detailed tasks, and implementation guidance.

**Identified Regressions**:

1. **Auto-Save Missing** (HIGH PRIORITY):
   - 7-second debounce auto-save removed
   - No save status indicator
   - Manual save (Ctrl+S) not implemented
   - Auto-save setting toggle exists but non-functional

2. **Content Not Persisting** (HIGH PRIORITY):
   - Document edits not saved to store or backend
   - All changes lost on document switch or refresh
   - Guest mode localStorage not updated
   - Authenticated mode API calls missing

3. **Settings Not Applied** (MEDIUM PRIORITY):
   - Auto-save toggle stored but not consumed
   - Line numbers toggle stored but editor not configured
   - User preferences ignored by application

4. **Mobile Editor/Preview Toggle Missing** (MEDIUM PRIORITY):
   - Preview hidden on mobile with no way to view
   - Tabbed interface not implemented
   - TODO comment left in code

5. **Delete Confirmation Missing** (MEDIUM PRIORITY):
   - No confirmation dialog before deletion
   - Risk of accidental data loss

6. **Additional Gaps**:
   - Mode toggle (Markdown/Wizard) UI missing from toolbar
   - Keyboard shortcuts incomplete (no Ctrl+S)
   - Classification message not displayed
   - Some accessibility features missing

**Recovery Phases** (from REPAIR.md):

**Phase R1: Auto-Save Implementation** (8 hours):
- Implement 7-second debounce auto-save
- Add save status indicator to TopMenu
- Implement manual save (Ctrl+S)
- Wire auto-save toggle to functionality
- Test guest and authenticated save flows

**Phase R2: Document Persistence** (8 hours):
- Fix content persistence to localStorage/API
- Implement dirty state tracking
- Add unsaved changes warning on document switch
- Robust error handling and rollback
- Test data integrity

**Phase R3: Settings Integration** (4 hours):
- Connect auto-save toggle to save logic
- Add line numbers extension to CodeMirror
- Read and apply settings from localStorage
- Immediate updates without reload

**Phase R4: Mobile Enhancements** (6 hours):
- Implement mobile tab switcher (Editor/Preview)
- Conditional rendering for mobile vs desktop
- Touch optimization
- Test at all breakpoints

**Phase R5: Additional Features** (6 hours):
- Add mode toggle tabs to EditorToolbar (UI stub)
- Implement delete confirmation dialog
- Add keyboard shortcuts to tooltips
- Display classification message toast

**Phase R6: Accessibility Fixes** (6 hours):
- Add skip to main content link
- ARIA labels audit and fixes
- Keyboard shortcuts help dialog
- Screen reader testing

**Phase R7: Testing and Documentation** (8 hours):
- E2E test suite for all flows
- Update design documents
- Code quality improvements
- Performance validation

**Deliverables**:

- ✅ Auto-save with 7-second debounce and status indicator
- ✅ Content persists correctly to localStorage and API
- ✅ Unsaved changes warning prevents data loss
- ✅ Settings toggles control application behavior
- ✅ Mobile editor/preview toggle functional
- ✅ Delete confirmation dialog implemented
- ✅ Complete keyboard shortcuts (including Ctrl+S)
- ✅ Classification message toast on load
- ✅ Section 508 accessibility compliance maintained
- ✅ Updated documentation reflects current state
- ✅ All E2E tests passing

**Success Criteria**:

- [ ] No data loss on document switching or refresh
- [ ] Auto-save triggers after 7 seconds of inactivity
- [ ] Settings toggles immediately affect behavior
- [ ] Mobile users can toggle between editor and preview
- [ ] All critical user flows tested and working
- [ ] Accessibility requirements met (keyboard nav, screen reader)
- [ ] Design documents accurately reflect implementation

**Timeline**: ~46 hours (1 week full-time development)

**Reference**: `prose/plans/REPAIR.md` - Complete technical debt analysis and recovery plan

---

## Phase 7: Auto-Save & Document Persistence

**Goal**: Implement auto-save functionality and document state management.

**Note**: This phase was originally planned after Phase 6. However, Phase 6.5 UI rework removed auto-save functionality. This work is now incorporated into **Phase 6.6** (Technical Debt Repair). See `prose/plans/REPAIR.md` Phases R1 and R2 for updated implementation plan.

### 7.1 Auto-Save Implementation

**Auto-Save Logic:**

- 7-second debounce after last keystroke
- Only save if document has unsaved changes
- Manual save via Ctrl/Cmd+S
- Network timeout: 30 seconds
- Optimistic UI (assume success, rollback on error)
- Saves to mock API

**Save Status Indicator:**

- Saving: Spinner icon + "Saving..."
- Saved: Checkmark icon + "Saved" (brief display)
- Unsaved: Dot indicator or asterisk in title
- Error: Red error icon + error message

**Settings Integration:**

- Auto-save toggle in settings dialog
- Persist preference to localStorage
- Default: Auto-save enabled

**Reference**: `prose/designs/frontend/DESIGN_SYSTEM.md` - Auto-Save Behavior

### 7.2 Document State Management

**Tracking Changes:**

- Dirty flag when content changes
- Clear flag on successful save
- Preserve unsaved changes on navigation (optional warning)

**Conflict Resolution:**

- Last write wins (MVP strategy)
- No conflict detection
- Timestamp update on save

**Error Handling:**

- Display error toast on save failure
- Keep local changes in editor (don't discard)
- Provide retry button
- Maintain unsaved status

**Reference**: `prose/designs/frontend/STATE_MANAGEMENT.md`, `prose/designs/frontend/API_INTEGRATION.md`

### 7.3 Auto-Save E2E Tests

**Test Coverage:**

- Auto-save triggers after 7 seconds of inactivity
- Save status indicator updates correctly
- Manual save (Ctrl+S) works immediately
- Unsaved changes preserved on navigation
- Error handling when save fails

**Testing Strategy:**

- Use timer mocking for debounce testing
- Verify save indicator states
- Test error recovery flow

**Deliverables:**

- Auto-save with 7-second debounce
- Save status indicators
- Settings toggle for auto-save
- Error handling with retry
- E2E tests for auto-save flows

---

## Phase 8: Accessibility & Polish

**Goal**: Ensure Section 508 compliance and polish user experience.

**Note**: This phase builds on the UI updates from Phase 6.5 to ensure all accessibility requirements are met.

### 8.1 Section 508 Compliance

**Keyboard Navigation:**

- Test full keyboard navigation (tab order)
- No keyboard traps
- Visible focus indicators on all interactive elements
- Skip to main content link
- ESC to close modals/menus

**Screen Reader Support:**

- Semantic HTML (nav, main, aside landmarks)
- ARIA labels for icon-only buttons
- ARIA live regions for dynamic content (toasts, save status)
- Proper heading hierarchy (H1-H6)
- Form labels associated with inputs

**Color Contrast:**

- Validate all text meets 4.5:1 minimum contrast
- Large text meets 3:1 minimum
- UI components meet 3:1 minimum
- High contrast mode support (7:1 via `prefers-contrast: high`)

**Touch Targets:**

- Minimum 44x44px touch targets on mobile
- 8px minimum spacing between targets
- Increased button sizes on mobile (48px height inputs)

**Reference**: `prose/designs/frontend/ACCESSIBILITY.md`, `prose/designs/frontend/DESIGN_SYSTEM.md`

### 8.2 Form Validation & Error Handling

**Client-Side Validation:**

- Progressive enhancement (works without JS)
- Immediate feedback on blur
- Inline error messages
- Error summary at top of form

**Server-Side Validation:**

- Authoritative validation (always runs)
- Return structured error format
- Display field-specific errors
- Preserve user input on error

**Error Display:**

- Inline errors below fields (red text, alert icon)
- Error summary at form top (multiple errors)
- Toast notifications for non-field errors
- Focus first error field on submit

**Reference**: `prose/designs/frontend/DESIGN_SYSTEM.md` - Form Validation

### 8.3 Mobile Optimization

**Responsive Testing:**

- Test at all breakpoints (640px, 768px, 1024px, 1280px)
- Mobile drawer sidebar
- Tabbed editor/preview on mobile
- Bottom sheet dialogs on mobile

**Touch Optimization:**

- Larger touch targets (44px minimum)
- Touch-friendly text selection
- Virtual keyboard handling
- Auto-save on blur (mobile)

**Performance:**

- Code splitting by route
- Lazy loading heavy components (preview renderer)
- Optimized bundle sizes
- Fast initial page load (SSR)

**Reference**: `prose/designs/frontend/ARCHITECTURE.md`, `prose/designs/frontend/DESIGN_SYSTEM.md`

### 8.4 Polish & UX Enhancements

**Loading States:**

- Skeleton loaders for document list
- Spinner for save operations
- Loading delay threshold (300ms)
- Preserve previous preview during updates

**Animations:**

- 300ms transitions (per DESIGN_SYSTEM.md)
- Respect `prefers-reduced-motion`
- Smooth sidebar collapse/expand
- Fade in/out for toasts

**Empty States:**

- "No documents" message with "Create" CTA
- Empty preview when no content

**Keyboard Shortcuts Help:**

- Help dialog with all shortcuts
- Accessible via "?" key or menu
- Keyboard shortcuts in tooltips

**Reference**: `prose/designs/frontend/DESIGN_SYSTEM.md` - Loading States, Transitions

**Deliverables:**

- Section 508 compliant application
- Complete keyboard navigation
- Screen reader tested
- Mobile-responsive and touch-optimized
- Polished user experience with loading states and animations

---

## Phase 9: Additional Features & Settings

**Goal**: Implement remaining MVP features and user preferences.

**Note**: Settings implementation from Phase 6.5 is enhanced here with additional preferences.

### 9.1 Settings Dialog

**Settings Panel:**

- Auto-save toggle (enable/disable)
- Additional preferences (future: font size, theme)
- Save button to persist changes
- Cancel button to dismiss without saving

**Toggle Component:**

- Clear on/off states
- Accessible label
- Keyboard support (Space to toggle)

**Persistence:**

- Save to localStorage
- Sync with global preferences store
- Load on app initialization

**Reference**: `prose/designs/frontend/UI_COMPONENTS.md` - Dialog Component

### 9.2 Document Actions

**Download Document:**

- Download as .md file
- Filename matches document name
- Trigger via button in TopMenu

**More Actions Menu:**

- Keyboard Shortcuts: Opens help dialog
- About: Application information
- Terms of Use: Legal terms page
- Privacy Policy: Privacy information page

**Dropdown Menu Component:**

- Anchored to trigger button
- Smart positioning (flip if near edge)
- Arrow key navigation
- Dismiss on selection, outside click, or ESC

**Reference**: `prose/designs/frontend/UI_COMPONENTS.md`

### 9.3 Classification Message

**Message Display:**

- Toast notification on app load
- Message: "This system is not authorized for controlled information."

**References**
See `prose/designs/frontend/DESIGN_SYSTEM.md` - Classification Message

**Deliverables:**

- Settings dialog with auto-save toggle
- Download document functionality
- More actions menu with help/about
- Classification message toast
- Complete MVP feature set using mock providers

---

## Phase 10: Supabase Integration & Contract Validation

**Goal**: Replace mock providers with real Supabase integration and validate with contract tests.

**Note**: This is where mock providers are replaced with real Supabase integration.

### 10.1 Supabase Setup & Migration

**Supabase Project Setup:**

- Create Supabase project (cloud or self-hosted)
- Configure authentication settings
- Set up email templates (verification, password reset)
- Configure security policies
- Obtain production credentials (URL, anon key, service role key)

**Database Migration:**

- Create PostgreSQL tables matching mock schema:
  - Users table (id, email, dodid, profile JSONB, timestamps)
  - Documents table (id, owner_id, name, content, content_size_bytes, timestamps)
- Create indexes (email, dodid, owner_id+created_at)
- Add constraints (content size ≤ 524,288 bytes)
- Configure Row Level Security (RLS) policies
- Write and test migration scripts

**Reference**: `prose/designs/backend/SCHEMAS.md`

### 10.2 Supabase Provider Implementation

**SupabaseAuthProvider:**

- Implement AuthContract interface using Supabase client
- JWT validation using Supabase JWKS
- JWKS caching (24-hour cache with invalidation)
- HTTP-only cookie configuration (Secure, SameSite=Strict)
- Error mapping from Supabase errors to standard format

**SupabaseDocumentService:**

- Implement all CRUD operations using Supabase client
- Use Supabase RLS for authorization
- Optimize TOAST queries for large content fields
- Transaction support for complex operations

**Authentication Middleware:**

- Replace mock JWT validation with real Supabase validation
- JWKS verification
- Session refresh logic
- Cookie management

**Reference**: `prose/designs/backend/AUTH.md`, `prose/designs/backend/SERVICES.md`

### 10.3 Provider Switching & Environment Configuration

**Environment Configuration:**

```bash
# .env.production
USE_AUTH_MOCKS=false
USE_DB_MOCKS=false
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

**Provider Factory Update:**

```typescript
// Update provider factory to use real Supabase
export const createAuthProvider = () => {
	if (process.env.USE_AUTH_MOCKS === 'true') {
		return new MockAuthProvider();
	}
	return new SupabaseAuthProvider({
		url: process.env.SUPABASE_URL!,
		key: process.env.SUPABASE_ANON_KEY!,
		jwtSecret: process.env.SUPABASE_JWT_SECRET!
	});
};
```

**Migration Strategy:**

- Update backend to use real providers
- Run contract tests against real Supabase (all should pass)
- Update frontend API URLs if needed
- No frontend code changes required (API contract unchanged)

### 10.4 Contract Test Validation

**Run Full Contract Test Suite:**

- Enable integration tests: `RUN_INTEGRATION_TESTS=true`
- Run all contract tests against SupabaseAuthProvider
- Run all contract tests against SupabaseDocumentService
- Verify all tests pass (same behavior as mocks)
- Fix any discrepancies between mock and real behavior

**Additional Supabase-Specific Tests:**

- Email verification flow (real emails in test mode)
- Password reset flow
- Session expiry and refresh
- Concurrent access scenarios
- RLS policy verification

### 10.5 Integration Testing

**Integration Tests:**

- API endpoint tests with real database
- Authentication flows end-to-end
- Document CRUD operations
- Error handling and edge cases

**Test Data Management:**

- Seed test database with realistic data
- Cleanup scripts for test data
- Isolated test environment

**Deliverables:**

- Real Supabase integration complete
- All contract tests passing against real providers
- SupabaseAuthProvider fully functional
- SupabaseDocumentService fully functional
- Integration test suite passing
- Documentation for Supabase setup

---

## Phase 11: Testing, Deployment & Production Launch

**Goal**: Comprehensive testing, production deployment to Vercel, and launch preparation.

### 11.1 End-to-End Testing

**E2E Test Suite:**

- Complete user flows (register, login, create document, edit, save, delete)
- Authentication flows (login, logout, session refresh)
- Document management flows
- Mobile responsiveness
- Accessibility workflows

**Test Execution:**

- Run against real Supabase (staging environment)
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Mobile device testing (iOS, Android)
- Performance validation

**Reference**: `prose/designs/frontend/ACCESSIBILITY.md`

### 11.2 Performance Optimization

**Frontend:**

- Bundle size analysis and optimization
- Code splitting by route
- Lazy loading non-critical components
- Image optimization
- Debounced preview updates

**Backend:**

- Query optimization (indexes, TOAST)
- JWKS caching validation
- Connection pooling
- Rate limiting
- Response compression

**Database:**

- Index performance analysis
- Query plan optimization
- TOAST configuration for large content
- Connection pool tuning

**Monitoring:**

- Error tracking (Sentry or similar)
- Performance monitoring (Supabase analytics)
- User analytics (optional)
- API response time tracking

### 11.3 Vercel Deployment

**Project Configuration:**

- Configure SvelteKit adapter-auto (detects Vercel automatically)
- Set up Vercel project linked to Git repository
- Configure build settings:
  - Build Command: `npm run build`
  - Output Directory: `.svelte-kit/vercel` (auto-detected)
  - Install Command: `npm install`
  - Node.js Version: 20.x or later

**Environment Variables:**
Configure in Vercel dashboard:

- `SUPABASE_URL`: Production Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (sensitive)
- `SUPABASE_JWT_SECRET`: JWT secret for token validation
- `PUBLIC_APP_NAME`: Application name (client-accessible)
- `USE_AUTH_MOCKS=false`: Disable mocks in production
- `USE_DB_MOCKS=false`: Disable mocks in production

**Deployment Configuration:**

- Production branch: `main` (auto-deploy)
- Preview deployments: All pull requests
- Custom domain configuration (optional)
- HTTPS/SSL: Automatic via Vercel
- CDN: Automatic edge network

**Vercel-Specific Features:**

- Edge Functions: Automatic serverless functions
- ISR (Incremental Static Regeneration): For static pages
- Analytics: Built-in Web Vitals tracking
- Logs: Access via Vercel dashboard

**Reference**: [Vercel SvelteKit Deployment](https://vercel.com/docs/frameworks/sveltekit)

### 11.4 Database Migration & Seeding

**Production Database Setup:**

- Run migration scripts in production Supabase
- Verify all tables, indexes, and constraints
- Configure RLS policies
- Set up backup schedule
- Test rollback procedures

**Seed Data (Optional):**

- Create sample documents for demo
- Test user accounts for UAT
- Documentation for seeding process

### 11.5 Launch Preparation

**Pre-Launch Checklist:**

- [ ] All E2E tests passing
- [ ] Accessibility audit complete
- [ ] Performance benchmarks met
- [ ] Security headers configured
- [ ] Error tracking enabled
- [ ] Monitoring dashboards set up
- [ ] Database backups configured
- [ ] Deployment documentation complete
- [ ] Rollback plan documented
- [ ] User documentation ready

**Post-Deployment Validation:**

- Smoke testing in production
- Monitor error rates and performance
- Verify authentication flows
- Test document operations
- Validate mobile responsiveness

**Launch:**

- Deploy to production via Vercel
- Monitor initial traffic and errors
- Gather user feedback
- Address critical issues immediately

**Deliverables:**

- Comprehensive E2E test suite
- Production deployment to Vercel
- Performance optimizations complete
- Monitoring and error tracking active
- Complete documentation (setup, deployment, user guide)
- Launched MVP in production

---

## MVP Feature Scope

### Included in MVP

- ✅ Single-user document editing
- ✅ User authentication (Supabase in Phase 10)
- ✅ Markdown editor with formatting toolbar
- ✅ Live preview pane
- ✅ Auto-save with 7-second debounce
- ✅ Document list (create, open, delete)
- ✅ Mobile-responsive layout (drawer sidebar, tabbed editor/preview)
- ✅ Section 508 compliance
- ✅ Keyboard shortcuts
- ✅ Settings (auto-save toggle)
- ✅ Download document
- ✅ Classification message (basic implementation)

### Explicitly Excluded from MVP

- ❌ Document templates (blank markdown only)
- ❌ Document sharing/collaboration
- ❌ Version history
- ❌ Offline support
- ❌ Advanced search and filtering
- ❌ Quillmark integration (post-MVP)
- ❌ Keycloak authentication (architecture supports, not implemented)
- ❌ User profile editing (basic profile display only)
- ❌ Full classification system (basic message only)

---

## Success Criteria

### Functional Requirements

- [ ] Users can register and login with email/password
- [ ] Users can create, edit, and delete markdown documents
- [ ] Auto-save persists changes after 7 seconds
- [ ] Live preview renders markdown in real-time
- [ ] Application is fully responsive on mobile, tablet, and desktop
- [ ] All features accessible via keyboard
- [ ] Screen reader compatible

### Technical Requirements

- [ ] Section 508 compliant (WCAG 2.1 Level AA)
- [ ] Color contrast meets 4.5:1 minimum
- [ ] Touch targets minimum 44x44px on mobile
- [ ] Works with JavaScript disabled (forms submit, authentication works)
- [ ] Initial page load < 3 seconds
- [ ] Supports modern browsers (Chrome, Firefox, Safari, Edge)
- [ ] Contract tests pass for both mock and real providers
- [ ] Real Supabase integration complete and tested
- [ ] Deployed to Vercel production

### Quality Requirements

- [ ] Unit test coverage > 70%
- [ ] No critical accessibility violations (automated tools)
- [ ] Manual accessibility testing passed (keyboard, screen reader)
- [ ] Successful E2E tests for core flows
- [ ] Documentation complete (README, API docs, deployment guide)
- [ ] All contract tests pass against real Supabase

---

## Risk Mitigation

### Technical Risks

**Risk**: Mock provider divergence from real Supabase behavior  
**Mitigation**: Comprehensive contract tests, early validation in Phase 10, strict interface contracts

**Risk**: Mock-to-real provider integration issues in Phase 10  
**Mitigation**: Abstraction layer designed from start, contract tests ensure compatibility, phased rollout

**Risk**: Performance issues with large documents  
**Mitigation**: Enforce 0.5 MB limit, optimize TOAST queries, debounce preview

**Risk**: Mobile layout challenges  
**Mitigation**: Mobile-first approach, test early and often

### Scope Risks

**Risk**: Feature creep beyond MVP  
**Mitigation**: Strict adherence to excluded features list, defer to post-MVP

**Risk**: Accessibility compliance delays  
**Mitigation**: Build accessibility in from start, test incrementally

**Risk**: Phase 10 integration taking longer than expected  
**Mitigation**: Well-tested contract interface, comprehensive mock coverage, clear migration path

### Deployment Risks

**Risk**: Vercel deployment issues  
**Mitigation**: Test deployment to Vercel preview early, use staging environment, gradual rollout

**Risk**: Database migration failures  
**Mitigation**: Version control migrations, test migration scripts, backup procedures

**Risk**: Supabase setup complexity  
**Mitigation**: Follow official documentation, use Supabase CLI, start with simple configuration

---

## Development Benefits: Mock-First Approach

### Advantages for AI Agent Development

✅ **Fast Environment Startup**: No Docker/external dependencies required  
✅ **Parallel Development**: Agents work independently without resource conflicts  
✅ **Deterministic Testing**: Controlled mock state for reliable tests  
✅ **No External Dependencies**: No Supabase account, database setup, or API keys needed  
✅ **Easy Debugging**: Inspect mock state directly, add logging  
✅ **Cost Effective**: No test database costs during development  
✅ **Quick Iteration**: Modify mock behavior instantly for testing edge cases  
✅ **Offline Development**: Work without internet connection

### When Mocks Are Used

- **Phases 1-9**: All development uses mock providers
- **Unit Tests**: Always use mocks for isolated testing
- **Component Tests**: Use mocks for frontend component testing
- **Local Development**: Developers can use mocks for fast iteration

### When Real Supabase Is Used

- **Phase 10**: Integration and production deployment
- **Integration Tests**: Validate against real Supabase in CI/CD
- **Staging Environment**: Pre-production testing with real services
- **Production**: Final deployment with production Supabase instance

---

## Post-MVP Roadmap

### Phase 12: Quillmark Integration

- Integrate Quillmark for formatted document output
- USAF memo templates
- Document export to PDF/DOCX

### Phase 13: Collaboration Features

- Document sharing (read-only, edit permissions)
- Real-time collaborative editing
- Comment threads

### Phase 14: Advanced Features

- Document version history
- Search and filtering
- Document templates library
- Tags and categories

### Phase 15: Enterprise Features

- Keycloak authentication provider
- SSO/SAML integration
- Advanced user management
- Audit logging

---

## References

### Design Documents

**Backend:**

- `prose/designs/backend/AUTH.md`: Authentication architecture
- `prose/designs/backend/SCHEMAS.md`: Database schemas
- `prose/designs/backend/SERVICES.md`: Service layer specifications

**Frontend:**

- `prose/designs/frontend/INDEX.md`: Frontend documentation overview
- `prose/designs/frontend/ARCHITECTURE.md`: SvelteKit architecture
- `prose/designs/frontend/API_INTEGRATION.md`: Backend integration patterns
- `prose/designs/frontend/DESIGN_SYSTEM.md`: Design tokens and visual specifications
- `prose/designs/frontend/STATE_MANAGEMENT.md`: State management patterns
- `prose/designs/frontend/UI_COMPONENTS.md`: Component specifications
- `prose/designs/frontend/ACCESSIBILITY.md`: Section 508 compliance requirements

### External Resources

- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/what-are-runes)
- [Tailwind CSS](https://tailwindcss.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Section 508 Standards](https://www.section508.gov/)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [Vercel SvelteKit Deployment](https://vercel.com/docs/frameworks/sveltekit)

---

## Key Changes from Original Plan

### Phase Restructuring

1. **Split Phase 10** into two distinct phases:
   - **Phase 10**: Focus on Supabase integration and contract validation
   - **Phase 11**: Focus on comprehensive testing and Vercel deployment

2. **Incremental E2E Testing**: Added lightweight E2E tests in Phases 5, 6, and 7 to catch issues early without slowing iteration speed

### Technical Specifications

3. **JWT Mock Token Structure**: Added detailed `MockTokenPayload` interface specification to ensure Phase 10 migration is seamless

4. **Vercel Deployment Details**: Specified Vercel as deployment platform with configuration details (adapter-auto, environment variables, build settings)

### Development Philosophy

5. **Accept Technical Debt**: Plan acknowledges that accessibility, security, and mobile testing are backloaded to prioritize fast iteration with AI coding tools

6. **Contract-First Approach**: Emphasized contract testing framework to ensure mock-to-real provider compatibility

---

_This revised MVP plan incorporates feedback to enable fast, AI-agent-driven development while maintaining a clear path to production deployment on Vercel. The mock-first strategy with contract validation ensures seamless Supabase integration in Phase 10._
