import {redirect} from '@sveltejs/kit';
import {SESSION_COOKIE} from '$lib/server/appwrite.js';


/** @type {import('./$types').RequestHandler} */
export const GET = async ({ locals, cookies}) => {

    cookies.delete(SESSION_COOKIE, {
        path: '/',
        secure: true
    });

    throw redirect(302, '/signin');
}
