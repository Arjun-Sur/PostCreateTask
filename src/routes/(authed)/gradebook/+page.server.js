import {caseCorrectly} from '$lib';
import {createAdminClient} from '$lib/server/appwrite.js';
import {ID, Query} from 'appwrite';

let cache;

/** @type {import('./$types').PageServerLoad} */
export async function load({locals}) {
    const authorized = locals.user.labels.includes('admin');

    if (!authorized) {
        return {
            status: 401,
            error: new Error("Unauthorized")
        };
    }

    if (!cache || true) {
        const appwriteServer = createAdminClient();

        const {database} = appwriteServer;

        async function getAssignments() {
            const assignments = await database.listDocuments("gradebook", "assignments");
            const assObj = {};

            assignments.documents.forEach(assignment => assObj[assignment.$id] = {
                name: assignment?.name,
                category: assignment?.category,
                due: assignment?.due,
                points: assignment?.points
            });

            return assObj;
        }

        const assignments = await getAssignments();

        async function getStudents() {
            const students = await database.listDocuments("gradebook", "students");
            const studentObj = {};

            students.documents.forEach(student => studentObj[student.$id] = {
                firstName: student["first_name"],
                lastName: student["last_name"]
            });

            return studentObj;
        }

        const students = await getStudents();

        async function getGrades() {
            const grades = await database.listDocuments("gradebook", "grades");
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

        cache = {
            assignments, students, grades
        }
    }

    return {
        ...cache,
        user: locals.user
    };
}


/** @type {import('./$types').Actions} */
export const actions = {
    addStudent: async ({locals, request}) => {
        const authorized = locals.user.labels.includes('admin');

        if (!authorized) {
            return {
                status: 401,
                error: new Error("Unauthorized")
            };
        }

        const appwriteServer = createAdminClient();

        const {database} = appwriteServer;

        const formData = await request.formData();

        let firstName = formData.get('firstName');
        let lastName = formData.get('lastName');

        firstName = caseCorrectly(firstName);
        lastName = caseCorrectly(lastName);

        await database.createDocument("gradebook", "students", ID.unique(), {
            "first_name": firstName,
            "last_name": lastName
        }).then(console.log).catch(console.error);
    },
    removeStudent: async ({locals, request}) => {
        const authorized = locals.user.labels.includes('admin');

        if (!authorized) {
            return {
                status: 401,
                error: new Error("Unauthorized")
            };
        }

        const appwriteServer = createAdminClient();

        const {database} = appwriteServer;

        const formData = await request.formData();

        const id = String(formData.get('id'));

        await database.deleteDocument("gradebook", "students", id).then(console.log).catch(console.error);
    },
    addAssignment: async ({locals, request}) => {
        const authorized = locals.user.labels.includes('admin');

        if (!authorized) {
            return {
                status: 401,
                error: new Error("Unauthorized")
            };
        }

        const appwriteServer = createAdminClient();

        const {database} = appwriteServer;

        const formData = await request.formData();

        let name = String(formData.get('name'));
        let category = String(formData.get('category'));
        let due = new Date(String(formData.get('due')));
        due = (due.getMonth() + 1) + "/" + (due.getDate() + 1);
        let points = parseInt(String(formData.get('points')));

        await database.createDocument("gradebook", "assignments", ID.unique(), {
            name, category, due, points
        }).then(console.log).catch(console.error);
    },
    removeAssignment: async ({locals, request}) => {
        const authorized = locals.user.labels.includes('admin');

        if (!authorized) {
            return {
                status: 401,
                error: new Error("Unauthorized")
            };
        }

        const appwriteServer = createAdminClient();

        const {database} = appwriteServer;

        const formData = await request.formData();

        const id = String(formData.get('id'));

        await database.deleteDocument("gradebook", "assignments", id).then(console.log).catch(console.error);
    },
    saveGrades: async ({locals, request}) => {
        const authorized = locals.user.labels.includes('admin');

        if (!authorized) {
            return {
                status: 401,
                error: new Error("Unauthorized")
            };
        }

        const appwriteServer = createAdminClient();

        const {database} = appwriteServer;

        const formData = await request.formData();

        const grades = JSON.parse(formData.get('grades'));

        for (const [studentId, studentGrades] of Object.entries(grades)) {
            for (const [assignmentId, grade] of Object.entries(studentGrades)) {
                const oldGrades = await database.listDocuments("gradebook", "grades", [Query.equal("students", studentId), Query.equal("assignments", assignmentId)]).catch(console.error);

                if (oldGrades.total > 0) {
                    await database.updateDocument("gradebook", "grades", oldGrades.documents[0].$id, {
                        students: studentId,
                        assignments: assignmentId,
                        grade: parseFloat(grade)
                    }).then(console.log).catch(console.error);
                } else {
                    await database.createDocument("gradebook", "grades", ID.unique(), {
                        students: studentId,
                        assignments: assignmentId,
                        grade: parseFloat(grade)
                    }).then(console.log).catch(console.error);
                }
            }
        }
    },
    reset: async ({locals, request}) => {
        const authorized = locals.user.labels.includes('admin');

        if (!authorized) {
            return {
                status: 401,
                error: new Error("Unauthorized")
            };
        }

        const appwriteServer = createAdminClient();

        const {database} = appwriteServer;

        const formData = await request.formData();

        const {students, assignments} = JSON.parse(formData.get('gradebook'));

        const studentDocuments = await database.listDocuments("gradebook", "students");
        for (const student of studentDocuments.documents) {
            await database.deleteDocument("gradebook", "students", student.$id).catch(console.error);
        }

        const assignmentDocuments = await database.listDocuments("gradebook", "assignments");
        for (const assignment of assignmentDocuments.documents) {
            await database.deleteDocument("gradebook", "assignments", assignment.$id).catch(console.error);
        }

        const gradeDocuments = await database.listDocuments("gradebook", "grades");
        for (const grade of gradeDocuments.documents) {
            await database.deleteDocument("gradebook", "grades", grade.$id).catch(console.error);
        }

        const studentIds = [];

        for (const {first, last} of students) {
            const document = await database.createDocument("gradebook", "students", ID.unique(), {
                "first_name": first,
                "last_name": last
            }).catch(console.error);
            studentIds.push(document.$id);
        }

        const assignmentPointsIds = [];

        for (const {name, category, due, points} of assignments) {
            const document = await database.createDocument("gradebook", "assignments", ID.unique(), {
                name, category, due, points
            }).catch(console.error);
            assignmentPointsIds.push({id: document.$id, points});
        }

        for (const studentId of studentIds) {
            for (const {id, points} of assignmentPointsIds) {
                await database.createDocument("gradebook", "grades", ID.unique(), {
                    students: studentId,
                    assignments: id,
                    grade: parseFloat((Math.min(Math.random() + 0.3, 1) * points).toFixed(1))
                }).catch(console.error);
            }
        }
    }
};
