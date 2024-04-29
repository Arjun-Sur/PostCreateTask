<svelte:head>
    <title>Debug | Gradebook</title>
</svelte:head>

<script>
    import {Alert, Card, Heading, P} from 'flowbite-svelte';

    export let data;

</script>


<section class="relative py-6 sm:py-10">
    <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">

        <Alert border color="red">
            <span class="font-medium">Warning!</span>
            This page is for debugging purposes only.
        </Alert>
        <Card size="lg">
            <div>
                <div>
                    <Heading>
                        Page Data
                    </Heading>
                    <P>
                        {JSON.stringify(data)}
                    </P>
                </div>

                <div>
                    <Heading>
                        Logged In
                    </Heading>
                    <a href="/account">
                        <p>Hello {data.account?.name}!</p>
                    </a>
                </div>

                <div>
                    <Heading>
                        Logged Out
                    </Heading>
                    <a href="/login">Login</a>
                </div>
            </div>
        </Card>
    </div>
</section>
