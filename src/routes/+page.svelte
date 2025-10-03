<script lang="ts">
	import { getUsers } from './users.remote';
</script>

<div class="hero min-h-[50vh] bg-base-200">
	<div class="hero-content text-center">
		<div class="max-w-md">
			<h1 class="text-5xl font-bold">Welcome to SvelteKit</h1>
			<p class="py-6">
				A modern template with authentication, database, and DaisyUI styling. Visit
				<a href="https://svelte.dev/docs/kit" class="link link-primary">svelte.dev/docs/kit</a> to read
				the documentation.
			</p>
		</div>
	</div>
</div>

<div class="container mx-auto px-4 py-8">
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Users from D1 Database</h2>
			{#await getUsers()}
				<p class="text-base-content/70">Loading users...</p>
			{:then users}
				{#if users.length === 0}
					<p class="text-base-content/70">No users found</p>
				{:else}
					<div class="overflow-x-auto">
						<table class="table">
							<thead>
								<tr>
									<th>Username</th>
									<th>User ID</th>
								</tr>
							</thead>
							<tbody>
								{#each users as user (user.id)}
									<tr class="hover">
										<td>{user.username}</td>
										<td class="font-mono text-sm">{user.id}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			{:catch error}
				<p class="text-error">Error loading users: {error.message}</p>
			{/await}
		</div>
	</div>
</div>
