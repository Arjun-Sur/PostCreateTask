export const prerender = false;

/** @type {import('./$types').LayoutServerLoad} */
export const load = async ({ locals: { getAccount } }) => {
    return {
        account: await getAccount() // Puts the user's account into locals for other routes/actions to use
    };
};
