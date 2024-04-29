<svelte:head>
    <title>Class Gradebook | Gradebook</title>
</svelte:head>

<script>
    import Gradebook from '../../../components/Gradebook.svelte';

    /** @type {import('./$types').PageData} */
    export let data;
</script>

<Gradebook assignments={data.assignments} students={data.students} grades={data.grades}/>
