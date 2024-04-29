<svelte:head>
    <title>Error {$page.status} | Gradebook</title>
</svelte:head>

<script>
    import {page} from '$app/stores';

    console.warn($page.error);
</script>


<section class="relative py-6 sm:py-10">
    <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div class="mx-auto max-w-screen-sm text-center"><h1
                class="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-primary-500">
            {$page?.error?.message}</h1>
            <p class="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">Error</p>
            <p class="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">If you
                believe this is a mistake, then please
                report it.</p> <a href="/"
                                              class="text-center font-medium focus-within:ring-4 focus-within:outline-none inline-flex items-center justify-center px-5 py-3 text-base text-white bg-red-700 hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 focus-within:ring-red-300 dark:focus-within:ring-red-900 rounded-lg"
                                              role="button">Back to Homepage</a></div>
    </div>
</section>
