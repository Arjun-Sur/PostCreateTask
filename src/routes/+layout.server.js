export const prerender = false;

/** @type {import('./$types').LayoutServerLoad} */
export const load = async ({ locals: { getAccount } }) => {
    return {
        account: await getAccount()
    };
};
