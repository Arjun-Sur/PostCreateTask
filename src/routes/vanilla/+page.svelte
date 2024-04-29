<svelte:head>
    <title>Demo | Gradebook</title>
</svelte:head>

<script>
    import {onMount} from 'svelte';
    import {Alert, Card} from 'flowbite-svelte';

    onMount(() => {

        // Placeholder data

        const assignmentsArr = [
            {
                name: "11/8 HW",
                category: "Homework",
                due: "11/8",
                points: 30
            },
            {
                name: "Unit 6 Assessment",
                category: "Assessments",
                due: "11/9",
                points: 100
            },
            {
                name: "11/10 CW",
                category: "Classwork",
                due: "11/10",
                points: 30
            }, {
                name: "11/11 HW",
                category: "Homework",
                due: "11/11",
                points: 30
            },
        ]; // Placeholder assignments

        const studentsArr = ["Byrne, Garfield", "Green, Rahim", "Curry, Leyton", "Walters, Phillip", "Chen, Pennington", "Doe, John", "Smith, Bob", "Velazquez, Anne"]; // Placeholder names

        // Main procedure

        /**
         * @param {Object} [params] - Optional parameters
         * @param {{ name: string, category: string, due: string, points: number }} [params.addAssignment] - An object of an assignment to add
         * @param {{ firstName: string, lastName: string }} [params.addStudent] - An object of a student to add
         * @param {number} [params.removeAssignment] - The index of an assignment to remove
         * @param {number} [params.removeStudent] - The index of a student to remove
         */
        function updateGradebook(params = {}) {
            if ("addAssignment" in params) { // Add assignment to array if object is specified in params
                assignmentsArr.push(params.addAssignment);
            }

            if ("addStudent" in params) { // Add student to array if object is specified in params
                const {firstName, lastName} = params.addStudent;
                studentsArr.push(caseCorrectly(lastName) + ", " + caseCorrectly(firstName));
            }

            if ("removeAssignment" in params) { // Remove assignment from array if index is specified in params
                assignmentsArr.splice(params.removeAssignment, 1);
            }

            if ("removeStudent" in params) { // Remove student from array if index is specified in params
                studentsArr.splice(params.removeStudent, 1);
            }

            const categoryPoints = {}; // Object that will hold total points per category (in order) <Category, Total Points>

            const assignmentCategoriesRowArr = []; // Array to hold the categories (in order) for assignments for the "Category" row
            const assignmentDueDatesRowArr = []; // Array to hold the due dates (in order) for assignments for the "Due Date" row

            const pointsRowArr = [0/* 0th index represents overall/total points */]; // Array to hold the points values (in order) for the "Points" row

            // Update assignments
            deleteElementsHavingClass("assignment"); // Delete old assignment headers

            for (let i = 0; i < assignmentsArr.length; i++) { // Iterate through assignments array, adding each assignment to the table header
                const {name, category, due, points} = assignmentsArr[i]; // Destructure assignment from assignment at index i

                const assignmentHeaderCell = createElementWithAttributes("th", {className: "assignment"});
                header.appendChild(assignmentHeaderCell);

                const spacerDiv = createElementWithAttributes("div", {className: "spacer"});
                assignmentHeaderCell.appendChild(spacerDiv);

                const removeAssignmentButton = createElementWithAttributes("button", {
                    innerHTML: "X",
                    value: i,
                    name: "removeAssignment",
                    className: "delete"
                });
                spacerDiv.appendChild(removeAssignmentButton); // "X" button on top of any assignment

                const assignmentNameText = createElementWithAttributes("p", {innerHTML: name});
                spacerDiv.appendChild(assignmentNameText);

                pointsRowArr.push(points); // Add assignment points to array to be shown
                assignmentCategoriesRowArr.push(category); // Add assignment category to array to be shown
                assignmentDueDatesRowArr.push(due); // Add assignment due date to array to be shown

                // Add assignment points to total for category
                if (categoryPoints[category] /* Key exists in object yet */) categoryPoints[category] += points;
                else categoryPoints[category] = points;
            }

            // Add category headers to the end
            Object.entries(categoryPoints).forEach(([category, points]) => {
                const categoryHeaderCell = createElementWithAttributes("th", {
                    className: "assignment",
                    innerHTML: category
                });
                header.appendChild(categoryHeaderCell);

                // To pad the categories and due date rows with empty cells because there would be empty space otherwise
                assignmentCategoriesRowArr.push("");
                assignmentDueDatesRowArr.push("");

                pointsRowArr[0] += points; // Add category points to total, overall points
                pointsRowArr.push(points); // Add category points to array to be shown
            });

            // Update assignment categories row
            deleteElementsHavingClass("category"); // Delete old category cells

            assignmentCategoriesRowArr.forEach(category => { // Iterate through each assignment category, adding each assignment category to the "Category" row
                if (category.length > 4) { // Truncating category if too long
                    category = category.substring(0, 4) + "...";
                }

                const assignmentCategoryCell = createElementWithAttributes("td", {
                    className: "category",
                    innerHTML: category
                });
                categories.appendChild(assignmentCategoryCell);
            });

            // Update due dates
            deleteElementsHavingClass("date"); // Delete old due cate cells

            assignmentDueDatesRowArr.forEach((dueDate) => { // Iterate through each assignment due date, adding each due date to the "Due Date" row
                const dueDateCell = createElementWithAttributes("td", {className: "date", innerHTML: dueDate});
                dates.appendChild(dueDateCell);
            });

            // Update points
            deleteElementsHavingClass("points"); // Delete old points cells

            pointsRowArr.forEach(point => { // Iterate through each points value in the array, adding each points value to the "Points" row
                const pointsCell = createElementWithAttributes("td", {className: "points", innerHTML: point});
                points.appendChild(pointsCell);
            });

            const averageRow = {"Overall": []}; // Object that will hold an array of each value for each column in the table (in order) <Column, Points[]>

            // Update students

            // Gather the point values that the students have from the inputs as they may have been changed by the user
            const studentsAssignmentPointValues = Object.fromEntries(Array.from(document.querySelectorAll("input[class='studentPointsInput']")).map((input) => [input.key, parseFloat(input.value)]));

            deleteElementsHavingClass("student"); // Delete old student rows

            studentsArr.forEach((student, index) => { // Iterate through each student, calculating and showing their overall, assignment, and category scores while contributing to average data
                const studentRow = createElementWithAttributes("tr", {className: "student"});

                const studentNameCell = document.createElement("td");
                studentRow.appendChild(studentNameCell);

                const spacerDiv = createElementWithAttributes("div", {className: "spacer"});

                studentNameCell.appendChild(spacerDiv);

                const studentNameText = createElementWithAttributes("p", {innerHTML: student});
                spacerDiv.appendChild(studentNameText);

                const removeStudentButton = createElementWithAttributes("button", {
                    innerHTML: "X",
                    value: index,
                    name: "removeStudent",
                    className: "delete"
                });
                spacerDiv.appendChild(removeStudentButton); // "X" button to the right of any student

                const studentPointsArr = [0.0/* 0th index represents the student's overall grade */]; // Array to hold the student's points values (in order) to be shown in their row

                const studentCategories = {}; // Object that will hold the student's total points per category (in order) <Category, Student's Total Points>

                assignmentsArr.forEach(({name, category, points}) => { // Iterate through each assignment, adding each assignment grade to the student's points
                    let studentPointsForAssignment = studentsAssignmentPointValues[student + name]; // Get student's grade for assignment

                    if (!studentPointsForAssignment /* If they don't have a grade for the assignment yet */) studentPointsForAssignment = parseFloat((Math.min(Math.random() + 0.3, 1) * points).toFixed(1)); // Generate random grade

                    studentPointsArr.push(studentPointsForAssignment); // Add student grade for assignment to array to be shown

                    // Add student grade for assignment to their total for the category
                    if (studentCategories[category] /* Key exists in object yet */) studentCategories[category] += studentPointsForAssignment;
                    else studentCategories[category] = studentPointsForAssignment;

                    // Add student grade for assignment to the assignment's grades array to be calculated
                    if (averageRow[name] /* Key exists in object yet */) averageRow[name].push(studentPointsForAssignment);
                    else averageRow[name] = [studentPointsForAssignment];
                });

                Object.entries(studentCategories).forEach(([category, points]) => {
                    studentPointsArr[0] += points; // Add student's category points to their total, overall points
                    studentPointsArr.push(points); // Add student's category points to array to be shown

                    // Add student's category points to the category's array to be calculated
                    if (averageRow[category] /* Key exists in object yet */) averageRow[category].push(points);
                    else averageRow[category] = [points];
                });

                studentPointsArr[0] = Math.round((studentPointsArr[0] / pointsRowArr[0]) * 1000) / 10; // Calculating student's overall grade
                averageRow["Overall"].push(studentPointsArr[0]); // Adding student's overall grade to average array to be calculated later

                studentPointsArr.forEach((studentPoints, index) => { // Iterate through each points value in the student's points array, adding each points value to their row
                    const studentPointsCell = createElementWithAttributes("td", {innerHTML: studentPoints.toFixed(1)});

                    if (index == 0/* Matches overall grade index placement in array */) { // Overall Cell
                        studentPointsCell.style.backgroundColor = percentToColor(studentPoints); // Gradient scale for their grade (red = bad, green = good)
                        studentPointsCell.style.color = 'black'
                        studentPointsCell.innerHTML += "% " + percentToLetterGrade(studentPoints); // Format their overall grade nicely
                    } else if (index <= assignmentsArr.length/* Matches assignment points index placement in array */) { // Assignment Cell
                        const correspondingAssignment = assignmentsArr[index - 1/* Need this since index is offset by overall grade */]; // Get what the corresponding assignment is
                        const input = createElementWithAttributes("input", { // Create number input so that user's can change student's grades
                            type: "number",
                            value: studentPointsCell.innerHTML,
                            step: "0.1",
                            className: "studentPointsInput",
                            key: student + correspondingAssignment.name,
                            min: 0,
                            max: correspondingAssignment.points
                        });
                        studentPointsCell.innerHTML = ""; // Remove other text from cell, since replacing it with an input
                        studentPointsCell.appendChild(input);
                    }

                    studentRow.appendChild(studentPointsCell);
                });

                students.appendChild(studentRow);
            });

            // Update averages
            deleteElementsHavingClass("average"); // Delete old average cells

            Object.values(averageRow).forEach((scores, index) => { // Iterate through each array in the average, calculate it, and then display in the "Average" row
                const total = scores.reduce((previous, current) => previous + current, 0); // Find the total of all the numbers in the array
                const average = (total / scores.length); // Calculate the average
                const cell = createElementWithAttributes("td", {className: "average", innerHTML: average.toFixed(1)});
                if (index == 0) { // Overall Cell
                    cell.style.backgroundColor = percentToColor(cell.innerHTML); // Gradient scale for average grade (red = bad, green = good)
                    cell.style.color = 'black'
                    cell.innerHTML += "% " + percentToLetterGrade(cell.innerHTML); // Format average overall grade nicely
                }
                averages.appendChild(cell);
            });
        }

        // Utilities

        /**
         * @param {string} elementTag - HTML element tag (i.e. p, div, table, etc.)
         * @param {Object} [attributes] - An object of an attributes to add to the HTML element <Attribute ID, Attribute Value>
         * @returns {Node} HTML Element (Node) with attributes specified
         */
        function createElementWithAttributes(elementTag, attributes = {}) {
            const element = document.createElement(elementTag);
            Object.entries(attributes).forEach(([key, value]) => element[key] = value);
            return element;
        }

        /**
         * @param {string} className - The ClassName of elements to delete from the HTML document
         */
        function deleteElementsHavingClass(className) {
            const remove = document.getElementsByClassName(className);
            while (remove.length > 0) {
                remove[0].parentNode.removeChild(remove[0]);
            }
        }

        /**
         * @param {float} grade - Grade as a float (i.e. 88.5, 94.0)
         * @returns {string} An HSL string to be used in CSS corresponding to the grade
         */
        function percentToColor(grade) { // Used solution from https://stackoverflow.com/questions/7128675/from-green-to-red-color-depend-on-percentage
            return "hsl(" + grade.toString(10) + ",100%,50%)";
        }

        /**
         * @param {float} grade - Grade as a float (i.e. 88.5, 94.0)
         * @returns {string} A letter grade corresponding the grade
         */
        function percentToLetterGrade(grade) {
            if (grade >= 90.0) return "A";
            else if (grade >= 80.0) return "B";
            else if (grade >= 70.0) return "C";
            else if (grade >= 60.0) return "D";
            else return "F";
        }

        /**
         * @param {string} name - A name
         * @returns {string} The given name cased in title case or as a name would be cased
         */
        function caseCorrectly(name) {
            return name.charAt(0).toUpperCase() + name.substring(1).toLowerCase();
        }

        // Listeners
        document.getElementById("addStudent").addEventListener("submit", (e) => { // When "Add Student" button is clicked with parameters
            e.preventDefault(); // Disable default form behavior since it would usually reload the page
            updateGradebook({ // Call function, adding a student using the values specified
                addStudent: {
                    firstName: studentFirstName.value,
                    lastName: studentLastName.value
                }
            });
            e.target.reset(); // Clear parameters
        });

        document.getElementById("addAssignment").addEventListener("submit", (e) => { // When "Add Assignment" button is clicked with parameters
            e.preventDefault(); // Disable default form behavior since it would usually reload the page
            const dueDate = new Date(assignmentDue.valueAsNumber); // Convert date in milliseconds to JavaScript Date object
            updateGradebook({ // Call function, adding assignment using the values specified
                addAssignment: {
                    name: assignmentName.value,
                    category: assignmentCategory.value,
                    due: (dueDate.getMonth() + 1) + "/" + (dueDate.getDate() + 1),
                    points: parseInt(assignmentPoints.value)
                }
            });
            e.target.reset(); // Clear parameters
        });

        document.addEventListener("click", (e) => { // When the "X" is clicked next to a student or assignment
            const name = e.target?.name;
            if (name == "removeStudent" || name == "removeAssignment") { // Checking it is indeed a remove button
                updateGradebook({[name]: e.target.value}); // Call function, removing the target index from the gradebook, specified in the value attribute of the button
            }
        });

        document.addEventListener("change", updateGradebook); // When an input's value is changed, update the gradebook (i.e. when the points value for a student is modified)

        // Initialize gradebook
        updateGradebook();
    })
</script>

<style>
    @import url('./styles.css');
</style>

<section class="relative py-1 sm:py-1">
    <div class=" px-4 mx-auto max-w-screen-xl lg:py-5 lg:px-6">

        <Alert border color="yellow">
            <span class="font-medium">Notice!</span>
            This is only a demo that only uses JavaScript and has no styling. <a href="/gradebook" style="text-decoration: underline">Click here</a> to view the real gradebook.
        </Alert>
        <Card size="lg" class="mt-5 ml-auto mr-auto">
            <div>
                <h1>Gradebook</h1>
                <table class="gradebook">
                    <tr id="header">
                        <th>Student</th>
                        <th>Overall</th>
                    </tr>
                    <tr id="categories">
                        <td><i>Category</i></td>
                        <td></td>
                    </tr>
                    <tr id="dates">
                        <td><i>Due Date</i></td>
                        <td></td>
                    </tr>
                    <tr id="points">
                        <td><i>Points</i></td>
                    </tr>
                    <tr id="averages">
                        <td><b>Average</b></td>
                    </tr>
                    <tfoot id="students">
                    </tfoot>
                </table>

                <table class="options">
                    <tr>
                        <th>
                            <h3>Add Student</h3>
                        </th>
                        <th>
                            <h3>Add Assignment</h3>
                        </th>
                    </tr>
                    <tr>
                        <td>
                            <form id="addStudent">
                                <label for="studentFirstName">First Name: </label>
                                <input type="text" id="studentFirstName" placeholder="Enter first name..." required>
                                <br>
                                <label for="studentLastName">Last Name: </label>
                                <input type="text" id="studentLastName" placeholder="Enter last name..." required>
                                <br>
                                <button>Add Student</button>
                            </form>
                        </td>
                        <td>
                            <form id="addAssignment">
                                <label for="assignmentName">Name: </label>
                                <input type="text" id="assignmentName" required placeholder="Enter name...">
                                <br>
                                <label for="assignmentCategory">Category: </label>
                                <input type="text" id="assignmentCategory" required placeholder="Enter category...">
                                <br>
                                <label for="assignmentPoints">Points: </label>
                                <input type="number" min="1" id="assignmentPoints" required
                                       placeholder="Enter points...">
                                <br>
                                <label for="assignmentDue">Due Date: </label>
                                <input type="date" id="assignmentDue" required>
                                <br>
                                <button>Add Assignment</button>
                            </form>
                        </td>
                    </tr>
                </table>
            </div>
        </Card>
    </div>
</section>
