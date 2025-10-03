// ABOUTME: Pass user data to layout for navbar display
export const load = async ({ locals }) => {
	return {
		user: locals.user ?? null
	};
};
