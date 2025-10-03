<script lang="ts">
	import { page } from '$app/state';
	import { login, register } from './auth.remote';

	let redirectTo = $derived(page.url.searchParams.get('redirectTo') || '/profile');
</script>

<div class="hero min-h-screen bg-base-200">
	<div class="hero-content flex-col">
		<div class="text-center">
			<h1 class="text-5xl font-bold">Login/Register</h1>
			<p class="py-6">Enter your credentials to access your account</p>
		</div>
		<div class="card w-full max-w-sm bg-base-100 shadow-2xl">
			<div class="card-body">
				<form {...login}>
					<input type="hidden" name="redirectTo" value={redirectTo} />

					<fieldset class="fieldset">
						<label class="label" for="username">Username</label>
						<input
							id="username"
							name={login.field('username')}
							type="text"
							class="input"
							class:input-error={login.issues?.username}
							placeholder="Enter username"
							aria-invalid={!!login.issues?.username}
						/>
						{#if login.issues?.username}
							{#each login.issues.username as issue, idx (idx)}
								<p class="text-xs text-error">{issue.message}</p>
							{/each}
						{/if}

						<label class="label" for="password">Password</label>
						<input
							id="password"
							name={login.field('password')}
							type="password"
							class="input"
							class:input-error={login.issues?.password}
							placeholder="Enter password"
							aria-invalid={!!login.issues?.password}
						/>
						{#if login.issues?.password}
							{#each login.issues.password as issue, idx (idx)}
								<p class="text-xs text-error">{issue.message}</p>
							{/each}
						{/if}

						{#if login.result?.error}
							<p class="text-sm text-error">{login.result.error}</p>
						{/if}

						{#if register.result?.error}
							<p class="text-sm text-error">{register.result.error}</p>
						{/if}

						<div class="join-vertical mt-6 join w-full gap-2">
							<button type="submit" class="btn btn-neutral">Login</button>
							<button {...register.buttonProps} class="btn btn-outline">Register</button>
						</div>
					</fieldset>
				</form>
			</div>
		</div>
	</div>
</div>
