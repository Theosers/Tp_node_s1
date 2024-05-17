//Import des modules nécessaires
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { parse } = require('querystring'); //Pour analyser les données de requête POST
const pug = require('pug');
const { formatBirthdays, addStudent, deleteStudent, loadStudents, saveStudents } = require('./utils/helpers');
require('dotenv').config(); // chargement des variables d'environnement

// Définition de l'hôte et du port à utiliser
const hostname = process.env.APP_LOCALHOST || '127.0.0.1';
const port = process.env.APP_PORT || 3000;

// Création du serveur HTTP if GET else if POST
const server = http.createServer((req, res) => {

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (req.method === 'GET') {
        if (pathname === '/') { // formulaire d'ajout des utilisateurs
            servePug(res, 'view/home.pug', {});
        } else if (pathname === '/users') { // Affichage de la liste des utilisateurs
            const students = loadStudents();
            servePug(res, 'view/users.pug', { students: formatBirthdays(students) });
        } else if (pathname.startsWith('/assets')) { // Gestion des fichiers statiques
            serveFile(res, pathname, getContentType(pathname));
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
        }
    } else if (req.method === 'POST') {
        if (pathname === '/add-user') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                const { name, birth } = parse(body);
                const students = loadStudents();
                addStudent(students, { name, birth });
                saveStudents(students);
                res.writeHead(302, { Location: '/users' });
                res.end();
            });
        } else if (pathname === '/delete-user') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                const { name } = parse(body);
                const students = loadStudents();
                deleteStudent(students, name);
                saveStudents(students);
                res.writeHead(302, { Location: '/users' });
                res.end();
            });
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
        }
    }
});

function serveFile(res, filepath, contentType) {
    const fullpath = path.join(__dirname, filepath);
    fs.readFile(fullpath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}

function getContentType(filepath) {
    const ext = path.extname(filepath);
    switch (ext) {
        case '.html': return 'text/html';
        case '.css': return 'text/css';
        case '.js': return 'application/javascript';
        default: return 'text/plain';
    }
}

function servePug(res, filepath, data) {
    const fullpath = path.join(__dirname, filepath);
    fs.readFile(fullpath, 'utf-8', (err, pugData) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
        } else {
            const compiledFunction = pug.compile(pugData);
            const html = compiledFunction(data);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
        }
    });
}

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
