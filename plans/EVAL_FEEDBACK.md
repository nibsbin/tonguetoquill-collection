# Iterate design docs

Make the following changes to the design ndocs based on my analysis of your `plans/BACKEND_DESIGN_EVAL.md`. As a reminder. design docs should be high-level and contain minimal code.

## Unnecessary Features

**AUTH.md**
1. We will NEED dual auth support soon; however, we could focus on Supabase for the MVP. We should build the MVP auth on top of the abstraction.
2. We need to support both eventually. Just add `GET /auth/callback` as a stub for now.
3. Good point. Remove the unnecessary Docshare schema.
4. Remove Docshare schema.

**SERVICES.md**
5. Good point. Remove login service placeholder.

## Missing Features

**AUTH.md**
1. Good point. Specify the proxied registration route.
2. Create backend routes for password reset and email verification that send the request to auth provider.
3. Refresh when ~2 minutes remaining on access token. Also handle 401s as fallback (clock skew, edge cases).
4. Good point. Document error response format for auth failures.

**SCHEMAS.md**
5. Good point. specify the Users table. It should have a UUID, email, and DODID.
6. Add index specifications for Documents table.
7. Add On Delete behavior that deletes documents belonging to the user.
8. Use timestamp with time zones for all time stamps.

**SERVICES.md**
9. Add basic authorization logic.
10. Add basic error specifications.
11. Add basic validation rules.
12. The intent of this function is to list relevant metadata about documents for displaying in a list in the frontend for the user to select. Document contents should only ever be loaded individually. Rework the schema/service for this flow.

## Ambiguous Specifications

**AUTH.md**

1. We need to build with both in mind, but specify that we will only develop for Supabase for now.
2. Specify JWKS endpoint usage and caching strategy.
3. Do not specify exact configurations. Stay high level.
4. You may provide more detail about validation of claims but stay high level.

**SCHEMAS.md**
5. The fields in the Users table will be remain constant for identity, but the fields in UserProfiles are subject to significant change in the future. We could include all the user profile data in a JSONB field within Users.
6. These limits are arbitrary. Use your discretion for changing the VARCHAR strategy.
7. Let's cap the maximum size for the content at 0.5 MB

**SERVICES.md**
8. You may add more specification to the method signatures, but use minimal code and keep it high level.
9. Good point. there should be a way to update the name as well.
10. Good point. Propose a basic strategy for authentication context.
