import type { Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import { sequence } from '@sveltejs/kit/hooks';

const initializeDb: Handle = async ({ event, resolve }) => {
	event.locals.db = getDb(event.platform!.env.sveltekit_template);
	return resolve(event);
};

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(event.locals.db, sessionToken);

	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};

export const handle: Handle = sequence(initializeDb, handleAuth);
