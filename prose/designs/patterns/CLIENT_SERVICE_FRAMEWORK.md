# Client Service Framework

This document defines the unified framework for client-side services (browser-based singleton services with async initialization).

> **Related**: [SERVICES.md](../backend/SERVICES.md) for overall service architecture
> **Scope**: Client-side services only (templates, quillmark). Server-side services use factory pattern (see SERVICES.md).

## Overview

Client-side services in Tonguetoquill share identical lifecycle patterns:

- Singleton pattern for browser-wide instance management
- Async initialization with resource loading
- Ready state validation before operations
- Type-safe error handling

This framework eliminates 80-100 lines of boilerplate per service by providing a shared base class.

## Service Categories

### Client Services (This Framework)

**Characteristics:**

- Run in browser only
- Single instance per application lifecycle
- Async initialization (load WASM, fetch manifests, etc.)
- Stateful (maintain loaded resources)

**Examples:**

- QuillmarkService (WASM engine, Quill registry)
- TemplateService (template manifest, lazy content loading)

### Server Services (Not This Framework)

**Characteristics:**

- Run on server only
- Factory functions for environment-based selection
- No initialization boilerplate
- Stateless (request/response)

**Examples:**

- Document provider (mock vs API selection)
- Auth provider (mock vs Supabase selection)

**Note**: Server services already use clean factory pattern. No abstraction needed.

## Design Principles

### 1. Separation of Concerns

**Framework provides (generic):**

- Singleton instance management
- Initialization lifecycle with idempotency
- Ready state tracking
- Validation helpers

**Services provide (specific):**

- Business logic and domain operations
- Resource loading strategy
- Error handling for domain operations

### 2. Type Safety

- Abstract base class with TypeScript generics
- Concrete services implement typed interfaces
- Compile-time validation of initialization requirements

### 3. Idempotent Initialization

- Multiple `initialize()` calls are safe (returns immediately if already initialized)
- No race conditions when initializing from multiple components
- Clear initialization state tracking

### 4. Defensive Validation

- All public methods validate initialization state
- Helpful error messages guide developers
- Fail fast with clear diagnostics

## Framework Architecture

### Base Class Responsibilities

**Singleton Management:**

- Private static instance storage
- Private constructor enforcement
- Public getInstance() accessor

**Initialization Lifecycle:**

- Idempotent initialization wrapper
- Abstract doInitialize() hook for concrete implementation
- Initialization state tracking
- Error propagation with context

**State Validation:**

- isReady() check for external consumers
- validateInitialized() helper for internal use
- Clear error messages for uninitialized access

### Service Implementation Responsibilities

**Domain Logic:**

- Implement abstract doInitialize() method
- Implement business operations
- Define service-specific interfaces

**Resource Management:**

- Load external resources (WASM, manifests, etc.)
- Manage internal state
- Clean up resources if needed

**Error Handling:**

- Define service-specific error types
- Throw appropriate errors from operations
- Provide diagnostic information

## Lifecycle Pattern

### Initialization Flow

```
Application startup
  │
  ├─> Service getInstance()
  │   └─> Creates instance if needed
  │
  └─> Service initialize()
      │
      ├─> Check initialized flag
      │   └─> If true: return immediately (idempotent)
      │
      ├─> Call doInitialize() (abstract, implemented by service)
      │   └─> Service loads resources
      │
      └─> Set initialized = true
```

### Operation Flow

```
Client calls service method
  │
  ├─> validateInitialized()
  │   └─> Throw error if not initialized
  │
  └─> Execute business logic
```

## Service Implementation Pattern

### Concrete Service Structure

**Each service:**

1. Extends ClientService base class
2. Implements doInitialize() for resource loading
3. Defines service-specific interface
4. Implements business operations
5. Validates initialization in public methods

**Boilerplate eliminated:**

- No manual singleton pattern (base provides)
- No initialize() wrapper (base provides)
- No isReady() implementation (base provides)
- No validateInitialized() helper (base provides)

**Code reduction:**

- ~80-100 lines eliminated per service
- Only domain logic remains

## Error Handling Strategy

### Framework Errors

**Not Initialized Error:**

- Thrown when methods called before initialization
- Includes service name and helpful message
- Guides developer to call initialize() first

### Service Errors

**Domain-Specific Errors:**

- Each service defines own error types
- Errors thrown from doInitialize() propagate through framework
- Errors thrown from operations handled by service

## Type Safety Guarantees

### Compile-Time Checks

- Abstract methods must be implemented
- Type signatures enforced by base class
- Generic constraints prevent misuse

### Runtime Checks

- Initialization state validated at runtime
- Clear error messages for contract violations
- Defensive programming prevents undefined behavior

## Migration Strategy

### For Existing Services

**Step 1**: Extend base class instead of standalone implementation
**Step 2**: Move initialization logic to doInitialize()
**Step 3**: Remove boilerplate (getInstance, initialize, isReady, validateInitialized)
**Step 4**: Verify tests pass unchanged

**Behavior guarantee**: External API remains identical

### For New Services

**Step 1**: Extend ClientService base
**Step 2**: Implement doInitialize() hook
**Step 3**: Add business methods
**Step 4**: Export singleton instance

**Result**: 5-10 lines instead of 80-100 lines for lifecycle

## Usage Examples

### Application Initialization

**Single Service:**

```typescript
await quillmarkService.initialize();
```

**Multiple Services:**

```typescript
await Promise.all([quillmarkService.initialize(), templateService.initialize()]);
```

### Ready State Check

**Before Operations:**

```typescript
if (service.isReady()) {
	// Service ready for use
}
```

### Error Handling

**Initialization Errors:**

```typescript
try {
	await service.initialize();
} catch (error) {
	// Handle initialization failure
}
```

## Design Decisions

### Why Abstract Base Class?

- **Code Reuse**: Eliminates duplication across services
- **Consistency**: All client services behave identically
- **Maintainability**: Fix once, benefit everywhere
- **Simplicity**: New services trivial to implement

### Why Not Server Services?

- **Different Pattern**: Server services already use clean factory pattern
- **No Boilerplate**: Factory functions have minimal overhead
- **Appropriate Abstraction**: Different environments need different patterns
- **Avoid Over-Engineering**: Don't abstract what's already clean

### Why Singleton Pattern?

- **Browser Constraint**: Single JavaScript context
- **Resource Efficiency**: Share expensive resources (WASM, manifests)
- **State Consistency**: Single source of truth
- **Simple Consumption**: Easy to import and use

### Why Idempotent Initialization?

- **Component Safety**: Multiple components can call initialize()
- **No Coordination**: No need to track "who initializes"
- **Race Condition Free**: Safe concurrent initialization attempts
- **Developer Experience**: Forgiving API reduces errors

## Constraints and Limitations

### Current Scope

- ✅ Client-side services only
- ✅ Browser environment
- ✅ Singleton pattern enforcement
- ✅ Async initialization lifecycle
- ✅ Ready state management

### Out of Scope

- ❌ Server-side services (use factory pattern)
- ❌ Multiple instances per service
- ❌ Synchronous initialization
- ❌ Service destruction/cleanup
- ❌ Service dependencies/injection

### Future Considerations

**Service Dependencies:**

- If services need to depend on each other
- May add dependency injection framework
- Current scope: independent services

**Service Lifecycle:**

- If services need cleanup/destruction
- May add dispose() pattern
- Current scope: singleton lifetime = app lifetime

**Worker Thread Support:**

- If services need to run in Web Workers
- May add worker proxy pattern
- Current scope: main thread only

## Impact

### Code Reduction

**Per Service:**

- Eliminates: ~80-100 lines of boilerplate
- Retains: ~50-200 lines of business logic
- Net: 30-50% code reduction

**Across Codebase:**

- Current: 2 services (quillmark, templates)
- Savings: ~160-200 lines eliminated
- Future: Additional services become trivial

### Cognitive Load Reduction

**For Service Authors:**

- No need to understand singleton pattern
- No need to implement initialization lifecycle
- Focus only on domain logic

**For Service Consumers:**

- Consistent API across all services
- Predictable initialization behavior
- Standard error handling

### Maintainability Improvement

**Single Source of Truth:**

- Lifecycle bugs fixed once
- API changes propagate automatically
- Testing pattern shared

## Cross-References

- [SERVICES.md](../backend/SERVICES.md) - Overall service architecture (server vs client)
- [quillmark/SERVICE.md](../quillmark/SERVICE.md) - QuillmarkService implementation
- [backend/TEMPLATE_SERVICE.md](../backend/TEMPLATE_SERVICE.md) - TemplateService implementation
- [frontend/ARCHITECTURE.md](../frontend/ARCHITECTURE.md) - Client architecture

---

_Document Status: Design - Describes Desired State_
