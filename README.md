# SvelteKit running on Cloudflare Pages with D1 Database

This is a template for the [Cloudflare C3 CLI](https://developers.cloudflare.com/pages/get-started/c3/) that initializes a new SvelteKit project with a D1 database.
It includes database management with drizzle and authentication with lucia.
It also makes use of the latest feature of SvelteKit, [Remote functions • Docs • Svelte](https://svelte.dev/docs/kit/remote-functions).

## Setup Instructions

### 1. Create a new project using this template

```bash
pnpm create cloudflare@latest --template git@github.com:ViggieM/sveltekit-d1.git [DIRECTORY] --git
cd [DIRECTORY]
pnpm install
pre-commit install
```

### 2. Add a new D1 database

```bash
pnpx wrangler d1 create --binding 'DB' [DATABASE_NAME]
# update types after db creation
pnpm wrangler types ./src/worker-configuration.d.ts
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
  The CLOUDFLARE_D1_TOKEN can be created in the <a href="https://dash.cloudflare.com/?to=/:account/api-tokens">Account API tokens</a>
</summary>
<ul>
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

### 5. Generate and apply database migrations

```bash
pnpm drizzle-kit push

# generate migrations in the /drizzle folder
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# apply migrations locally
pnpm wrangler d1 migrations apply [DATABASE_NAME] --local
```

### 6. Deploy your worker

```bash
pnpm build
pnpm wrangler deploy

# follow logs
pnpm wrangler tail
```

## Where can we go from here?

- Add GitHub / Google authentication
- Add a 404/500 error page
- Improve logout: ATM there are two ways it is done, but I didn't decide yet which one is better

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
