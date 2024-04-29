<script>
    import {
        Button,
        Card,
        Heading,
        Input,
        Label,
        P,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell
    } from 'flowbite-svelte';

    // Define the props for the component
    export let assignments, students, grades;

    // Convert all grades to 1 decimal point
    Object.values(grades).forEach((studentGrades) => Object.entries(studentGrades).forEach(([assignmentId, grade]) => studentGrades[assignmentId] = (grade ? parseFloat(grade).toFixed(1) : parseInt(0).toFixed(1))));

    // Array and updating for assignment categories
    let categoriesArr = [];
    $: categoriesArr = Object.values(assignments).map(assignment => assignment.category);

    // Array and updating for assignment due dates
    let dueDateArr = [];
    $: dueDateArr = Object.values(assignments).map(assignment => assignment.due);

    // Array points and updating for assignment points
    let pointsArr = [];
    $: pointsArr = Object.values(assignments).map(assignment => assignment.points);

    // Array and updating for overall categories
    let categoriesPointsArr = [];
    $: categoriesPointsArr = Object.values(assignments).reduce((acc, {
        category,
        points
    }) => {
        if (acc[category]) acc[category] += points;
        else acc[category] = points;
        return acc;
    }, {});

    // Calculate total points
    let totalPoints = 0;
    $: totalPoints = pointsArr.reduce((acc, curr) => acc + curr, 0);

    let averagesObj;

    // Updating totals, averages, and student categories
    function calculateAveragesAndTotals() {
        averagesObj = {"Overall": []}; // Clears it
        Object.entries(assignments).forEach(([id]) => {
            averagesObj[id] = [];
        });
        Object.entries(grades).forEach(([, studentGrades]) => {
            Object.entries(studentGrades).forEach(([id, grade]) => {
                averagesObj[id].push(parseFloat(grade || 0))
            });
            let studentPointsArr = [0];
            let studentCategories = {};
            Object.entries(assignments).forEach(([id, {name, category}]) => {
                let studentPointsForAssignment = parseFloat(studentGrades[id] || 0);
                studentPointsArr.push(studentPointsForAssignment);
                if (studentCategories[category]) studentCategories[category] += studentPointsForAssignment;
                else studentCategories[category] = studentPointsForAssignment;
                if (averagesObj[name]) averagesObj[name].push(studentPointsForAssignment);
            });
            Object.entries(studentCategories).forEach(([category, points]) => {
                studentPointsArr[0] += points;
                if (averagesObj[category]) averagesObj[category].push(points);
                else averagesObj[category] = [points];
            });
            studentPointsArr[0] = Math.round((studentPointsArr[0] / totalPoints) * 1000) / 10;
            averagesObj["Overall"].push(studentPointsArr[0]);
        });
    }

    // This runs calculateAveragesAndTotals() when grades change
    $: grades && calculateAveragesAndTotals();

    // Converts a grade percentage to a hsl color
    function percentToColor(grade) {
        return "hsl(" + grade.toString(10) + ",100%,50%)";
    }

    // Converts a grade percentage to a letter grade
    function percentToLetterGrade(grade) {
        if (grade >= 90.0) return "A";
        else if (grade >= 80.0) return "B";
        else if (grade >= 70.0) return "C";
        else if (grade >= 60.0) return "D";
        else return "F";
    }

    // Tracks changes to grades within the gradebook
    let changes = {};
    $: changes;
</script>

<section class="relative py-1 sm:py-1">
    <div class="px-4 mx-auto max-w-screen-xl lg:py-5 lg:px-6">
        <Card size="lg" class="mt-5 ml-auto mr-auto !max-w-6xl">
            <!--Need these if true statements in order to declare the constants that are reused-->
            {#if true}
                <!--Represents the categories and their total point values-->
                {@const categories = Object.entries(Object.values(assignments).reduce((acc, {
                    category,
                    points
                }) => (acc[category] = points, acc), {}))}
                <div>
                    <Heading class="text-center pb-2">Class Gradebook</Heading>
                    <Table class="gradebook">
                        <TableHead>
                            <TableHeadCell>Student</TableHeadCell>
                            <TableHeadCell>Overall</TableHeadCell>
                            <!-- Adds each assignment to the table header -->
                            {#each Object.entries(assignments) as [id, assignment], i}
                                <TableHeadCell style="writing-mode: vertical-rl; text-orientation: sideways;">
                                    <div class="flex justify-between">
                                        <!-- Single button within the form so the submit action can act as a form action -->
                                        <form id="removeAssignment" method="POST" action="?/removeAssignment">
                                            <Button type="submit" pill value="{id}" name="id" class="pl-0 pt-1 pb-1 pr-0 mb-[10px]">
                                                X
                                            </Button>
                                        </form>
                                        <p>{assignment.name}</p>
                                    </div>
                                </TableHeadCell>
                            {/each}
                            <!-- Adds each category to the table header -->
                            {#each categories as [category, ]}
                                <TableHeadCell
                                        style="writing-mode: vertical-rl; text-orientation: sideways;">{category}</TableHeadCell>
                            {/each}
                        </TableHead>

                        <TableBody tableBodyClass="divide-y">
                            <TableBodyRow>
                                <TableBodyCell><i>Category</i></TableBodyCell>
                                <TableBodyCell></TableBodyCell>
                                <!-- Adds each assignment category to the Category row -->
                                {#each categoriesArr as category}
                                    <TableBodyCell>{category}</TableBodyCell>
                                {/each}
                            </TableBodyRow>
                            <TableBodyRow>
                                <TableBodyCell><i>Due Date</i></TableBodyCell>
                                <TableBodyCell></TableBodyCell>
                                <!-- Adds each assignment due date to the Due Date row -->
                                {#each dueDateArr as date}
                                    <TableBodyCell>{date}</TableBodyCell>
                                {/each}
                            </TableBodyRow>
                            <TableBodyRow>
                                <TableBodyCell><i>Points</i></TableBodyCell>
                                <TableBodyCell>{totalPoints}</TableBodyCell>
                                <!-- Adds each assignment points to the Points row -->
                                {#each pointsArr as points}
                                    <TableBodyCell>{points}</TableBodyCell>
                                {/each}
                                <!-- Adds each category points to the Points row -->
                                {#each Object.values(categoriesPointsArr) as points}
                                    <TableBodyCell>{points}</TableBodyCell>
                                {/each}
                            </TableBodyRow>
                            <TableBodyRow>
                                {#if true}
                                    <!-- Calculates the overall class average grade -->
                                    {@const overallAverage = ((averagesObj["Overall"].reduce((acc, curr) => acc + curr, 0) / averagesObj["Overall"].length)).toFixed(1)}
                                    <TableBodyCell><b>Average</b></TableBodyCell>
                                    <!-- Adds the overall class average grade to the Average row -->
                                    <TableBodyCell style={`background-color: ${percentToColor(overallAverage)};`}
                                                   class="!text-gray-900">
                                        {overallAverage}% {percentToLetterGrade(overallAverage)}
                                    </TableBodyCell>
                                    <!-- Adds the average grade for each assignment and category to the Average row -->
                                    {#each Object.entries(averagesObj).filter(([id]) => id !== "Overall") as [column, averages]}
                                        <TableBodyCell
                                                key={column}>{(averages.reduce((acc, curr) => acc + curr, 0) / averages.length).toFixed(1)}</TableBodyCell>
                                    {/each}
                                {/if}
                            </TableBodyRow>
                            <!-- Adds each student as a row to the gradebook table -->
                            {#each Object.entries(students) as [studentId, student], i}
                                <!-- Fetches the student's grades -->
                                {@const studentAssignmentGrades = grades[studentId]}
                                <TableBodyRow>
                                    <TableBodyCell>
                                        <!-- Adds the student full name and delete button -->
                                        <div class="flex justify-between">
                                            <p>{student.lastName}, {student.firstName}</p>
                                            <!-- Single button within the form so the submit action can act as a form action -->
                                            <form id="removeStudent" method="POST" action="?/removeStudent">
                                                <Button type="submit" value="{studentId}" name="id"
                                                        class="pt-0 pl-1 pr-1 pb-0 ml-[10px]">X
                                                </Button>
                                            </form>
                                        </div>
                                    </TableBodyCell>
                                    {#if true}
                                        <!-- Calculates the overall student grade -->
                                        {@const overallStudent = (Math.round((Object.values(studentAssignmentGrades || {}).reduce((a, b) => a + parseFloat(b || 0), 0) / totalPoints) * 1000) / 10).toFixed(1)}
                                        <TableBodyCell style={`background-color: ${percentToColor(overallStudent)};`}
                                                       class="!text-gray-900">
                                            {overallStudent}% {percentToLetterGrade(overallStudent)}
                                        </TableBodyCell>
                                    {/if}
                                    <!-- Adds each grade as an editable input-->
                                    {#each Object.entries(assignments) as [assignmentId, assignment]}
                                        <TableBodyCell>
                                            <Input type="number" min="0" pill
                                                   max="{assignment.points}" step="0.1" pattern="\d+(\.\d{1})?"
                                                   bind:value={grades[studentId][assignmentId]}
                                                   on:change={() => {
                                       grades[studentId][assignmentId] = (parseFloat(grades[studentId][assignmentId]) || 0).toFixed(1); // Formats the grade
                                       if (!changes[studentId]) changes[studentId] = {}; // Adds the change to the changes object
                                       changes[studentId][assignmentId] = grades[studentId][assignmentId];
                                   }}
                                                   on:keypress={(e) => (!/\.|\d/.test(e.key)) && e.preventDefault()}/> <!-- Prevents non-numeric characters -->
                                        </TableBodyCell>
                                    {/each}
                                    <!-- Adds each student category total to the student's row -->
                                    {#each categories as [category, ]}
                                        <!-- Calculates the student's category total -->
                                        {@const categoryTotal = Object.keys(studentAssignmentGrades).reduce((acc, curr) => {
                                            if (assignments[curr].category === category) acc += parseFloat(studentAssignmentGrades[curr] || 0);
                                            return acc;
                                        }, 0).toFixed(1)}
                                        <TableBodyCell>{categoryTotal}</TableBodyCell>
                                    {/each}
                                </TableBodyRow>
                            {/each}
                        </TableBody>
                    </Table>

                    <!-- Shows button only if there are changes -->
                    {#if Object.entries(changes).length > 0}
                        <!-- Form submits with changes object as a hidden input so it can use form actions -->
                        <form id="saveGrades" method="POST" action="?/saveGrades" class="text-right z-100">
                            <input name="grades" value={JSON.stringify(changes)} style="display: none"/>
                            <Button type="submit">Save Grades</Button>
                        </form>
                    {/if}
                </div>
            {/if}
        </Card>
        <div class="flex gap-3 pt-3 ml-auto mr-auto max-w-6xl">
            <Card size="lg">
                <!-- Add student form using form actions -->
                <form id="addStudent" method="POST" action="?/addStudent">
                    <h5 class="mb-2 text-2xl font-semibold tracking-tight text-white">Add Student</h5>
                    <div class="mb-6">
                        <Label for="first_name" class="mb-2">First Name</Label>
                        <Input name="firstName" type="text" id="first_name" placeholder="John" required/>
                    </div>
                    <div class="mb-6">
                        <Label for="last_name" class="mb-2">Last Name</Label>
                        <Input name="lastName" type="text" id="last_name" placeholder="Doe" required/>
                    </div>
                    <Button type="submit">Add Student</Button>
                </form>
            </Card>
            <Card size="lg">
                <!-- Add assignment form using form actions -->
                <form id="addAssignment" method="POST" action="?/addAssignment">
                    <h5 class="mb-2 text-2xl font-semibold tracking-tight text-white">Add Assignment</h5>
                    <div class="mb-6">
                        <Label for="name" class="mb-2">Name</Label>
                        <Input name="name" type="text" id="name" placeholder="11/13 CW" required/>
                    </div>
                    <div class="mb-6">
                        <Label for="category" class="mb-2">Category</Label>
                        <Input name="category" type="text" id="category" placeholder="Classwork" required/>
                    </div>
                    <div class="mb-6">
                        <Label for="points" class="mb-2">Points</Label>
                        <Input name="points" type="number" id="points" placeholder="10" required/>
                    </div>
                    <div class="mb-6">
                        <Label for="due" class="mb-2">Due Date</Label>
                        <Input name="due" type="date" id="due" placeholder="10" required/>
                    </div>
                    <Button type="submit">Add Assignment</Button>
                </form>
            </Card>
        </div>

        <div class="flex gap-3 pt-3 ml-auto mr-auto max-w-6xl">
            <Card size="lg" class="">
                <!-- Reset button that replaces everything in the database with this data -->
                <!-- Form with empty input -->
                <form id="reset" method="POST" action="?/reset" class="text-center">
                    <input name="gradebook" value={JSON.stringify({
                            students: [{first: "Garfield", last: "Bryner"}, {first: "John", last: "Doe"}, {first: "Billy", last: "Bob"}, {first: "Sally", last: "Sue"}, {first: "Tom", last: "Jerry"}, {first: "Mickey", last: "Mouse"}, {first: "Donald", last: "Duck"}, {first: "Minnie", last: "Mouse"}, {first: "Philip", last: "Walters"}],
                            assignments: [{name: "11/8 HW", category: "Homework", points: 30, due: "11/8"}, {name: "Unit 6 Assessment", category: "Assessments", points: 100, due: "11/9"}, {name: "11/10 CW", category: "Classwork", points: 30, due: "11/10"}, {name: "11/11 HW", category: "Homework", points: 30, due: "11/11"}],
                        })} style="display: none"/>
                    <Button type="submit">Reset Gradebook to Placeholder Data</Button>
                </form>
            </Card>
            <Card size="lg">
                <!-- Displays the amount of changes that have been made to the grades in the gradebook -->
                <P>Grade
                    Changes: {Object.values(changes).reduce((prev, cur) => prev += Object.keys(cur).length, 0)}
                    change(s)</P>
            </Card>
        </div>
    </div>
</section>
