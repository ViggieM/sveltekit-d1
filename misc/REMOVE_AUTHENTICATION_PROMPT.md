# Remove Authentication Prompt

This prompt can be used to remove all authentication features from this SvelteKit application.

---

Remove all authentication features from this SvelteKit application. This includes:

## 1. Database Schema

Remove user and session tables from `src/lib/server/db/schema.ts`:

- Delete `user` table definition
- Delete `session` table definition
- Delete `User` and `Session` type exports
- Leave only the import statement and a comment placeholder

## 2. Server Utilities

Delete the entire file:

- `src/lib/server/auth.ts` (contains session management, token generation, password validation)

## 3. Routes

Delete entire route directories:

- `src/routes/login/` (including `+page.svelte`, `+page.server.ts`, `auth.remote.ts`)
- `src/routes/profile/` (including `+page.svelte`, `+page.server.ts`, `logout.remote.ts`)
- `src/routes/users.remote.ts`

## 4. Hooks

Update `src/hooks.server.ts`:

- Remove the `handleAuth` function
- Remove `import * as auth from '$lib/server/auth'`
- Remove the `sequence()` call
- Keep only the database initialization logic in a single `handle` function
- The final handle should only set `event.locals.db = getDb(event.platform!.env.DB)`

## 5. Type Definitions

Update `src/app.d.ts`:

- In `App.Locals` interface, remove `user` and `session` properties
- Keep only `db: ReturnType<typeof import('$lib/server/db').getDb>`

## 6. UI Components

Update `src/routes/+layout.svelte`:

- Remove all authentication UI (user dropdown, login button, profile links)
- Remove `data` from props (keep only `children`)
- Simplify navbar to show only the app title/logo
- Remove `import { enhance } from '$app/forms'` if no longer needed

Update `src/routes/+layout.server.ts`:

- Remove `user: locals.user ?? null` from the return statement
- Return empty object or minimal data

Update `src/routes/+page.svelte`:

- Remove any user-related content or examples
- Remove imports of auth-related remote functions

## 7. Dependencies

Uninstall authentication-specific packages:

```bash
pnpm remove @oslojs/crypto @oslojs/encoding valibot
```

Packages to remove:

- `@oslojs/crypto` - Used for SHA-256 hashing of session tokens
- `@oslojs/encoding` - Used for base32/base64 encoding of tokens and user IDs
- `valibot` - Used for form validation in login/register forms

## 8. Database Migrations

Generate new migrations after schema changes:

```bash
pnpm db:generate
```

This will create a migration file that drops the user and session tables.

---

## Result

After removal, the app should have:

- Clean database schema in `src/lib/server/db/schema.ts` (empty or ready for new tables)
- Simplified `src/hooks.server.ts` with only database initialization
- Basic layout without auth UI
- Updated `src/app.d.ts` with only necessary locals (db)
- Simple homepage without user-related features
- No authentication-related dependencies
