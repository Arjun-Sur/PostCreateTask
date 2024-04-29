import { createSessionClient } from '$lib/server/appwrite';

export async function handle({ event, resolve }) {
    event.locals.getAccount = async () => null; // Need incase try block fails

    try {
        // Use our helper function to create the Appwrite client
        const { account } = createSessionClient(event);
        // Store the current signed in user in locals, for easy access in our other routes
        event.locals.getAccount = async () => {
            return await account.get();
        }

        event.locals.user = await account.get();

    } catch {}

    // Continue with the request
    return resolve(event);
}
