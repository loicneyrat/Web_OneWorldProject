var sqlite = require('better-sqlite3');
var db = new sqlite('database.sqlite');


db.prepare('CREATE TABLE users (email VARCHAR2(30) PRIMARY KEY, username VARCHAR2(20) UNIQUE, password VARCHAR2(50)), status VARCHAR2(20)').run();

db.prepare('CREATE TABLE projects (projectId INTEGER(7) PRIMARY KEY, name VARCHAR2(60), description VARCHAR2(1000), creator VARCHAR2(30) REFERENCES users)').run();

db.prepare('CREATE TABLE projectMembers(projectId INTEGER(7) REFERENCES projects ON DELETE CASCADE, user VARCHAR2(30) REFERENCES users ON DELETE CASCADE, status VARCHAR2(15), PRIMARY KEY(projectId, user)').run();

db.prepare('CREATE TABLE projectKeyWords(projectId INTEGER(7) REFERENCES projects ON DELETE CASCADE, keyword VARCHAR2(15), PRIMARY KEY (projectId, keyword)').run();

db.prepare('CREATE TABLE projectEvents(projectId INTEGER(7) REFERENCES projects ON DELETE CASCADE, event VARCHAR2(500), PRIMARY KEY(projectId, event)').run();


exports.createUser = function(email, username, password, status) {
    let check = db.prepare('SELECT email, username FROM users WHERE email=? OR username=?').get([email, username]);
    if (check === undefined) {
        let insert = db.prepare('INSERT INTO users VALUES(?, ?, ?, ?');
        insert.run([email, username, password, status]);
        return true;
    }
    return false;
}

exports.updateUser = function(email, username, password, status) {
    let check = sqlCheck(email, users);
    if (check === false) return false;

    let update = db.prepare('UPDATE users SET username=?, password=?, status=? WHERE email=?');
    update.run([username, password, status, email]);
    return true;
}

exports.deleteUser = function(email) {
    let check = sqlCheck(email, users);
    if (check === false) return false;

    db.prepare('DELETE FROM users WHERE email=?').run([email]);
    return true;
}

exports.createProject = function(name, description, creator) {
    let projectId = db.prepare('SELECT count(projectId) FROM projects').get();
    let insert = db.prepare('INSERT INTO project VALUES (?, ?, ?, ?)');
    insert.run([projectId, name, description, creator]);
    return projectId;
}

exports.updateProject = function(projectId, name, description, creator) {
    let check = sqlCheck(projectId, projects);
    if (check === false) return false;

    let update = db.prepare('UPDATE projects SET name=?, description=?, creator=? WHERE projectId=?');
    update.run([name, description, creator, projectId]);
    return true;
}

exports.deleteProject = function(projectId) {
    let check = sqlCheck(projectId, projects);
    if (check === false) return false;

    db.prepare('DELETE FROM projects WHERE projectId=?').run([projectId]);
    return true;
}

exports.addMember = function(projectId, user, status) {
    let check = sqlCheck(projectId, projects);
    if (check === false) return false;
    
    check = db.prepare('SELECT * FROM projectMembers WHERE projectID=? AND user=?').get([projectId, user]);
    if (check !== undefined) return false;

    let insert = db.prepare('INSERT INTO projectMembers VALUES (?, ?, ?)');
    insert.run([projectId, user, status]);
    return true;
}

exports.updateMember = function(projectId, user, status) {
    let check = db.prepare('SELECT projectId, user FROM projectMembers WHERE projectId=? AND user=?').get([projectId, user]);
    if(check === undefined) return false;

    let update = db.prepare('UPDATE projectMembers SET user=?, status=? WHERE projectId=?');
    update.run([user, status, projectId]);
    return true;
}

exports.deleteMember = function(projectId, user) {
    let check = db.prepare('SELECT projectId, user FROM projectMembers WHERE projectId=? AND user=?').get([projectId, user]);
    if(check === undefined) return false;

    let query = db.prepare('DELETE FROM projectMembers WHERE projectId=? AND user=?');
    query.run([projectId, user]);
    return true;
}

exports.addKeyword = function(projectId, keyword) {
    let check = sqlCheck(projectId, projects);
    if (check === false) return false;
    
    check = db.prepare('SELECT * FROM projectKeywords WHERE projectID=? AND keyword=?').get([projectId, keyword]);
    if (check !== undefined) return false;


    let insert = db.prepare('INSERT INTO projectKeywords VALUES (?, ?)');
    insert.run([projectId, keyword]);
    return true;
}

exports.deleteKeyword = function(projectId, keyword) {
    let check = sqlCheck(projectId, projectKeywords);
    if (check === false) return false;

    db.prepare('DELETE FROM projectKeywords WHERE projectId=? AND keyword=?').run([projectId, keyword]);
    return true;
}

exports.addEvent = function(projectId, event) {
    let check = sqlCheck(projectId, projects);
    if (check === false) return false;

    check = db.prepare('SELECT * FROM projectEvents WHERE projectID=? AND event=?').get([projectId, event]);
    if (check !== undefined) return false;


    let insert = db.prepare('INSERT INTO projectEvents VALUES (?, ?)');
    insert.run([projectId, event]);
    return true;
}

exports.updateEvent = function(projectId, previousEvent, newEvent) {
    let check = db.prepare('SELECT * FROM projectEvents WHERE projectId=? AND event=?').get([projectId, previousEvent]);
    if (check === undefined) return false;

    let update = db.prepare('UPDATE projectEvents SET event=? WHERE projectId=? AND event=?');
    update.run([newEvent, projectId, previousEvent]);
    return true;
}

exports.deleteEvent = function(projectId, event) {
    let check = db.prepare('SELECT * FROM projectEvents WHERE projectId=? AND event=?').get([projectId, event]);
    if (check === undefined) return false;

    db.prepare('DELETE FROM projectEvents WHERE projectId=? AND event=?').run([projectId, event]);
    return true;
}

exports.resetDatabase = function() {
    db.prepare('DROP TABLE projectEvents').run();
    db.prepare('DROP TABLE projectKeywords').run();
    db.prepare('DROP TABLE projectMembers').run();
    db.prepare('DROP TABLE projects').run();
    db.prepare('DROP TABLE users').run();

    //creation of the clean tables.

    db.prepare('CREATE TABLE users (email VARCHAR2(30) PRIMARY KEY, username VARCHAR2(20) UNIQUE, password VARCHAR2(50)), status VARCHAR2(20)').run();

    db.prepare('CREATE TABLE projects (projectId INTEGER(7) PRIMARY KEY, name VARCHAR2(60), description VARCHAR2(1000), creator VARCHAR2(30) REFERENCES users)').run();

    db.prepare('CREATE TABLE projectMembers(projectId INTEGER(7) REFERENCES projects ON DELETE CASCADE, user VARCHAR2(30) REFERENCES users ON DELETE CASCADE, status VARCHAR2(15), PRIMARY KEY(projectId, user)').run();

    db.prepare('CREATE TABLE projectKeyWords(projectId INTEGER(7) REFERENCES projects ON DELETE CASCADE, keyword VARCHAR2(15), PRIMARY KEY (projectId, keyword)').run();

    db.prepare('CREATE TABLE projectEvents(projectId INTEGER(7) REFERENCES projects ON DELETE CASCADE, event VARCHAR2(500), PRIMARY KEY(projectId, event)').run();
}

var sqlCheck = function(parameter, table) {
    let check = db.prepare('SELECT ? FROM ${table} WHERE ?=?').get([parameter, parameter, parameter]);
    
    return check !== undefined ? true : false;
}
