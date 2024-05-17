const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
require('dayjs/locale/fr');
dayjs.locale('fr');

const studentsFilePath = path.join(__dirname, '../Data/students.json');

function loadStudents() {
    const data = fs.readFileSync(studentsFilePath);
    return JSON.parse(data);
}

function saveStudents(students) {
    fs.writeFileSync(studentsFilePath, JSON.stringify(students, null, 2));
}

function formatBirthdays(students) {
    return students.map(student => ({
        name: student.name,
        birth: dayjs(student.birth).format('D MMMM YYYY')
    }));
}

function addStudent(students, student) {
    students.push(student);
}

function deleteStudent(students, name) {
    const index = students.findIndex(student => student.name === name);
    if (index !== -1) {
        students.splice(index, 1);
    }
}

module.exports = {
    formatBirthdays,
    addStudent,
    deleteStudent,
    loadStudents,
    saveStudents
};
