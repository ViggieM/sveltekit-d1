// ABOUTME: Remote query function to fetch users from database
import { query } from '$app/server';
import { getRequestEvent } from '$app/server';
import { user } from '$lib/server/db/schema';

export const getUsers = query(async () => {
	const { locals } = getRequestEvent();
	const users = await locals.db.select().from(user);
	return users;
});
