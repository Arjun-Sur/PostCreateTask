import {createAdminClient, SESSION_COOKIE} from "$lib/server/appwrite.js";
import {redirect} from "@sveltejs/kit";

export async function load({locals}) {
    // Access user from locals
    if (locals.user) {
        // If the user is signed in, redirect to the gradebook page
        redirect(301, '/gradebook');
    }
}


export const actions = {
    signin: async ({request, cookies}) => {
        // Extract the form data
        const form = await request.formData();

        const email = form.get("email");
        const password = form.get("password");

        // Create the Appwrite client
        const {account} = createAdminClient();

        // Create the session using the email and password
        const session = account.createEmailPasswordSession(email, password);

        await session.then(function (response) {
            console.log(response, session); // Success


            // Set the session cookie with the secret
            cookies.set(SESSION_COOKIE, response.secret, {
                sameSite: "strict",
                expires: new Date(response.expire),
                secure: true,
                path: "/",
            });

            // Redirect to the gradebook page
            redirect(301, "/gradebook");
        }, function (error) {
            console.log(error); // Failure
        });
    },
};
