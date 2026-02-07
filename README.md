# SvelteKit on Cloudflare Worker with D1 Database (SQLite)

This is a template for the [Cloudflare C3 CLI](https://developers.cloudflare.com/pages/get-started/c3/) that initializes a new SvelteKit project with a D1 database.

**Key Features:**

- connects to D1 database with [Drizzle](https://orm.drizzle.team/docs/connect-cloudflare-d1)
- authentication with [Lucia](https://lucia-auth.com/)
- makes use of [Remote functions](https://svelte.dev/docs/kit/remote-functions) in SvelteKit
- DaisyUI for styling
- [valibot](https://valibot.dev/) for form validation

## Setup Instructions

### 1. Create a new project using this template

```bash
pnpm create cloudflare@latest --template git@github.com:ViggieM/sveltekit-d1.git [DIRECTORY] --git
cd [DIRECTORY]
pre-commit install
```

### 2. Add a new D1 database

```bash
pnpx wrangler d1 create --binding 'DB' [DATABASE_NAME]
# update types after db creation
pnpm wrangler types ./src/worker-configuration.d.ts
```

Set the "migrations_dir" of your recently created database in `wrangler.jsonc` to "drizzle".

```jsonc
// wrangler.jsonc

"d1_databases": [
  {
    // ...
    "migrations_dir": "drizzle"
  }
]
```

And generate the migrations for the tables 'user' and 'session':

```bash
pnpm run db:generate
```

### 3. Create an environment file `.env` with the following values (see `.env.example`)

<details>
    <summary>CLOUDFLARE_ACCOUNT_ID</summary>
    can be determined with `pnpx wrangler whoami`
</details>

<details>
    <summary>CLOUDFLARE_DATABASE_ID</summary>
    is the one from the previous step (in `wrangler.jsonc` "d1_databases" settings)
</details>

<details>
<summary>
  CLOUDFLARE_D1_TOKEN
</summary>
<ul>
    <li><a href="https://dash.cloudflare.com/?to=/:account/api-tokens">Go to Account API tokens</a> (or <a href="https://dash.cloudflare.com/profile/api-tokens">User API Tokens</a>)</li>
  <li>Under <strong>API Tokens</strong>, select <strong>Create Token</strong>.</li>
  <li>Scroll to <strong>Custom token</strong> > <strong>Create custom token</strong>, then select <strong>Get started</strong>.</li>
  <li>Under <strong>Token name</strong>, enter a descriptive token name. For example, <code>Name-D1-Import-API-Token</code>.</li>
  <li>Under <strong>Permissions</strong>:
    <ul>
      <li>Select <strong>Account</strong>.</li>
      <li>Select <strong>D1</strong>.</li>
      <li>Select <strong>Edit</strong>.</li>
    </ul>
  </li>
  <li>Select <strong>Continue to summary</strong>.</li>
  <li>Select <strong>Create token</strong>.</li>
  <li>Copy the API token and save it in a secure file. (i.e. in the <code>.env</code> file as <code>CLOUDFLARE_D1_TOKEN</code>)</li>
</ul>
</details>

### 4. Add these secrets also to your worker

```bash
npx wrangler secret put CLOUDFLARE_ACCOUNT_ID
npx wrangler secret put CLOUDFLARE_DATABASE_ID
npx wrangler secret put CLOUDFLARE_D1_TOKEN
# update types after secrets or env variables update
pnpm wrangler types ./src/worker-configuration.d.ts
```

### 5. Generate and apply database migrations (locally)

```bash
# generate migrations in the /drizzle folder
pnpm drizzle-kit generate

# apply migrations locally
pnpm wrangler d1 migrations apply [DATABASE_NAME] --local
```

Wrangler will create a local SQLite inside `.wrangler/state/v3/d1/` and apply those migrations to it.
You can test your setup locally with:

```bash
pnpm wrangler preview
```

### 6. Deploy your worker

```bash
# apply migrations to remote D1 database
pnpm drizzle-kit migrate

# deploy project to cloudflare workers
pnpm wrangler deploy

# follow logs
pnpm wrangler tail
```

## Where can we go from here?

- Add GitHub / Google authentication
- Add a 404/500 error page
- Improve logout: ATM there are two ways it is done, but I didn't decide yet which one is better
- In case you don't need any authentication, use the prompt [misc/REMOVE_AUTHENTICATION_PROMPT.md](misc/REMOVE_AUTHENTICATION_PROMPT.md)

## Troubleshooting

In case you encounter any issues with the worker, you can use

```bash
pnpm wrangler tail
```

to inspect logs.

Here are some errors I encountered and their solutions:

- [@node-rs/argon2 Cloudflare Workers Compatibility](misc/ARGON2_RESEARCH.md)
- [[500] GET / Error: Prerendered response not found](misc/CLOUDFLARE_PRERENDER_ERROR_ANALYSIS.md)

Note that these reports were written by Claude Code, so they might contain false informations and hints. :)

## FAQ

### Can anyone access my database?

No, since the access to the D1 database is configured in the `drizzle.config.ts` file as:

```typescript
export default defineConfig({
	// ...
	dbCredentials: {
		accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
		databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
		token: process.env.CLOUDFLARE_D1_TOKEN!
	}
	// ...
});
```
