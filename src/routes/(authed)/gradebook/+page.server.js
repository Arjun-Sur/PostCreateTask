import {caseCorrectly} from '$lib';
import {createAdminClient} from '$lib/server/appwrite.js';
import {ID, Query} from 'appwrite';

const GRADEBOOK_DATABASE_ID = "gradebook";
const ASSIGNMENTS_COLLECTION_ID = "assignments";
const STUDENTS_COLLECTION_ID = "students";
const GRADES_COLLECTION_ID = "grades";

/** @type {import('./$types').PageServerLoad} */
export async function load({locals}) {
    // Check if authorized
    const authorized = locals.user.labels.includes('admin');

    if (!authorized) {
        return {
            status: 401, error: new Error("Unauthorized")
        };
    }

    // Get the Appwrite server client
    const appwriteServer = createAdminClient();

    // Get database API
    const {database} = appwriteServer;

    // Fetches all assignments from the collection and puts them in an object
    async function getAssignments() {
        const assignments = await database.listDocuments(GRADEBOOK_DATABASE_ID, ASSIGNMENTS_COLLECTION_ID);
        const assObj = {};

        assignments.documents.forEach(assignment => assObj[assignment.$id] = {
            name: assignment?.name, category: assignment?.category, due: assignment?.due, points: assignment?.points
        });

        return assObj;
    }

    const assignments = await getAssignments();

    // Fetches all students from the collection and puts them in an object
    async function getStudents() {
        const students = await database.listDocuments(GRADEBOOK_DATABASE_ID, STUDENTS_COLLECTION_ID);
        const studentObj = {};

        students.documents.forEach(student => studentObj[student.$id] = {
            firstName: student["first_name"], lastName: student["last_name"]
        });

        return studentObj;
    }

    const students = await getStudents();

    // Fetches all grades from the collection and puts them in an object
    async function getGrades() {
        const grades = await database.listDocuments(GRADEBOOK_DATABASE_ID, GRADES_COLLECTION_ID, [Query.limit(100)]);
        const gradesObj = {};

        Object.entries(students).forEach(([studentId, student]) => {
            gradesObj[studentId] = {};

            Object.entries(assignments).forEach(([assignmentId, {points}]) => {
                gradesObj[studentId][assignmentId] = parseFloat((Math.min(Math.random() + 0.3, 1) * points).toFixed(1));
            });
        });

        grades.documents.forEach(grade => {
            gradesObj[grade?.students?.$id] = gradesObj[grade?.students?.$id] || {};
            gradesObj[grade?.students?.$id][grade?.assignments?.$id] = grade.grade;
        });

        return gradesObj;
    }

    const grades = await getGrades();

    return {
        assignments, students, grades, user: locals.user
    }
}


/** @type {import('./$types').Actions} */
export const actions = {
    addStudent: async ({locals, request}) => { // Ran when the "Add Student" form is submitted
        // Check if authorized
        const authorized = locals.user.labels.includes('admin');

        if (!authorized) {
            return {
                status: 401, error: new Error("Unauthorized")
            };
        }

        // Get the Appwrite server client
        const appwriteServer = createAdminClient();

        // Get database API
        const {database} = appwriteServer;

        // Get form data
        const formData = await request.formData();

        // Get the first and last name from the form data
        let firstName = formData.get('firstName');
        let lastName = formData.get('lastName');

        // Capitalize the first and last name
        firstName = caseCorrectly(firstName);
        lastName = caseCorrectly(lastName);

        // Add to the collection
        await database.createDocument(GRADEBOOK_DATABASE_ID, STUDENTS_COLLECTION_ID, ID.unique(), {
            "first_name": firstName, "last_name": lastName
        }).then(console.log).catch(console.error);
    }, removeStudent: async ({locals, request}) => {
        // Check if authorized
        const authorized = locals.user.labels.includes('admin');

        if (!authorized) {
            return {
                status: 401, error: new Error("Unauthorized")
            };
        }

        // Get the Appwrite server client
        const appwriteServer = createAdminClient();

        // Get database API
        const {database} = appwriteServer;

        // Get form data
        const formData = await request.formData();

        // Get the student ID from the form data
        const id = String(formData.get('id'));

        // Remove the student from the collection
        await database.deleteDocument(GRADEBOOK_DATABASE_ID, STUDENTS_COLLECTION_ID, id).then(console.log).catch(console.error);
    }, addAssignment: async ({locals, request}) => { // Ran when the "Add Assignment" form is submitted
        // Check if authorized
        const authorized = locals.user.labels.includes('admin');

        if (!authorized) {
            return {
                status: 401, error: new Error("Unauthorized")
            };
        }

        // Get the Appwrite server client
        const appwriteServer = createAdminClient();

        // Get database API
        const {database} = appwriteServer;

        // Get form data
        const formData = await request.formData();

        // Get the name, category, due date, and points from the form data
        let name = String(formData.get('name'));
        let category = String(formData.get('category'));
        let due = new Date(String(formData.get('due')));
        due = (due.getMonth() + 1) + "/" + (due.getDate() + 1);
        let points = parseInt(String(formData.get('points')));

        // Add to the collection
        await database.createDocument(GRADEBOOK_DATABASE_ID, ASSIGNMENTS_COLLECTION_ID, ID.unique(), {
            name, category, due, points
        }).then(console.log).catch(console.error);
    }, removeAssignment: async ({locals, request}) => { // Ran when the "Remove Assignment" button is clicked
        // Check if authorized
        const authorized = locals.user.labels.includes('admin');

        if (!authorized) {
            return {
                status: 401, error: new Error("Unauthorized")
            };
        }

        // Get the Appwrite server client
        const appwriteServer = createAdminClient();

        // Get database API
        const {database} = appwriteServer;

        // Get form data
        const formData = await request.formData();

        // Get the assignment ID from the form data
        const id = String(formData.get('id'));

        // Remove the assignment from the collection
        await database.deleteDocument(GRADEBOOK_DATABASE_ID, ASSIGNMENTS_COLLECTION_ID, id).then(console.log).catch(console.error);
    }, saveGrades: async ({locals, request}) => { // Ran when the "Save Grades" button is clicked
        // Check if authorized
        const authorized = locals.user.labels.includes('admin');

        if (!authorized) {
            return {
                status: 401, error: new Error("Unauthorized")
            };
        }

        // Get the Appwrite server client
        const appwriteServer = createAdminClient();

        // Get database API
        const {database} = appwriteServer;

        // Get form data
        const formData = await request.formData();

        // Get the grades from the form data
        const grades = JSON.parse(formData.get('grades'));

        // Update or create the grades in the collection
        for (const [studentId, studentGrades] of Object.entries(grades)) {
            for (const [assignmentId, grade] of Object.entries(studentGrades)) {
                const oldGrades = await database.listDocuments(GRADEBOOK_DATABASE_ID, GRADES_COLLECTION_ID, [Query.equal(STUDENTS_COLLECTION_ID, studentId), Query.equal(ASSIGNMENTS_COLLECTION_ID, assignmentId)]).catch(console.error);

                if (oldGrades.total > 0) {
                    await database.updateDocument(GRADEBOOK_DATABASE_ID, GRADES_COLLECTION_ID, oldGrades.documents[0].$id, {
                        students: studentId, assignments: assignmentId, grade: parseFloat(grade)
                    }).then(console.log).catch(console.error);
                } else {
                    await database.createDocument(GRADEBOOK_DATABASE_ID, GRADES_COLLECTION_ID, ID.unique(), {
                        students: studentId, assignments: assignmentId, grade: parseFloat(grade)
                    }).then(console.log).catch(console.error);
                }
            }
        }
    }, reset: async ({locals, request}) => { // Ran when the "Reset" button is clicked
        // Check if authorized
        const authorized = locals.user.labels.includes('admin');

        if (!authorized) {
            return {
                status: 401, error: new Error("Unauthorized")
            };
        }

        // Get the Appwrite server client
        const appwriteServer = createAdminClient();

        // Get database API
        const {database} = appwriteServer;

        // Get form data
        const formData = await request.formData();

        // Get the students and assignments from the form data
        const {students, assignments} = JSON.parse(formData.get('gradebook'));

        // Remove all students, assignments, and grades from the collection
        const studentDocuments = await database.listDocuments(GRADEBOOK_DATABASE_ID, STUDENTS_COLLECTION_ID);
        for (const student of studentDocuments.documents) {
            await database.deleteDocument(GRADEBOOK_DATABASE_ID, STUDENTS_COLLECTION_ID, student.$id).catch(console.error);
        }

        // Remove all assignments and grades from the collection
        const assignmentDocuments = await database.listDocuments(GRADEBOOK_DATABASE_ID, ASSIGNMENTS_COLLECTION_ID);
        for (const assignment of assignmentDocuments.documents) {
            await database.deleteDocument(GRADEBOOK_DATABASE_ID, ASSIGNMENTS_COLLECTION_ID, assignment.$id).catch(console.error);
        }

        // Remove all grades from the collection
        const gradeDocuments = await database.listDocuments(GRADEBOOK_DATABASE_ID, GRADES_COLLECTION_ID);
        for (const grade of gradeDocuments.documents) {
            await database.deleteDocument(GRADEBOOK_DATABASE_ID, GRADES_COLLECTION_ID, grade.$id).catch(console.error);
        }

        const studentIds = [];

        // Add the students back to their collection
        for (const {first, last} of students) {
            const document = await database.createDocument(GRADEBOOK_DATABASE_ID, STUDENTS_COLLECTION_ID, ID.unique(), {
                "first_name": first, "last_name": last
            }).catch(console.error);
            studentIds.push(document.$id);
        }

        const assignmentPointsIds = [];

        // Add the assignments back to their collection
        for (const {name, category, due, points} of assignments) {
            const document = await database.createDocument(GRADEBOOK_DATABASE_ID, ASSIGNMENTS_COLLECTION_ID, ID.unique(), {
                name, category, due, points
            }).catch(console.error);
            assignmentPointsIds.push({id: document.$id, points});
        }

        // Generate grades using student and assignments and add them to their collection
        for (const studentId of studentIds) {
            for (const {id, points} of assignmentPointsIds) {
                await database.createDocument(GRADEBOOK_DATABASE_ID, GRADES_COLLECTION_ID, ID.unique(), {
                    students: studentId,
                    assignments: id,
                    grade: parseFloat((Math.min(Math.random() + 0.3, 1) * points).toFixed(1))
                }).catch(console.error);
            }
        }
    }
};
