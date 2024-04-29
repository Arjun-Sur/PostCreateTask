import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
    // Access user from locals
    if (!locals.user) {
        // If no user is signed in, redirect to the sign in page
        redirect(301, '/signin');
    }

    // If the user is signed in, redirect to the gradebook page
    redirect(301, '/gradebook');
}
