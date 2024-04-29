import {createAdminClient, SESSION_COOKIE} from "$lib/server/appwrite.js";
import {redirect} from "@sveltejs/kit";

export const actions = {
    signin: async ({request, cookies}) => {
        // Extract the form data.
        const form = await request.formData();
        const email = form.get("email");
        const password = form.get("password");

        // Create the Appwrite client.
        const {account} = createAdminClient();

        // Create the session using the client
        // await account.create(ID.unique(), email, password, name);
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

            // Redirect to the account page.
            redirect(301, "/gradebook");
        }, function (error) {
            console.log(error); // Failure
        });
    },
};
