<script lang="ts">
    import {
        Avatar, Button,
        Dropdown,
        DropdownDivider,
        DropdownHeader,
        DropdownItem,
        Navbar,
        NavBrand,
        NavHamburger,
        NavLi,
        NavUl,
        P
    } from 'flowbite-svelte';
    import {page} from '$app/stores';

    let {data} = $page;

    let {account} = data;
</script>

<Navbar let:hidden let:toggle class="z-10">
    <NavBrand href="/">
        <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Gradebook</span>
    </NavBrand>
    <div class="flex items-center md:order-2">

        {#if data?.account}
            <div>
                <Avatar/>
                <Dropdown placement="bottom">
                    <DropdownHeader>
                        <span class="block text-md">{account.name}</span>
                        <span class="block text-sm">{account.email}</span>
                    </DropdownHeader>
                    <DropdownItem href="/debug">Debug</DropdownItem>
                    <DropdownDivider/>
                    <DropdownItem href="/signout">Sign out</DropdownItem>
                </Dropdown>
            </div>
        {:else}
            <Button size="sm" href="/signin">
                Sign In
            </Button>
        {/if}
        <NavHamburger class1="w-full md:flex md:w-auto md:order-1" on:click={toggle}/>
    </div>
    <NavUl {hidden} class="z-50">
        <NavLi href="/vanilla" data-sveltekit-preload-data="tap">Demo</NavLi>
        {#if data?.account}
            <NavLi href="/gradebook" data-sveltekit-reload>Gradebook</NavLi>
        {/if}
    </NavUl>
</Navbar>
