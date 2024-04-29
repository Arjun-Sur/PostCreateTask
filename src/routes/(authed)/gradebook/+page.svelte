<svelte:head>
    <title>Class Gradebook | Gradebook</title>
</svelte:head>

<script>
    import Gradebook from '../../../components/Gradebook.svelte';

    /** @type {import('./$types').PageData} */
    export let data;
</script>

<!--The Gradebook component is a reusable component that displays a table of students and their grades for each assignment-->
<Gradebook assignments={data.assignments} students={data.students} grades={data.grades}/>
