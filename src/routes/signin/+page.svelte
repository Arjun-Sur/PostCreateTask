<script>
    import {Alert, Button, Card, Input, Label} from 'flowbite-svelte';
</script>

<svelte:head>
    <title>Sign In | Gradebook</title>
</svelte:head>

<section class="relative py-1 sm:py-1">
    <div class="px-4 mx-auto max-w-screen-xl lg:py-5 lg:px-6">
        <Card class="mt-5 ml-auto mr-auto">
            <form action="?/signin" method="POST">
                <h5 class="mb-2 text-2xl font-semibold tracking-tight text-white text-center">Sign In</h5>
                <div class="mb-6">
                    <Label for="email" class="mb-2">Email</Label>
                    <Input name="email" type="email" id="email" placeholder="test@test.com" required/>
                </div>
                <div class="mb-6">
                    <Label for="password" class="mb-2">Password</Label>
                    <Input name="password" type="password" id="password" placeholder="iamatester" required/>
                </div>
                <Button type="submit" class="w-full">Sign In</Button>
            </form>

            <Alert class="mt-5 ml-auto mr-auto" color="red" border>Sign up is disabled.</Alert>
        </Card>
    </div>
</section>
