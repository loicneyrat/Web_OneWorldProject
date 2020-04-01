var sqlite = require('better-sqlite3');
var usersHandler = require('./usersHandler.js');
var projectsHandler = require('./projectsHandler.js');
var administratorsTools = require('./administratorsTools.js');
var categoriesHandler = require('./categoriesHandler.js');
var eventsHandler = require('./eventsHandler.js');
var keywordsHandler = require('./keywordsHandler.js');
var db = new sqlite('database.sqlite');


db.prepare('CREATE TABLE IF NOT EXISTS users (email VARCHAR2(30) PRIMARY KEY, username VARCHAR2(20) UNIQUE, password VARCHAR2(50), status VARCHAR2(20))').run();

db.prepare('CREATE TABLE IF NOT EXISTS projects (projectId INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR2(60), description VARCHAR2(1000), creator VARCHAR2(30) REFERENCES users, date DATE)').run();

db.prepare('CREATE TABLE IF NOT EXISTS projectMembers(projectId INTEGER REFERENCES projects ON DELETE CASCADE, user VARCHAR2(30) REFERENCES users ON DELETE CASCADE, status VARCHAR2(15), PRIMARY KEY(projectId, user))').run();

db.prepare('CREATE TABLE IF NOT EXISTS projectKeyWords(projectId INTEGER REFERENCES projects ON DELETE CASCADE, keyword VARCHAR2(15), PRIMARY KEY(projectId, keyword))').run();

db.prepare('CREATE TABLE IF NOT EXISTS projectCategories (projectId INTEGER REFERENCES projects, category VARCHAR(20), PRIMARY KEY(projectId, category))').run();

db.prepare('CREATE TABLE IF NOT EXISTS projectEvents(projectId INTEGER REFERENCES projects ON DELETE CASCADE, event VARCHAR2(500), date DATE, PRIMARY KEY(projectId, event))').run();


//usersHandler.createUser('admin@admin.fr', 'Administrator', 'AZERTY', 'administrator');

/***
 * 
 *          FOR A USER
 * 
 */
exports.createUser = function(email, username, password, status) {
    return usersHandler.createUser(email, username, password, status);
}



exports.updateUserPassword = function(email, password) {
    return usersHandler.updateUserPassword(email, password);
}

exports.updateUserUsername = function(email, username) {
    return usersHandler.updateUserUsername(email, username);
}


exports.deleteUser = function(email) {
    return usersHandler.deleteUser(email);
}

exports.getUserStatus = function(userEmail) {
    if (!sqlCheck("users", "email", userEmail)) return null;
    return usersHandler.getUserStatus(userEmail);
}

exports.getUserId = function(userUsername) {
    if(!sqlCheck("users", "username", userUsername)) return null;
    return usersHandler.getUserId(username);
}

exports.getUsername = function(userId) {
    if (!sqlCheck("users", "email", userId)) return null;
    return usersHandler.getUsername(userId);
}


//TODO modifier la function pour associer un tableau de catégories au résultat. 
exports.getProjects = function(username) {
    return usersHandler.getProjects(username);
}


/***
 * 
 *          TO LOGIN AND SIGNIN
 * 
 */

 exports.isTheRightPassword = function(email, userPassword) {
     return usersHandler.isTheRightPassword(email, userPassword);
 }

 exports.credentialsAreFree = function(email, username) {
     return usersHandler.credentialsAreFree(email, username);
 }


/***
 * 
 *          FOR THE ADMINISTRATORS
 * 
 */

exports.updateUserStatus = function (userEmail, newStatus) {
    return administratorsTools.updateUserStatus(userEmail, newStatus);
}

exports.getUsersList = function() {
    return administratorsTools.getUsersList();
}


/***
 * 
 *          FOR THE PROJECTS
 * 
 */


exports.createProject = function(title, description, categories, creator, date, keywords) {
    return projectsHandler.createProject(title, description, categories, creator, date, keywords);
}

exports.updateProject = function(projectId, title, description, creator) {
    return projectsHandler.updateProject(projectId, title, description, creator);
}

exports.deleteProject = function(projectId) {
    return projectsHandler.deleteProject(projectId);
}

/***
 * 
 *          FOR THE PROJECT MEMBERS
 * 
 */

exports.addMember = function(projectId, user, status) {
    return projectsHandler.addMember(projectId, user, status);
}

exports.updateMemberStatus = function(projectId, user, status) {
    return projectsHandler.updateMemberStatus(projectId, user, status);
}

exports.removeMember = function(projectId, user) {
    return projectsHandler.removeMember(projectId, user);
}

exports.getMembers = function(projectId) {
    return projectsHandler.getMembers(projectId);
}

/***
 * 
 *          FOR THE KEYWORDS
 * 
 */

exports.addKeyword = function(projectId, keyword) {
    return keywordsHandler.addKeyword(projectId, keyword);
}

exports.removeKeyword = function(projectId, keyword) {
    return keywordsHandler.removeKeyword(projectId, keyword);
}

/***
 * 
 *          FOR THE EVENTS
 * 
 */

exports.addEvent = function(projectId, event, date) {
    return eventsHandler.addEvent(projectId, event, date);
}

exports.updateEvent = function(projectId, previousEvent, newEvent) {
    return eventsHandler.updateEvent(projectId, previousEvent, newEvent);
}

exports.removeEvent = function(projectId, event) {
    return eventsHandler.removeEvent(projectId, event);
}


/***
 * 
 *          FOR THE CATEGORIES
 * 
 */

 exports.addCategory = function(projectId, category) {
    return categoriesHandler.addCategory(projectId, category);
 }

 exports.removeCategory = function(projectId, category) {
    return categoriesHandler.removeCategory(projectId, category);
 }


/***
 * 
 *          TO RESTART
 * 
 */

exports.resetDatabase = function() {
    db.prepare('DROP TABLE projectEvents').run();
    db.prepare('DROP TABLE projectKeywords').run();
    db.prepare('DROP TABLE projectMembers').run();
    db.prepare('DROP TABLE projects').run();
    db.prepare('DROP TABLE users').run();

    //creation of the clean tables.

    db.prepare('CREATE TABLE users (email VARCHAR2(30) PRIMARY KEY, username VARCHAR2(20) UNIQUE, password VARCHAR2(50)), status VARCHAR2(20)').run();

    db.prepare('CREATE TABLE projects (projectId INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR2(60), description VARCHAR2(1000), creator VARCHAR2(30) REFERENCES users), date DATE').run();

    db.prepare('CREATE TABLE projectMembers(projectId INTEGER REFERENCES projects ON DELETE CASCADE, user VARCHAR2(30) REFERENCES users ON DELETE CASCADE, status VARCHAR2(15), PRIMARY KEY(projectId, user))').run();

    db.prepare('CREATE TABLE projectKeyWords(projectId INTEGER REFERENCES projects ON DELETE CASCADE, keyword VARCHAR2(15), PRIMARY KEY(projectId, keyword))').run();

    db;prepare('CREATE TABLE projectCategories (projectId INTEGER REFERENCES projects, category VARCHAR(20), PRIMARY KEY(projectId, category)').run();

    db.prepare('CREATE TABLE projectEvents(projectId INTEGER REFERENCES projects ON DELETE CASCADE, event VARCHAR2(500), date DATE, PRIMARY KEY(projectId, event))').run();

    createUser('admin@admin.fr', 'Administrator', 'AZERTY', 'administrator');
}


var sqlCheck = function(table, field, content) {
    content = String(content);
    let check = db.prepare(`SELECT ${field} FROM ${table} WHERE ${field}=?`).get([content]);
    console.log(check);
    return check !== undefined;
}
