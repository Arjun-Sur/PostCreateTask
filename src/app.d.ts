import type { Models } from "node-appwrite";

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface Locals {
			user: Models.User<Models.Preferences> | undefined;
			getAccount(): Promise<Models.User<Preferences> | null>;
		}
		interface PageData {
			account: Models.Account | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
