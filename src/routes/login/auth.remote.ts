// ABOUTME: Remote functions for authentication (login and register)
import * as v from 'valibot';
import { form, getRequestEvent } from '$app/server';
import { redirect } from '@sveltejs/kit';
import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { eq } from 'drizzle-orm';
import * as auth from '$lib/server/auth';
import * as table from '$lib/server/db/schema';

const scryptAsync = promisify(scrypt);

const loginSchema = v.object({
	username: v.pipe(
		v.string(),
		v.minLength(3, 'Username must be at least 3 characters'),
		v.maxLength(31, 'Username must be at most 31 characters'),
		v.regex(/^[a-z0-9_-]+$/, 'Username must be alphanumeric with dashes/underscores only')
	),
	password: v.pipe(
		v.string(),
		v.minLength(6, 'Password must be at least 6 characters'),
		v.maxLength(255, 'Password must be at most 255 characters')
	),
	redirectTo: v.optional(v.string(), '/')
});

const registerSchema = v.object({
	username: v.pipe(
		v.string(),
		v.minLength(3, 'Username must be at least 3 characters'),
		v.maxLength(31, 'Username must be at most 31 characters'),
		v.regex(/^[a-z0-9_-]+$/, 'Username must be alphanumeric with dashes/underscores only')
	),
	password: v.pipe(
		v.string(),
		v.minLength(6, 'Password must be at least 6 characters'),
		v.maxLength(255, 'Password must be at most 255 characters')
	)
});

export const login = form(loginSchema, async ({ username, password, redirectTo }) => {
	const event = getRequestEvent();

	const results = await event.locals.db
		.select({ id: table.user.id, passwordHash: table.user.passwordHash })
		.from(table.user)
		.where(eq(table.user.username, username));

	const existingUser = results.at(0);
	if (!existingUser) {
		return { error: 'Incorrect username or password' };
	}

	const validPassword = await verifyPassword(existingUser.passwordHash, password);
	if (!validPassword) {
		return { error: 'Incorrect username or password' };
	}

	const sessionToken = auth.generateSessionToken();
	const session = await auth.createSession(event.locals.db, sessionToken, existingUser.id);
	auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

	return redirect(302, redirectTo);
});

export const register = form(registerSchema, async ({ username, password }) => {
	const event = getRequestEvent();

	// Check if username already exists
	const existing = await event.locals.db
		.select({ id: table.user.id })
		.from(table.user)
		.where(eq(table.user.username, username));

	if (existing.length > 0) {
		return { error: 'Username already exists' };
	}

	const userId = generateUserId();
	const passwordHash = await hashPassword(password);

	try {
		await event.locals.db.insert(table.user).values({ id: userId, username, passwordHash });

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(event.locals.db, sessionToken, userId);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} catch {
		return { error: 'An error has occurred, please try again later.' };
	}
	return redirect(302, '/profile');
});

function generateUserId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}

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
