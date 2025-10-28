# Backend Design Evaluation

This document evaluates the backend design specifications in `designs/backend/` to identify unnecessary features, missing features, and ambiguous specifications. Recommendations follow the KISS (Keep It Simple, Stupid) principle.

## Documents Reviewed
- `AUTH.md` - Authentication architecture
- `SCHEMAS.md` - Database schemas  
- `SERVICES.md` - Service layer design

---

## Unnecessary Features

### AUTH.md

**1. Dual Authentication Provider Support**
- **Issue**: Supporting both Keycloak AND Supabase adds significant complexity
- **Impact**: Requires abstraction layer, dual configuration, dual testing, dual maintenance
- **Recommendation**: Choose ONE provider based on deployment needs
  - **Keycloak**: If self-hosting or enterprise features needed
  - **Supabase**: If serverless/managed solution preferred
- **KISS**: Single provider = simpler code, fewer edge cases, easier debugging

**2. OAuth Callback Route (Conditional)**
- **Issue**: `GET /auth/callback` only needed for Keycloak, not Supabase
- **Recommendation**: If choosing Supabase, remove this route entirely
- **KISS**: Don't implement provider-specific routes if not using that provider

### SCHEMAS.md

**3. Docshare Schema (Explicitly Marked Future)**
- **Issue**: Entire Docshare table marked "DO NOT IMPLEMENT YET"
- **Recommendation**: Remove from design document until needed
- **KISS**: Don't design what you're not building. Add when actually needed.

**4. Complex Docshare Constraints (If Kept)**
- **Issue**: Elaborate check constraints for public vs. user-specific shares
- **Recommendation**: Start simple - implement sharing when needed with minimal viable design
- **KISS**: Over-engineering constraints for future features wastes design effort

### SERVICES.md

**5. Login Service Placeholder**
- **Issue**: "Login" service header with no content
- **Recommendation**: Remove or merge with Document service description
- **KISS**: Empty sections create confusion

---

## Missing Features

### AUTH.md

**1. User Registration Flow**
- **Issue**: No specification for `POST /auth/register` or user creation
- **Impact**: Frontend has no documented way to create new users
- **Recommendation**: Add registration endpoint specification or clarify provider handles it

**2. Password Reset/Email Verification Routes**
- **Issue**: Document mentions providers handle these but no backend routes specified
- **Impact**: Unclear if backend proxies these or frontend calls provider directly
- **Recommendation**: Specify backend routes or explicitly state "frontend calls provider directly"

**3. Token Expiry Details**
- **Issue**: Access token = 15min, Refresh = 7 days, but no refresh strategy timing
- **Impact**: When should frontend refresh? On 401? Proactively? 
- **Recommendation**: Specify token refresh strategy and timing

**4. Error Response Formats**
- **Issue**: No specification for authentication error responses
- **Impact**: Frontend doesn't know expected error structure
- **Recommendation**: Document error response format for auth failures

### SCHEMAS.md

**5. Users Table Missing**
- **Issue**: `UserProfiles` references `Users(id)` but Users table not defined
- **Impact**: Cannot implement schema without Users table definition
- **Recommendation**: Add Users table schema or clarify provider manages it

**6. Missing Indexes**
- **Issue**: No index specifications for performance
- **Impact**: Queries like "list user documents" will be slow without indexes
- **Recommendation**: Add indexes on `Documents.owner_id`, `Documents.created_at`

**7. On Delete Behavior**
- **Issue**: Foreign key constraints lack ON DELETE specifications
- **Impact**: What happens to UserProfiles when User deleted? Documents when owner deleted?
- **Recommendation**: Specify CASCADE, SET NULL, or RESTRICT for all foreign keys

**8. Timestamp Time Zones**
- **Issue**: TIMESTAMP vs TIMESTAMP WITH TIME ZONE not specified
- **Impact**: Time zone handling ambiguous, can cause bugs
- **Recommendation**: Use `TIMESTAMP WITH TIME ZONE` for all timestamps

### SERVICES.md

**9. Authorization Logic Missing**
- **Issue**: No specification for ownership verification
- **Impact**: How does `getDocument` verify user owns/can-access document?
- **Recommendation**: Specify authorization checks for each method

**10. Error Handling Missing**
- **Issue**: No specification for error cases (document not found, unauthorized, etc.)
- **Impact**: Service behavior undefined for failure cases
- **Recommendation**: Document expected exceptions/errors for each method

**11. Validation Rules Missing**
- **Issue**: No specification for input validation (name length, content limits, etc.)
- **Impact**: Database errors instead of meaningful validation errors
- **Recommendation**: Specify validation rules for document creation/updates

**12. Pagination Missing**
- **Issue**: `listUserDocuments` has no pagination specification
- **Impact**: Will fail or be slow for users with many documents
- **Recommendation**: Add pagination parameters (limit, offset or cursor-based)

---

## Ambiguous Specifications

### AUTH.md

**1. "Keycloak or Supabase" Decision**
- **Ambiguity**: When is each used? Is this runtime switchable?
- **Clarification Needed**: 
  - Is this a deployment-time decision OR runtime configuration?
  - Can a deployment change providers without data migration?
- **Recommendation**: Specify this is a ONE-TIME architectural decision per deployment

**2. JWT Signature Verification**
- **Ambiguity**: "Verifying JWT signature using the provider's public keys"
- **Clarification Needed**: 
  - Where are public keys retrieved from?
  - How often are they refreshed?
  - What happens if key rotation occurs?
- **Recommendation**: Specify JWKS endpoint usage and caching strategy

**3. Token Storage Cookies**
- **Ambiguity**: "Scoped Path and Domain as appropriate"
- **Clarification Needed**: What ARE the appropriate values?
- **Recommendation**: Specify exact cookie configuration values

**4. "Required Claims"**
- **Ambiguity**: "Validating required claims (user ID, roles, etc.)"
- **Clarification Needed**: Which claims are required? What roles exist?
- **Recommendation**: Enumerate all required JWT claims and their meanings

### SCHEMAS.md

**5. UserProfiles vs Users Relationship**
- **Ambiguity**: Why separate UserProfiles from Users table?
- **Clarification Needed**: 
  - What's in Users table (managed by auth provider)?
  - Could this be a single table?
- **Recommendation**: Clarify separation rationale or merge into one table

**6. VARCHAR Lengths**
- **Ambiguity**: first_name/last_name = 50 chars, name = 255 chars
- **Clarification Needed**: Are these limits based on requirements or arbitrary?
- **Recommendation**: Justify length limits or use TEXT with application-level validation

**7. Content Field Type**
- **Ambiguity**: Document content as TEXT (unlimited?)
- **Clarification Needed**: 
  - Is there a maximum document size?
  - Performance implications for large documents?
- **Recommendation**: Specify maximum content size or use chunked storage strategy

### SERVICES.md

**8. Method Signatures Incomplete**
- **Ambiguity**: Parameters and return types shown but not complete
- **Clarification Needed**: 
  - What's in the Document type? (matches schema?)
  - What exceptions can be thrown?
  - Are these synchronous or async methods?
- **Recommendation**: Provide complete method signatures with return types and exceptions

**9. updateDocument Parameters**
- **Ambiguity**: Only `content` parameter for update, but schema has `name` too
- **Clarification Needed**: Can name be updated? How?
- **Recommendation**: Specify all updatable fields or add `updateDocumentName` method

**10. Authentication Context**
- **Ambiguity**: How do services know the current user?
- **Clarification Needed**: 
  - Is `ownerId` passed explicitly or from auth context?
  - How is authorization enforced?
- **Recommendation**: Specify authentication/authorization pattern (middleware, context, etc.)

---

## Summary of Recommendations

### Simplify (Remove/Defer)
1. **Remove dual auth provider support** - Choose ONE (Keycloak OR Supabase)
2. **Remove Docshare schema** - Design when actually needed
3. **Remove empty "Login" section** from SERVICES.md

### Add Missing Specifications
1. **AUTH.md**: Registration endpoint, password reset flow, error formats
2. **SCHEMAS.md**: Users table definition, indexes, ON DELETE behavior, time zones
3. **SERVICES.md**: Authorization logic, error handling, validation rules, pagination

### Clarify Ambiguities
1. **AUTH.md**: Provider selection timing, JWT verification details, cookie config, required claims
2. **SCHEMAS.md**: UserProfiles/Users separation, field length justifications, content size limits
3. **SERVICES.md**: Complete method signatures, updatable fields, auth context pattern

### KISS Priority Actions
1. **Pick one auth provider** - Reduces complexity by 50%
2. **Remove future features** - Don't design Docshare until needed
3. **Complete the Users table** - Can't implement without it
4. **Add authorization specs** - Critical security requirement
5. **Specify error handling** - Required for robust implementation

---

## Conclusion

The backend designs provide a good starting foundation but lack critical details for implementation. The biggest KISS violation is the dual authentication provider design - supporting both Keycloak and Supabase approximately doubles authentication complexity for uncertain benefit. 

The SCHEMAS.md file is incomplete (missing Users table, indexes, FK behaviors) and includes a future feature (Docshare) that shouldn't be in initial designs. The SERVICES.md file is too skeletal - missing authorization, validation, error handling, and pagination.

**Recommendation**: Simplify by choosing ONE auth provider, complete the missing Users table schema, remove future features, and add the missing authorization/validation/error specifications before implementation begins.
