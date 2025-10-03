<script lang="ts">
	import { enhance } from '$app/forms';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="navbar bg-base-100 shadow-sm">
	<div class="flex-1">
		<a href="/" class="btn text-xl btn-ghost">SvelteKit Template</a>
	</div>
	<div class="flex-none">
		{#if data.user}
			<div class="dropdown dropdown-end">
				<button type="button" class="btn btn-circle btn-ghost">
					<div class="avatar avatar-placeholder">
						<div class="w-10 rounded-full bg-neutral text-neutral-content">
							<span class="text-xs">{data.user.username.slice(0, 2).toUpperCase()}</span>
						</div>
					</div>
				</button>
				<ul class="dropdown-content menu z-10 mt-3 w-52 menu-sm rounded-box bg-base-100 p-2 shadow">
					<li class="menu-title">
						<span>{data.user.username}</span>
					</li>
					<li><a href="/profile">Profile</a></li>
					<li>
						<form method="post" action="/profile?/logout" use:enhance>
							<button type="submit" class="w-full text-left">Logout</button>
						</form>
					</li>
				</ul>
			</div>
		{:else}
			<a href="/login" class="btn btn-neutral">Login</a>
		{/if}
	</div>
</div>

{@render children?.()}
