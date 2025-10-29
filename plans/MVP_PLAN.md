# Tonguetoquill MVP Implementation Plan

## Overview

This document outlines a phased approach to implementing the Tonguetoquill MVP - a professional markdown document editor with authentication, auto-save, and Section 508 compliance. The plan balances backend and frontend development to enable incremental testing and validation.

**Technology Stack:**
- **Frontend**: SvelteKit 5, TypeScript, Tailwind CSS 4.0
- **Backend**: Node.js/Express (or similar), PostgreSQL
- **Authentication**: Supabase Auth (MVP provider)
- **Deployment**: Adapter-auto for development, adapter-node for production

**MVP Scope**: Single-user document editing with authentication, markdown editor, live preview, auto-save, and mobile-responsive UI.

---

## Phase 1: Foundation & Infrastructure

**Goal**: Establish project structure, development environment, and core infrastructure.

### 1.1 Project Initialization

**Backend:**
- Initialize Node.js project with TypeScript
- Set up Express server framework
- Configure PostgreSQL database connection
- Set up environment variable management (.env files)
- Configure CORS and security middleware
- Set up error handling middleware

**Frontend:**
- Initialize SvelteKit 5 project with TypeScript
- Configure Tailwind CSS 4.0
- Set up project structure with route groups: `(app)`, `(auth)`, `(marketing)`
- Install core dependencies: Lucide Svelte (icons), Svelte Sonner (toasts)
- Configure TypeScript strict mode
- Set up environment variable management

**Development Tools:**
- Configure ESLint and Prettier for both projects
- Set up git hooks (pre-commit linting)
- Create development scripts (dev, build, test)
- Set up hot reload for both frontend and backend

**Deliverables:**
- Working development environment for both frontend and backend
- Basic "Hello World" endpoints and pages
- Documented setup instructions in README files

---

## Phase 2: Database & Authentication Backend

**Goal**: Implement database schemas and authentication infrastructure.

### 2.1 Database Schema

**Tasks:**
- Create PostgreSQL database
- Implement Users table (id, email, dodid, profile JSONB, timestamps)
- Implement Documents table (id, owner_id, name, content, content_size_bytes, timestamps)
- Create indexes (email, dodid, owner_id+created_at)
- Add constraints (content size ≤ 524,288 bytes)
- Write database migration scripts

**Reference**: `designs/backend/SCHEMAS.md`

### 2.2 Supabase Authentication Integration

**Tasks:**
- Set up Supabase project
- Configure Supabase environment variables (URL, anon key, JWT secret)
- Implement authentication abstraction layer for future provider support
- Create authentication middleware for JWT validation
- Implement JWKS caching (24-hour cache with invalidation)
- Set up HTTP-only cookie configuration (Secure, SameSite=Strict)

**Reference**: `designs/backend/AUTH.md`

### 2.3 Authentication Routes

**Implement Routes:**
- `POST /auth/register`: User registration (proxy to Supabase)
- `POST /auth/login`: User login, set HTTP-only cookies
- `POST /auth/refresh`: Refresh access tokens
- `POST /auth/logout`: Clear session cookies
- `POST /auth/reset-password`: Password reset flow
- `POST /auth/verify-email`: Email verification
- `GET /auth/me`: Get current user information
- `GET /auth/callback`: OAuth callback stub (future Keycloak)

**Error Handling:**
- Implement standard error response format: `{ "error": "error_code", "message": "description" }`
- Handle common auth errors (401, 403, 400)

**Deliverables:**
- Complete authentication system with Supabase
- JWT validation middleware
- Protected route decorator/middleware
- Documented API endpoints

---

## Phase 3: Document Service Backend

**Goal**: Implement document CRUD operations with authorization.

### 3.1 Document Service Implementation

**Core Methods:**
- `createDocument(userId, name, content)`: Create new document
- `getDocumentMetadata(userId, documentId)`: Get metadata only (TOAST optimization)
- `getDocumentContent(userId, documentId)`: Get full document with content
- `updateDocumentContent(userId, documentId, content)`: Update content
- `updateDocumentName(userId, documentId, name)`: Rename document
- `deleteDocument(userId, documentId)`: Delete document
- `listUserDocuments(userId, limit, offset)`: List user's documents (metadata only)

**Validation:**
- Document name: 1-255 characters, no leading/trailing whitespace
- Content: Max 524,288 bytes (0.5 MB)
- Ownership verification on all operations

**Reference**: `designs/backend/SERVICES.md`

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
- All routes require authentication
- Verify document ownership before any operation

**Error Handling:**
- 404: Document not found
- 403: Not authorized (wrong owner)
- 400: Validation errors
- 413: Content too large

**Deliverables:**
- Complete document service with authorization
- API endpoints for all document operations
- Unit tests for service methods
- API integration tests

---

## Phase 4: Frontend Authentication & Layout

**Goal**: Implement authentication UI and application layout structure.

### 4.1 Authentication UI

**Login Page (`(auth)/login`):**
- Email and password form
- Client-side validation (progressive enhancement)
- Server action for authentication
- Error display (inline + summary)
- Redirect to app on success

**Registration Flow:**
- Registration form with email, password, DODID
- Server-side validation
- Email verification flow
- Success/error handling

**Session Management:**
- Server hooks for JWT validation
- Automatic token refresh (proactive, 5 minutes before expiry)
- Redirect to login on auth failure
- User context in page data

**Reference**: `designs/backend/AUTH.md`, `designs/frontend/API_INTEGRATION.md`

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

**Reference**: `designs/frontend/UI_COMPONENTS.md`, `designs/frontend/ARCHITECTURE.md`

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

**Reference**: `designs/frontend/DESIGN_SYSTEM.md`

**Deliverables:**
- Working authentication flow (login/logout)
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
- Fetch documents on app load
- Optimistic updates for create/delete
- Error handling with rollback
- Toast notifications for success/errors

**Reference**: `designs/frontend/STATE_MANAGEMENT.md`, `designs/frontend/API_INTEGRATION.md`

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

**Reference**: `designs/frontend/UI_COMPONENTS.md`

**Deliverables:**
- Document list in sidebar with navigation
- Create and delete document functionality
- Confirmation dialogs
- Optimistic updates with error handling

---

## Phase 6: Markdown Editor & Preview

**Goal**: Implement core editing experience with live preview.

### 6.1 Markdown Editor

**Editor Component:**
- Full-height textarea with monospace font
- Syntax highlighting (optional for MVP, can be post-MVP)
- Auto-indent on Enter
- Tab key inserts spaces (2 or 4)
- Undo/redo support (browser default)

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
- Additional shortcuts per DESIGN_SYSTEM.md

**Reference**: `designs/frontend/UI_COMPONENTS.md`, `designs/frontend/DESIGN_SYSTEM.md`

### 6.2 Live Preview

**Preview Component:**
- Rendered markdown in split pane
- White background with professional typography
- Max-width 800px, centered
- Generous padding (responsive)
- Debounced rendering (updates after user stops typing)

**Markdown Rendering:**
- Use markdown library (e.g., marked, remark)
- Support GitHub Flavored Markdown (tables, strikethrough)
- Syntax highlighting for code blocks (e.g., Prism.js)
- Responsive images and tables

**Performance:**
- Debounced preview updates (300-500ms delay)
- Preserve scroll position during updates
- Show previous render to avoid flashes (per DESIGN_SYSTEM.md loading states)

**Reference**: `designs/frontend/UI_COMPONENTS.md`, `designs/frontend/DESIGN_SYSTEM.md`

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

**Reference**: `designs/frontend/DESIGN_SYSTEM.md` - Navigation Patterns

**Deliverables:**
- Fully functional markdown editor with toolbar
- Live preview with debounced updates
- Responsive layout (split/tabbed views)
- Keyboard shortcuts for formatting

---

## Phase 7: Auto-Save & Document Persistence

**Goal**: Implement auto-save functionality and document state management.

### 7.1 Auto-Save Implementation

**Auto-Save Logic:**
- 7-second debounce after last keystroke
- Only save if document has unsaved changes
- Manual save via Ctrl/Cmd+S
- Network timeout: 30 seconds
- Optimistic UI (assume success, rollback on error)

**Save Status Indicator:**
- Saving: Spinner icon + "Saving..."
- Saved: Checkmark icon + "Saved" (brief display)
- Unsaved: Dot indicator or asterisk in title
- Error: Red error icon + error message

**Settings Integration:**
- Auto-save toggle in settings dialog
- Persist preference to localStorage
- Default: Auto-save enabled

**Reference**: `designs/frontend/DESIGN_SYSTEM.md` - Auto-Save Behavior

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

**Reference**: `designs/frontend/STATE_MANAGEMENT.md`, `designs/frontend/API_INTEGRATION.md`

**Deliverables:**
- Auto-save with 7-second debounce
- Save status indicators
- Settings toggle for auto-save
- Error handling with retry

---

## Phase 8: Accessibility & Polish

**Goal**: Ensure Section 508 compliance and polish user experience.

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

**Reference**: `designs/frontend/ACCESSIBILITY.md`, `designs/frontend/DESIGN_SYSTEM.md`

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

**Reference**: `designs/frontend/DESIGN_SYSTEM.md` - Form Validation

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

**Reference**: `designs/frontend/ARCHITECTURE.md`, `designs/frontend/DESIGN_SYSTEM.md`

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

**Reference**: `designs/frontend/DESIGN_SYSTEM.md` - Loading States, Transitions

**Deliverables:**
- Section 508 compliant application
- Complete keyboard navigation
- Screen reader tested
- Mobile-responsive and touch-optimized
- Polished user experience with loading states and animations

---

## Phase 9: Additional Features & Settings

**Goal**: Implement remaining MVP features and user preferences.

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

**Reference**: `designs/frontend/UI_COMPONENTS.md` - Dialog Component

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

**Reference**: `designs/frontend/UI_COMPONENTS.md`

### 9.3 Classification Banner

**Toast Notification Pattern:**
- Persistent toast at top-center
- Shows document classification level
- Color-coded by classification (Blue, Yellow, Orange, Red)
- Shield icon
- Dismissible but reappears on reload
- Z-index: 40 (toast layer)

**Implementation:**
- Use Svelte Sonner toast library
- Custom styling per DESIGN_SYSTEM.md
- Trigger on document load
- Persist across navigation (until dismissed)

**Note**: For MVP, classification level can be hardcoded or document metadata field. Full classification system is post-MVP.

**Reference**: `designs/frontend/DESIGN_SYSTEM.md` - Classification Banner

**Deliverables:**
- Settings dialog with auto-save toggle
- Download document functionality
- More actions menu with help/about
- Classification banner toast

---

## Phase 10: Testing & Deployment

**Goal**: Comprehensive testing and production deployment.

### 10.1 Testing

**Unit Tests:**
- Backend: Service methods, validation, authorization
- Frontend: Component logic, stores, utilities

**Integration Tests:**
- API endpoint tests (authentication, documents)
- Database operations
- Form actions

**E2E Tests:**
- Complete user flows (register, login, create document, edit, save, delete)
- Authentication flows
- Document management flows
- Mobile responsiveness

**Accessibility Testing:**
- Automated: axe-core integration
- Manual: Keyboard navigation, screen reader (NVDA, VoiceOver)
- Contrast validation tools
- Mobile accessibility testing

**Reference**: `designs/frontend/ACCESSIBILITY.md`

### 10.2 Performance Optimization

**Frontend:**
- Bundle size analysis and optimization
- Code splitting by route
- Lazy loading non-critical components
- Image optimization
- Debounced preview updates

**Backend:**
- Query optimization (indexes, TOAST)
- JWKS caching
- Rate limiting
- Connection pooling

**Monitoring:**
- Error tracking (Sentry or similar)
- Performance monitoring
- User analytics (optional)

### 10.3 Production Deployment

**Backend Deployment:**
- Set up production database (PostgreSQL)
- Configure environment variables (production values)
- Set up HTTPS/SSL
- Configure CORS for production domain
- Database migration scripts

**Frontend Deployment:**
- Build production bundle
- Configure SvelteKit adapter (adapter-node for self-hosted)
- Set up production environment variables
- CDN for static assets (optional)
- Configure SSL/HTTPS

**Infrastructure:**
- Containerization (Docker) optional
- CI/CD pipeline (GitHub Actions)
- Automated testing in pipeline
- Deployment automation

**Security:**
- Environment variable management (secrets)
- HTTPS enforcement
- CSRF protection
- Rate limiting
- Security headers (CSP, HSTS, etc.)

**Deliverables:**
- Comprehensive test suite
- Production-ready deployment
- CI/CD pipeline
- Monitoring and error tracking
- Documentation (setup, deployment, API)

---

## MVP Feature Scope

### Included in MVP

- ✅ Single-user document editing
- ✅ User authentication (Supabase)
- ✅ Markdown editor with formatting toolbar
- ✅ Live preview pane
- ✅ Auto-save with 7-second debounce
- ✅ Document list (create, open, delete)
- ✅ Mobile-responsive layout (drawer sidebar, tabbed editor/preview)
- ✅ Section 508 compliance
- ✅ Keyboard shortcuts
- ✅ Settings (auto-save toggle)
- ✅ Download document
- ✅ Classification banner (basic implementation)

### Explicitly Excluded from MVP

- ❌ Document templates (blank markdown only)
- ❌ Document sharing/collaboration
- ❌ Version history
- ❌ Offline support
- ❌ Advanced search and filtering
- ❌ Quillmark integration (post-MVP)
- ❌ Keycloak authentication (architecture supports, not implemented)
- ❌ User profile editing (basic profile display only)
- ❌ Full classification system (basic banner only)

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

### Quality Requirements

- [ ] Unit test coverage > 70%
- [ ] No critical accessibility violations (automated tools)
- [ ] Manual accessibility testing passed (keyboard, screen reader)
- [ ] Successful E2E tests for core flows
- [ ] Documentation complete (README, API docs, deployment guide)

---

## Timeline Estimate

**Phase 1**: 3-5 days (Foundation)  
**Phase 2**: 5-7 days (Database & Auth Backend)  
**Phase 3**: 4-6 days (Document Service)  
**Phase 4**: 5-7 days (Frontend Auth & Layout)  
**Phase 5**: 3-5 days (Document Management UI)  
**Phase 6**: 7-10 days (Editor & Preview)  
**Phase 7**: 4-6 days (Auto-Save)  
**Phase 8**: 7-10 days (Accessibility & Polish)  
**Phase 9**: 3-5 days (Additional Features)  
**Phase 10**: 5-7 days (Testing & Deployment)  

**Total Estimated Time**: 46-68 days (9-14 weeks)

*Note: Timeline assumes single developer working full-time. Adjust for team size and part-time work.*

---

## Risk Mitigation

### Technical Risks

**Risk**: Supabase integration complexity  
**Mitigation**: Start with basic auth, abstract provider layer early

**Risk**: Performance issues with large documents  
**Mitigation**: Enforce 0.5 MB limit, optimize TOAST queries, debounce preview

**Risk**: Mobile layout challenges  
**Mitigation**: Mobile-first approach, test early and often

### Scope Risks

**Risk**: Feature creep beyond MVP  
**Mitigation**: Strict adherence to excluded features list, defer to post-MVP

**Risk**: Accessibility compliance delays  
**Mitigation**: Build accessibility in from start, test incrementally

### Deployment Risks

**Risk**: Production environment issues  
**Mitigation**: Test deployment early, use staging environment

**Risk**: Database migration failures  
**Mitigation**: Version control migrations, test migration scripts

---

## Post-MVP Roadmap

### Phase 11: Quillmark Integration
- Integrate Quillmark for formatted document output
- USAF memo templates
- Document export to PDF/DOCX

### Phase 12: Collaboration Features
- Document sharing (read-only, edit permissions)
- Real-time collaborative editing
- Comment threads

### Phase 13: Advanced Features
- Document version history
- Search and filtering
- Document templates library
- Tags and categories

### Phase 14: Enterprise Features
- Keycloak authentication provider
- SSO/SAML integration
- Advanced user management
- Audit logging

---

## References

### Design Documents

**Backend:**
- `designs/backend/AUTH.md`: Authentication architecture
- `designs/backend/SCHEMAS.md`: Database schemas
- `designs/backend/SERVICES.md`: Service layer specifications

**Frontend:**
- `designs/frontend/INDEX.md`: Frontend documentation overview
- `designs/frontend/ARCHITECTURE.md`: SvelteKit architecture
- `designs/frontend/API_INTEGRATION.md`: Backend integration patterns
- `designs/frontend/DESIGN_SYSTEM.md`: Design tokens and visual specifications
- `designs/frontend/STATE_MANAGEMENT.md`: State management patterns
- `designs/frontend/UI_COMPONENTS.md`: Component specifications
- `designs/frontend/ACCESSIBILITY.md`: Section 508 compliance requirements

### External Resources

- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/what-are-runes)
- [Tailwind CSS](https://tailwindcss.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Section 508 Standards](https://www.section508.gov/)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)

---

*This MVP plan provides a structured, phased approach to building Tonguetoquill while maintaining high quality standards for accessibility, performance, and user experience.*
