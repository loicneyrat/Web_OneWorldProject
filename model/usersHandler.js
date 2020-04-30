var sqlite = require('better-sqlite3');
var db = new sqlite('database.sqlite');


exports.createUser = function(email, username, password, status) {
    let insert = db.prepare('INSERT INTO users (email, username, password, status) VALUES(?, ?, ?, ?)');
    let result = insert.run([email, username, password, status]);
    return result.changes === 1;
}

exports.updateUserPassword = function(email, password) {
    let update = db.prepare('UPDATE users SET password=? WHERE email=?');
    let result = update.run([password, email]);
    return result.changes === 1;
}

exports.updateUserUsername = function(email, username) {
    let update = db.prepare('UPDATE users SET username=? WHERE email=?');
    let result = update.run([username, email]);
    return result.changes === 1;
}

exports.getUserPassword = function(email) {
    let query = db.prepare('SELECT password FROM users WHERE email=?');
    return query.get([email]).password;
}

exports.deleteUser = function(email) {
    let projects = db.prepare('SELECT projectId FROM projects WHERE creator=?').all([email]);
    if (projects.length !== 0) {
        for (let i = 0; i < projects.length; i++) {
            let projectId = projects[i].projectId;
            db.prepare('DELETE FROM projectEvents WHERE projectId=? OR creator=?').run([projectId, email]);
            db.prepare('DELETE FROM projectKeywords WHERE projectId=?').run([projectId]);
            db.prepare('DELETE FROM projectCategories WHERE projectId=?').run([projectId]);
            db.prepare('DELETE FROM projects WHERE projectId=?').run([projectId]);
        }
    }
    db.prepare('DELETE FROM projectLinkedUsers WHERE user=?').run([email]);
    let result = db.prepare('DELETE FROM users WHERE email=?').run([email]);
    return result.changes === 1;
}

exports.getUserStatus = function(email) {
    let query = db.prepare('SELECT status FROM users WHERE email=?');
    let result = query.get([email]);
    return result === undefined ? undefined : result.status;
}

exports.getUserId = function(username) {
    let query = db.prepare('SELECT email FROM users WHERE username=?');
    let result = query.get([username]);
    return result === undefined ? result : result.email;
}

exports.getUsername = function (userId) {
    let query = db.prepare('SELECT username FROM users WHERE email=?');
    let result = query.get([userId]);
    return result === undefined ? result : result.username;
}

exports.getProjects = function(email) {
    let projects = {};
    projects.created = db.prepare('SELECT projectId, title, creator, date(date) date FROM projects WHERE creator=?').all([email]);
    projects.supported = db.prepare('SELECT P.projectId, P.title, P.creator, date(P.date) date FROM projects P WHERE P.projectId IN (SELECT projectId FROM projectLinkedUsers WHERE user=? AND (status=? OR status=?))').all([email, "member", "moderator"]);

    setComplementariesInformationsProjects(projects.created, email);
    setComplementariesInformationsProjects(projects.supported, email);

    return projects;
}


function getProjectInfoString(table, field, projectId) {
    let array = db.prepare(`SELECT ${field} FROM ${table} WHERE projectId=?`).all([projectId]);
    if (array.length == 0) return "";
    let infos = array[0][field];
    for (let i = 1; i < array.length; i++) {
        infos += ", " + array[i][field];
    }
    return infos;
}

function setComplementariesInformationsProjects(projects, user) {
    for (project of projects) {
        let projectId = project.projectId;
        project.creator = getUsername(project.creator);
        project.keywords = getKeywordsAsString(projectId);
        project.categories = getCategoriesAsString(projectId);
        project.isModerator = isModerator(projectId, user); 
    }
}

function getUsername(userId) {
    let query = db.prepare('SELECT username FROM users WHERE email=?');
    let result = query.get([userId]);
    return result === undefined ? result : result.username;
}

function getKeywordsAsString(projectId) {
    return project.keywords = getProjectInfoString("projectKeyWords", "keyword", projectId);
}

function getCategoriesAsString(projectId) {
    return project.categories = getProjectInfoString("projectCategories", "category", project.projectId);
}

function isModerator(projectId, user) {
    let result = db.prepare('SELECT status FROM projectLinkedUsers WHERE projectId=? AND user=?').get([projectId, user]);
    if (result === undefined) return;
    return result.status === "moderator";

}


exports.isTheRightPassword = function(email, userPassword) {
    let query = db.prepare('SELECT password FROM users WHERE email=?');
    let result = query.get([email]);
    return result !== undefined && result.password === userPassword;
}

exports.credentialsAreFree = function(email, username) {
    let query = db.prepare('SELECT username FROM users WHERE username=?');
    if (query.get([username]) !== undefined) return -2;
    query = db.prepare('SELECT email FROM users WHERE email=?');
    if (query.get([email]) !== undefined) return -1;
    return 1;
}