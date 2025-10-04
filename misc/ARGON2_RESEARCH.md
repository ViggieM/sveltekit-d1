# Research Summary: @node-rs/argon2 Cloudflare Workers Compatibility

## Error Message

When running `pnpm wrangler dev`, the build fails with:

```
✘ [ERROR] Build failed with 1 error:

✘ [ERROR] Could not resolve "@node-rs/argon2-wasm32-wasi"

    node_modules/.pnpm/@node-rs+argon2@2.0.2/node_modules/@node-rs/argon2/browser.js:1:14:
      1 │ export * from '@node-rs/argon2-wasm32-wasi'
        ╵               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  You can mark the path "@node-rs/argon2-wasm32-wasi" as external to exclude it from the bundle,
  which will remove this error and leave the unresolved path in the bundle.
```

## The Problem

**@node-rs/argon2 is fundamentally incompatible with Cloudflare Workers** because it's a Node.js native addon (distributed as `.node` files with Rust bindings) and Cloudflare Workers uses the V8 runtime, which cannot execute native Node.js addons.

**Key Sources:**

- https://github.com/cloudflare/workerd/discussions/1905 - Node Addon binaries discussion
- https://github.com/napi-rs/node-rs/issues/862 - SvelteKit 2 & Cloudflare Page resolution issue
- https://www.answeroverflow.com/m/1304500967726907512 - Confirmation that @node-rs/argon2 doesn't work on Cloudflare Pages
- https://www.answeroverflow.com/m/1328442614789439559 - Discussion on argon2 alternatives for Cloudflare Workers

## Available Solutions

### 1. **Use scrypt via Node.js Compatibility (Recommended - Used in this fix)**

- Enable `nodejs_compat` compatibility flag in wrangler.jsonc
- Use `scrypt` from `node:crypto` module
- Secure, memory-hard password hashing algorithm

**Sources:**

- https://developers.cloudflare.com/workers/runtime-apis/nodejs/ - Node.js compatibility documentation
- https://developers.cloudflare.com/workers/runtime-apis/nodejs/crypto/ - Node.js crypto API docs
- https://community.cloudflare.com/t/options-for-password-hashing/138077 - Password hashing options discussion

### 2. **Separate Rust Cloudflare Worker**

- Create a dedicated Rust Worker with Argon2 implementation
- Use Cloudflare Service Bindings to call the Worker
- Performance: ~100ms CPU time

**Source:**

- https://mli.puffinsystems.com/blog/lucia-auth-cloudflare-argon2 - Lucia Auth with Argon2 Rust Worker guide

### 3. **Compile Argon2 to WebAssembly**

- Use argon2 C library compiled to WASM
- More complex setup

**Source:**

- https://github.com/foo4foo/cloudflare-workers-wasm-argon2-example - WASM Argon2 example

### 4. **Use WebCrypto PBKDF2**

- Native WebCrypto API support
- ⚠️ Warning: CPU-intensive, can exceed Worker CPU limits with high iteration counts

**Source:**

- https://developers.cloudflare.com/workers/runtime-apis/web-crypto/ - Web Crypto documentation

## Oslo Library Status

The Oslo project (which provides `oslo/password` with Argon2id and Scrypt support) is **deprecated**. It relied on `@node-rs/argon2` and `@node-rs/bcrypt`, making it incompatible with Cloudflare Workers.

**Sources:**

- https://oslo.js.org/reference/password/ - Oslo password hashing (deprecated)
- https://oslojs.dev/ - Oslo successor project
- https://www.npmjs.com/package/@oslojs/crypto - @oslojs/crypto (does NOT include password hashing)

## 2025 Cloudflare Workers Improvements

Cloudflare has significantly improved Node.js compatibility in 2025, including the addition of scrypt support.

**Source:**

- https://blog.cloudflare.com/nodejs-workers-2025/ - A year of improving Node.js compatibility

## Implementation in This Project

### Step 1: Enable Node.js Compatibility

Add the `nodejs_compat` flag to `wrangler.jsonc`:

```jsonc
{
	"compatibility_flags": [
		"nodejs_als",
		"nodejs_compat" // Add this line
	]
}
```

### Step 2: Replace Imports

**Before:**

```typescript
import { hash, verify } from '@node-rs/argon2';
```

**After:**

```typescript
import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
```

### Step 3: Implement Password Hashing Functions

Add these helper functions:

```typescript
async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16).toString('hex');
	const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
	return `${salt}:${derivedKey.toString('hex')}`;
}

async function verifyPassword(storedHash: string, password: string): Promise<boolean> {
	const [salt, hash] = storedHash.split(':');
	const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
	return timingSafeEqual(Buffer.from(hash, 'hex'), derivedKey);
}
```

### Step 4: Update Password Hashing Calls

**Before:**

```typescript
const passwordHash = await hash(password, {
	memoryCost: 19456,
	timeCost: 2,
	outputLen: 32,
	parallelism: 1
});
```

**After:**

```typescript
const passwordHash = await hashPassword(password);
```

### Step 5: Update Password Verification Calls

**Before:**

```typescript
const validPassword = await verify(existingUser.passwordHash, password, {
	memoryCost: 19456,
	timeCost: 2,
	outputLen: 32,
	parallelism: 1
});
```

**After:**

```typescript
const validPassword = await verifyPassword(existingUser.passwordHash, password);
```

### Step 6: Remove Dependency

Remove `@node-rs/argon2` from `package.json`:

```json
{
	"dependencies": {
		"@node-rs/argon2": "^2.0.2" // Remove this
	}
}
```

Then run `pnpm install` to update lock file.

### Complete Implementation

See `src/routes/login/+page.server.ts` for the full implementation.
