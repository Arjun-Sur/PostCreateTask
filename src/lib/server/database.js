
export const assignments = {
    1: {
        name: "11/8 HW",
        category: "Homework",
        due: "11/8",
        points: 30
    },
    2: {
        name: "Unit 6 Assessment",
        category: "Assessments",
        due: "11/9",
        points: 100
    },
    3: {
        name: "11/10 CW",
        category: "Classwork",
        due: "11/10",
        points: 30
    },
    4: {
        name: "11/11 HW",
        category: "Homework",
        due: "11/11",
        points: 30
    }
}

export async function getAssignments() {
        return assignments;
}

// export const students = ["Byrne, Garfield", "Green, Rahim", "Curry, Leyton", "Walters, Phillip", "Chen, Pennington", "Doe, John", "Smith, Bob", "Velazquez, Anne"]

// export const students = ["Sur, Arjun", "Yun, Mina", "Zheng, Audrey", "Jiang, Abraham", "Chen, Derek", "Doe, John", "Smith, Bob", "Slobodianik, Yan"];

export const students = {
    1: {
        firstName: "Arjun",
        lastName: "Sur"
    },
    2: {
        firstName: "Mina",
        lastName: "Yun"
    },
    3: {
        firstName: "Audrey",
        lastName: "Zheng"
    },
    4: {
        firstName: "Abraham",
        lastName: "Jiang"
    },
    5: {
        firstName: "Derek",
        lastName: "Chen"
    },
    6: {
        firstName: "John",
        lastName: "Doe"
    },
    7: {
        firstName: "Bob",
        lastName: "Smith"
    },
    8: {
        firstName: "Yan",
        lastName: "Slobodianik"
    }
}

export async function getStudents() {
    return students;
}

export const grades = {};

Object.entries(students).forEach(([studentId, student]) => {
    grades[studentId] = {};

    Object.entries(assignments).forEach(([assignmentId, {points}]) => {
        grades[studentId][assignmentId] = parseFloat((Math.min(Math.random() + 0.3, 1) * points).toFixed(1));
    });
});

export async function getGrades() {
    return grades;
}
