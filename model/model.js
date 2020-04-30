var sqlite = require('better-sqlite3');
var usersHandler = require('./usersHandler.js');
var projectsHandler = require('./projectsHandler.js');
var administratorsTools = require('./administratorsTools.js');
var categoriesHandler = require('./categoriesHandler.js');
var eventsHandler = require('./eventsHandler.js');
var keywordsHandler = require('./keywordsHandler.js');
var projectLinkedUsersHandler = require('./projectLinkedUsersHandler.js');
var db = new sqlite('database.sqlite');

/*
db.prepare('DROP TABLE projectEvents').run();
db.prepare('DROP TABLE projectCategories').run();
db.prepare('DROP TABLE projectLinkedUsers').run();
db.prepare('DROP TABLE projectKeyWords').run();
db.prepare('DROP TABLE projects').run();
db.prepare('DROP TABLE users').run();
*/


db.prepare('CREATE TABLE IF NOT EXISTS users (email VARCHAR2(30) PRIMARY KEY, username VARCHAR2(20) UNIQUE NOT NULL, password VARCHAR2(50) NOT NULL, status VARCHAR2(20) NOT NULL)').run();

db.prepare('CREATE TABLE IF NOT EXISTS projects (projectId INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR2(100) NOT NULL, description VARCHAR2(1000) NOT NULL, creator VARCHAR2(30) REFERENCES users NOT NULL, date DATE NOT NULL)').run();

db.prepare('CREATE TABLE IF NOT EXISTS projectLinkedUsers(projectId INTEGER REFERENCES projects ON DELETE CASCADE NOT NULL, user VARCHAR2(30) REFERENCES users ON DELETE CASCADE NOT NULL, status VARCHAR2(15) NOT NULL, PRIMARY KEY(projectId, user))').run();

db.prepare('CREATE TABLE IF NOT EXISTS projectKeyWords(projectId INTEGER REFERENCES projects ON DELETE CASCADE NOT NULL, keyword VARCHAR2(15) NOT NULL, PRIMARY KEY(projectId, keyword))').run();

db.prepare('CREATE TABLE IF NOT EXISTS projectCategories (projectId INTEGER REFERENCES projects ON DELETE CASCADE NOT NULL, category VARCHAR(20) NOT NULL, PRIMARY KEY(projectId, category))').run();

db.prepare('CREATE TABLE IF NOT EXISTS projectEvents(projectId INTEGER REFERENCES projects ON DELETE CASCADE NOT NULL, title VARCHAR2(100) NOT NULL, description VARCHAR2(750) NOT NULL, creator VARCHAR2(30) REFERENCES users NOT NULL, date DATE NOT NULL, PRIMARY KEY(projectId, title))').run();


//usersHandler.createUser('admin@admin.fr', 'Administrator', 'AZERTY', 'administrator');


exports.allCategories = getAllCategories();

function getAllCategories() {
    let result = [];
    result.push({"name": "person", "value": "Aide à la personne"});
    result.push({"name": "recycling", "value": "Recyclage"});
    result.push({"name": "lobbying", "value": "Lobbying"});
    result.push({"name": "cleaning", "value": "Nettoyage"});
    result.push({"name": "awarness", "value": "Sensibilisation"});
    result.push({"name": "socialLink", "value": "Lien social"});

    return result;
}

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

exports.getUserPassword = function(userId) {
    if (!exists(userId, "email", "users")) return null;
    return usersHandler.getUserPassword(userId);
}


exports.getProjects = function(email) {
    return usersHandler.getProjects(email);
}



/**
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



/**
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
    if(exists2(title, description, "title", "description", "projects")) return null;
    return projectsHandler.createProject(title, description, categories, creator, date, keywords);
}

exports.updateProject = function(projectId, title, description, categories, keywords) {
    if(! exists(projectId, "projectId", "projects")) return null;
    if(! exists(projectId, "projectId", "projectCategories")) return null;
    if(! exists(projectId, "projectId", "projectKeywords")) return null;
    return projectsHandler.updateProject(projectId, title, description, categories, keywords);
}

exports.deleteProject = function(projectId) {
    if(! exists(projectId, "projectId", "projects")) return null;
    return projectsHandler.deleteProject(projectId);
}

exports.getProjectDetails = function(projectId) {
    if(! exists(projectId, "projectId", "projects")) return null;
    return projectsHandler.getProjectDetails(projectId);
}

exports.getCreatorOfProject = function(projectId) {
    if(! exists(projectId, "projectId", "projects")) return null;
    return projectsHandler.getCreator(projectId);
}

exports.searchProjects = function(category, keywords) {
    return projectsHandler.searchProjects(category, keywords);
}

exports.changeCreators = function(projectId, newCreatorId) {
    return projectsHandler.changeCreators(projectId, newCreatorId);
}

/***
 * 
 *          FOR THE PROJECT LINKED USERS
 * 
 */


exports.addMember = function(projectIdConcerned, userToAdd) {
    if (exists2(projectIdConcerned, userToAdd, "projectId", "user", "projectLinkedUsers")) return null;
    return projectLinkedUsersHandler.addMember(projectIdConcerned, userToAdd);
}

exports.updateMemberStatus = function(projectIdConcerned, userConcerned, newStatus) {
    if(! exists2(projectIdConcerned, userConcerned, "projectId", "user", "projectLinkedUsers")) return null;
    return projectLinkedUsersHandler.updateMemberStatus(projectIdConcerned, userConcerned, newStatus);
}

exports.removeMember = function(projectId, userToRemove) {
    if(! exists2(projectId, userToRemove, "projectId", "user", "projectLinkedUsers")) return null;
    return projectLinkedUsersHandler.removeMember(projectId, userToRemove);
}

exports.getMembers = function(projectId) {
    if(! exists(projectId, "projectId", "projectLinkedUsers")) return null;
    return projectLinkedUsersHandler.getMembers(projectId);
}

exports.getUserProjectStatus = function(userEmail, projectId) {
    if(! exists2(projectId, userEmail, "projectId", "user", "projectLinkedUsers")) return null;
    return projectLinkedUsersHandler.getUserProjectStatus(userEmail, projectId);
}

exports.isMember = function(user, projectId) {
    if (!exists(user, "email", "users")) return null;
    if (!exists(projectId, "projectId", "projects")) return null;
    return (projectLinkedUsersHandler.isMember(user, projectId) || projectsHandler.getCreator(projectId) == user);
}


/***
 * 
 *          FOR THE KEYWORDS
 * 
 */

exports.addKeyword = function(projectId, keywordToAdd) {
    if(exists2(projectId, keywordToAdd, "projectId", "keyword", "projectKeywords")) return null;
    return keywordsHandler.addKeyword(projectId, keywordToAdd);
}

exports.removeAllKeywords = function(projectId) {
    if(!exists(projectId, "projectId", "projectKeyword")) return null;
    return keywordsHandler.removeAllKeywords(projectId);
}



/***
 * 
 *          FOR THE EVENTS
 * 
 */

exports.addEvent = function(projectId, title, description, creator, dateOfEvent) {
    if(exists2(projectId, title, "projectId", "title", "projectEvents")) return null;
    return eventsHandler.addEvent(projectId, title, description, creator, dateOfEvent);
}

exports.updateEvent = function(projectId, previousTitle, newTitle, description, dateOfEvent) {
    if (! exists2(projectId, previousTitle, "projectId", "title", "projectEvents")) return null;
    if (previousTitle !== newTitle && exists2(projectId, newTitle, "projectId", "title", "projectEvents")) return null;
    return eventsHandler.updateEvent(projectId, previousTitle, newTitle, description, dateOfEvent);
}

exports.removeEvent = function(projectId, title) {
    if(! exists2(projectId, title, "projectId", "title", "projectEvents"))
        return null;
    return eventsHandler.removeEvent(projectId, title);
}

exports.titleIsTaken = function(projectId, title) {
    return exists2(projectId, title, "projectId", "title", "projectEvents");
}

exports.getEventDetails = function(projectId, title) {
    if(! exists2(projectId, title, "projectId", "title", "projectEvents"))
        return null;
    return eventsHandler.getEventDetails(projectId, title);
}

exports.getCreatorOfEvent = function(projectId, title) {
    if(! exists2(projectId, title, "projectId", "title", "projectEvents"))
        return null;
    return eventsHandler.getCreator(projectId, title);
}



/***
 * 
 *          FOR THE CATEGORIES
 * 
 */

 exports.addCategory = function(projectId, categoryToAdd) {
    if(exists2(projectId, categoryToAdd, "projectId", "category", "projectCategories")) return null;
    return categoriesHandler.addCategory(projectId, categoryToAdd);
 }

 exports.removeAllCategories = function(projectId) {
    if(!exists(projectId, "projectId", "projectCategories")) return null;
    return categoriesHandler.removeAllCategories(projectId);
 }



/***
 * 
 *          TO RESTART
 * 
 */

exports.resetDatabase = function() {
    db.prepare('DROP TABLE projectEvents').run();
    db.prepare('DROP TABLE projectCategories').run();
    db.prepare('DROP TABLE projectLinkedUsers').run();
    db.prepare('DROP TABLE projectKeyWords').run();
    db.prepare('DROP TABLE projects').run();
    db.prepare('DROP TABLE users').run();

    //creation of the clean tables.

    db.prepare('CREATE TABLE IF NOT EXISTS users (email VARCHAR2(30) PRIMARY KEY, username VARCHAR2(20) UNIQUE NOT NULL, password VARCHAR2(50) NOT NULL, status VARCHAR2(20) NOT NULL)').run();

    db.prepare('CREATE TABLE IF NOT EXISTS projects (projectId INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR2(100) NOT NULL, description VARCHAR2(1000) NOT NULL, creator VARCHAR2(30) REFERENCES users NOT NULL, date DATE NOT NULL)').run();
    
    db.prepare('CREATE TABLE IF NOT EXISTS projectLinkedUsers(projectId INTEGER REFERENCES projects ON DELETE CASCADE NOT NULL, user VARCHAR2(30) REFERENCES users ON DELETE CASCADE NOT NULL, status VARCHAR2(15) NOT NULL, PRIMARY KEY(projectId, user))').run();
    
    db.prepare('CREATE TABLE IF NOT EXISTS projectKeyWords(projectId INTEGER REFERENCES projects ON DELETE CASCADE NOT NULL, keyword VARCHAR2(15) NOT NULL, PRIMARY KEY(projectId, keyword))').run();
    
    db.prepare('CREATE TABLE IF NOT EXISTS projectCategories (projectId INTEGER REFERENCES projects ON DELETE CASCADE NOT NULL, category VARCHAR(20) NOT NULL, PRIMARY KEY(projectId, category))').run();
    
    db.prepare('CREATE TABLE IF NOT EXISTS projectEvents(projectId INTEGER REFERENCES projects ON DELETE CASCADE NOT NULL, title VARCHAR2(100) NOT NULL, description VARCHAR2(750) NOT NULL, creator VARCHAR2(30) REFERENCES users NOT NULL, date DATE NOT NULL, PRIMARY KEY(projectId, title))').run();

    usersHandler.createUser('admin@admin.fr', 'Administrator', 'AZERTY', 'administrator');
}



/***
 * 
 *          INTERNAL FUNCTIONS
 * 
 */

var exists = function (content, field, table) {
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

