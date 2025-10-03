# How to create a project

1. Create a new project with the [Cloudflare C3 CLI](https://developers.cloudflare.com/pages/get-started/c3/) using this template

```bash
pnpm create cloudflare@latest --template git@github.com:ViggieM/sveltekit-d1.git [DIRECTORY] --git
cd [DIRECTORY]
pnpm install
```

2. Add a new d1 database

```bash
pnpx wrangler d1 create [DATABASE_NAME]
# update types after db creation
pnpm wrangler types ./src/worker-configuration.d.ts
```

3. Create an environment file `.env` (see `.env.example`)

- CLOUDFLARE_ACCOUNT_ID can be determined with `pnpx wrangler whoami`
- CLOUDFLARE_DATABASE_ID is the one from the previous step (in `wrangler.jsonc` "d1_databases" settings)
- <details>
    <summary>
        a CLOUDFLARE_D1_TOKEN can be created in the [Account API tokens](https://dash.cloudflare.com/?to=/:account/api-tokens)
    </summary>
    - Under **API Tokens**, select **Create Token**.
    - Scroll to **Custom token** > **Create custom token**, then select **Get started**.
    - Under **Token name**, enter a descriptive token name. For example, `Name-D1-Import-API-Token`.
    - Under **Permissions**:
    	- Select **Account**.
    	- Select **D1**.
    	- Select **Edit**.
    - Select **Continue to summary**.
    - Select **Create token**.
    - Copy the API token and save it in a secure file. (i.e. in the `.env` file as `CLOUDFLARE_D1_TOKEN`)
  </details>

4. Add these secrets also to your worker

```bash
npx wrangler secret put CLOUDFLARE_ACCOUNT_ID
npx wrangler secret put CLOUDFLARE_DATABASE_ID
npx wrangler secret put CLOUDFLARE_D1_TOKEN
```

5. Generate and apply database migrations

```bash
pnpm drizzle-kit push

# generate migrations in the /drizzle folder
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# apply migrations locally
pnpm wrangler d1 migrations apply [DATABASE_NAME] --local
```

6. Deploy your worker

```bash
pnpm wrangler deploy
```
