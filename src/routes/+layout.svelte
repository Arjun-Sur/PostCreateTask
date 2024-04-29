<script lang="ts">
    import '../app.css';
    import Header from '../components/Header.svelte';
    import {page} from "$app/stores";
</script>

<div class="flex flex-col min-h-screen">
    <header>
        <Header />
    </header>

    <main>
        <slot />
    </main>
</div>
