var sqlite = require('better-sqlite3');
var usersHandler = require('./usersHandler.js');
var projectsHandler = require('./projectsHandler.js');
var administratorsTools = require('./administratorsTools.js');
var categoriesHandler = require('./categoriesHandler.js');
var eventsHandler = require('./eventsHandler.js');
var keywordsHandler = require('./keywordsHandler.js');
var db = new sqlite('database.sqlite');


db.prepare('CREATE TABLE IF NOT EXISTS users (email VARCHAR2(30) PRIMARY KEY, username VARCHAR2(20) UNIQUE, password VARCHAR2(50), status VARCHAR2(20))').run();

// PROBLEME !!! => throws "SqliteError: table projects has no column named title". I tried debugging from the sqlite command line and here.... =(
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
 *
 */

 /*No need of an existence check here, as the rout already check the username and email availability.*/
exports.createUser = function(email, username, password, status) {
    return usersHandler.createUser(email, username, password, status);
}



exports.updateUserPassword = function(email, password) {
    if (!exists(email, "email", "users")) return null;
    return usersHandler.updateUserPassword(email, password);
}

exports.updateUserUsername = function(email, username) {
    if (!exists(email, "email", "users")) return null;
    return usersHandler.updateUserUsername(email, username);
}


exports.deleteUser = function(email) {
    if (!exists(email, "email", "users")) return null;
    return usersHandler.deleteUser(email);
}

exports.getUserStatus = function(userEmail) {
    if (!exists(userEmail, "email", "users")) return null;
    return usersHandler.getUserStatus(userEmail);
}

exports.getUserId = function(userUsername) {
    if (!exists(userUsername, "username", "users")) return null;
    return usersHandler.getUserId(userUsername);
}

exports.getUsername = function(userId) {
    if (!exists(userId, "email", "users")) return null;
    return usersHandler.getUsername(userId);
}


//TODO modifier la function pour associer un tableau de catégories au résultat. 
exports.getProjects = function(email) {
    return usersHandler.getProjects(email);
}


/***
 * 
 *          TO LOGIN AND SIGNIN
 * 
 */

 exports.isTheRightPassword = function(email, userPassword) {
    if(!exists(email, "email", "users")) return null;
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
    if(! exists(userEmail, "email", "users")) return null;
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
    if(exists(projectId, "projectId", "projects")) return null;
    return projectsHandler.createProject(title, description, categories, creator, date, keywords);
}

exports.updateProject = function(projectId, title, description, creator) {
    if(! exists(projectId, "projectId", "projects")) return null;
    return projectsHandler.updateProject(projectId, title, description, creator);
}

exports.deleteProject = function(projectId) {
    if(! exists(projectId, "projectId", "projects")) return null;
    return projectsHandler.deleteProject(projectId);
}

/***
 * 
 *          FOR THE PROJECT MEMBERS
 * 
 */

exports.addMember = function(projectIdConcerned, userToAdd, status) {
    if(exists(projectIdConcerned, userToAdd, "projectId", "user", "projectMembers")) return null;
    return projectsHandler.addMember(projectIdConcerned, userToAdd, status);
}

exports.updateMemberStatus = function(projectIdConcerned, userConcerned, newStatus) {
    if(! exists(projectIdConcerned, userConcerned, "projectId", "user", "projectMembers")) return null;
    return projectsHandler.updateMemberStatus(projectIdConcered, userConcerned, newStatus);
}

exports.removeMember = function(projectId, userToRemove) {
    if(! exists(projectId, userToRemove, "projectId", "user", "projectMembers")) return null;
    return projectsHandler.removeMember(projectId, userToRemove);
}

exports.getMembers = function(projectId) {
    if(! exists(projectId, "projectId", "projectMembers")) return null;
    return projectsHandler.getMembers(projectId);
}

/***
 * 
 *          FOR THE KEYWORDS
 * 
 */

exports.addKeyword = function(projectId, keywordToAdd) {
    if(exists(projectId, keywordToAdd, "projectId", "keyword", "projectKeywords")) return null;
    return keywordsHandler.addKeyword(projectId, keywordToAdd);
}

exports.removeKeyword = function(projectId, keywordToRemove) {
    if(! exists(projectId, keywordToRemove, "projectId", "keyword", "projectKeywords")) return null;
    return keywordsHandler.removeKeyword(projectId, keywordToRemove);
}

/***
 * 
 *          FOR THE EVENTS
 * 
 */

exports.addEvent = function(projectId, eventToAdd, dateOfEvent) {
    if(exists(projectId, eventToAdd, "projectId", "event", "projectEvents")) return null;
    return eventsHandler.addEvent(projectId, eventToAdd, dateOfEvent);
}

exports.updateEvent = function(projectId, previousEvent, newEvent) {
    if(! exists(projectId, eventToRemove, "projectId", "event", "projectEvents")) return null;
    return eventsHandler.updateEvent(projectId, previousEvent, newEvent);
}

exports.changeEventDate = function(projectId, eventToChange, newDate) {
    if(! exists(projectId, eventToChange, "projectId", "event", "projectEvents")) return null;
    return eventsHandler.changeEventDate(projectId, eventToChange, newDate);
}

exports.removeEvent = function(projectId, eventToRemove) {
    if(! exists(projectId, eventToRemove, "projectId", "event", "projectEvents")) return null;
    return eventsHandler.removeEvent(projectId, event);
}


/***
 * 
 *          FOR THE CATEGORIES
 * 
 */

 exports.addCategory = function(projectId, categoryToAdd) {
    if(exists(projectId, categoryToAdd, "projectId", "category", "projectCategories")) return null;
    return categoriesHandler.addCategory(projectId, categoryToAdd);
 }

 exports.removeCategory = function(projectId, categoryToRemove) {
    if(! exists(projectId, categoryToRemove, "projectId", "category", "projectCategories")) return null;

    return categoriesHandler.removeCategory(projectId, categoryToRemove);
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
    db.prepare('DROP TABLE projectCategories').run();
    db.prepare('DROP TABLE projects').run();
    db.prepare('DROP TABLE users').run();

    //creation of the clean tables.

    db.prepare('CREATE TABLE users (email VARCHAR2(30) PRIMARY KEY, username VARCHAR2(20) UNIQUE, password VARCHAR2(50)), status VARCHAR2(20)').run();

    db.prepare('CREATE TABLE projects (projectId INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR2(60), description VARCHAR2(1000), creator VARCHAR2(30) REFERENCES users), date DATE').run();

    db.prepare('CREATE TABLE projectMembers (projectId INTEGER REFERENCES projects ON DELETE CASCADE, user VARCHAR2(30) REFERENCES users ON DELETE CASCADE, status VARCHAR2(15), PRIMARY KEY(projectId, user))').run();

    db.prepare('CREATE TABLE projectKeyWords (projectId INTEGER REFERENCES projects ON DELETE CASCADE, keyword VARCHAR2(15), PRIMARY KEY(projectId, keyword))').run();

    db;prepare('CREATE TABLE projectCategories (projectId INTEGER REFERENCES projects, category VARCHAR(20), PRIMARY KEY(projectId, category)').run();

    db.prepare('CREATE TABLE projectEvents (projectId INTEGER REFERENCES projects ON DELETE CASCADE, event VARCHAR2(500), date DATE, PRIMARY KEY(projectId, event))').run();

    createUser('admin@admin.fr', 'Administrator', 'AZERTY', 'administrator');
}


var exists = function(content, field, table) {
    content = String(content);
    let check = db.prepare(`SELECT ${field} FROM ${table} WHERE ${field}=?`).get([content]);
    return check !== undefined;
}

var exists2 = function(content1, content2, field1, field2, table) {
    content1 = String(content1);
    content2 = String(content2);
    let check = db.prepare(`SELECT ${field1}, ${field2} FROM ${table} WHERE ${field1}=? AND ${field2}=?`).get([content1, content2]);
    return check !== undefined;
}
