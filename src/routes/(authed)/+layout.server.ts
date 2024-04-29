import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
    if (!locals.user) { // Redirect user to signin page if not authenticated
        redirect(301, '/signin');
    }
}
