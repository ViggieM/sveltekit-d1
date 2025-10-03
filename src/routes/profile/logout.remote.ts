// ABOUTME: Remote command function for user logout
import { command } from '$app/server';
import { getRequestEvent } from '$app/server';
import { fail } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';

export const logout = command(async () => {
	const event = getRequestEvent();

	if (!event.locals.session) {
		return fail(401);
	}

	await auth.invalidateSession(event.locals.db, event.locals.session.id);
	auth.deleteSessionTokenCookie(event);

	// Redirects are not allowed in commands. https://svelte.dev/docs/kit/remote-functions#Redirects
	// return redirect(302, '/login');
});
