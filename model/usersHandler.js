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


exports.deleteUser = function(email) {
    let query = db.prepare('DELETE FROM users WHERE email=?');
    let result = query.run([email]);
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

exports.getUsername = function(userId) {
    let query = db.prepare('SELECT username FROM users WHERE email=?');
    let result = query.get([userId]);
    return result === undefined ? result : result.username;
}

exports.getProjects = function(email) {
    let projects = {};
    projects.created = db.prepare('SELECT projectId, title, creator, date(date) date FROM projects WHERE creator=?').all([email]);
    projects.supported = db.prepare('SELECT P.projectId, P.title, P.creator, date(P.date) date FROM projects P WHERE P.projectId IN (SELECT projectId FROM projectLinkedUsers WHERE user=? AND status=?').all([email, "member"]);
    
    //projects.supported = db.prepare('SELECT P.projectId, P.title, P.creator, date(P.date) date FROM projects P WHERE P.projectId IN (SELECT projectId FROM projectLinkedUsers WHERE user=? AND (status=? OR status=?)').all([email, "member", "moderator"]);
    projects.followed = db.prepare('SELECT P.projectId, P.title, P.creator, date(P.date) date FROM projects P WHERE P.projectId IN (SELECT projectId FROM projectLinkedUsers WHERE user=? AND status=?)').all([email, "followers"]);
    
    setCategories(projects.created);
    setCategories(projects.supported);
    setCategories(projects.followed);

    setCreator(projects.created);
    setCreator(projects.supported);
    setCreator(projects.followed);

    setKeywords(projects.created);
    setKeywords(projects.supported);
    setKeywords(projects.followed);
    return projects;
}

function setKeywords(projects) {
    for (project of projects) {
        project.keywords = getInfoString("projectKeyWords", "keyword", project.projectId);
    }
}

function getInfoString(table, field, projectId) {
    let array = db.prepare(`SELECT ${field} FROM ${table} WHERE projectId=?`).all([projectId]);
    if (array.length == 0) return "";
    let infos = array[0][field];
    for (let i = 1; i < array.length; i++) {
        infos += ", " + array[i][field];
    }
    return infos;
}

function setCreator(projects) {
    let query = db.prepare('SELECT username FROM users WHERE email=?');
    for (project of projects) {
        project.creator = query.get([project.creator]).username;
    }
}

function setCategories(projects) {
    for (project of projects) {
        project.categories = getInfoString("projectCategories", "category", project.projectId);
    }
}


exports.isTheRightPassword = function(email, userPassword) {
    let query = db.prepare('SELECT password FROM users WHERE email=?');
    let result = query.get([email]);
    return result !== undefined && result.password === userPassword;
}

exports.credentialsAreFree = function(email, username) {
    let query = db.prepare('SELECT email FROM Users WHERE email=?');
    if (query.get([email]) !== undefined) return -1;
    query = db.prepare('SELECT username FROM Users WHERE username=?');
    if (query.get([username]) !== undefined) return -2;
    return 1;
}