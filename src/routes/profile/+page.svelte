<script lang="ts">
	import { logout } from './logout.remote';
	import type { PageServerData } from './$types';
	import { goto, invalidateAll } from '$app/navigation';

	let { data }: { data: PageServerData } = $props();
	let { user } = $derived(data);
</script>

<div class="hero min-h-[50vh] bg-base-200">
	<div class="hero-content text-center">
		<div class="max-w-md">
			<div class="avatar mb-4 avatar-placeholder">
				<div class="w-24 rounded-full bg-neutral text-neutral-content">
					<span class="text-3xl">{data.user.username.slice(0, 2).toUpperCase()}</span>
				</div>
			</div>
			<h1 class="text-5xl font-bold">Hi, {data.user.username}!</h1>
			<p class="py-6 text-base-content/70">Welcome to your profile page</p>
		</div>
	</div>
</div>

<div class="container mx-auto px-4 py-8">
	<div class="grid gap-6 md:grid-cols-2">
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">Profile Information</h2>
				<div class="space-y-2">
					<div class="flex justify-between">
						<span class="font-semibold">Username:</span>
						<span>{user.username}</span>
					</div>
					<div class="flex justify-between">
						<span class="font-semibold">User ID:</span>
						<span class="font-mono text-sm">{data.user.id}</span>
					</div>
				</div>
			</div>
		</div>

		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">Account Actions</h2>
				<button
					onclick={async () => {
						await logout();
						await invalidateAll();
						goto('/');
					}}
					class="btn btn-block btn-error">Sign Out</button
				>
			</div>
		</div>
	</div>
</div>
