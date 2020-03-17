var sqlite = require('better-sqlite3');
var db = new sqlite('database.sqlite');

db.prepare('CREATE TABLE users (email VARCHAR2(30) PRIMARY KEY, username VARCHAR2(20) UNIQUE, password VARCHAR2(50), status VARCHAR2(20))').run();

db.prepare('CREATE TABLE projects (projectId INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR2(60), description VARCHAR2(1000), creator VARCHAR2(30) REFERENCES users)').run();

db.prepare('CREATE TABLE projectMembers(projectId INTEGER REFERENCES projects ON DELETE CASCADE, user VARCHAR2(30) REFERENCES users ON DELETE CASCADE, status VARCHAR2(15), PRIMARY KEY(projectId, user))').run();

db.prepare('CREATE TABLE projectKeyWords(projectId INTEGER REFERENCES projects ON DELETE CASCADE, keyword VARCHAR2(15), PRIMARY KEY(projectId, keyword))').run();

db.prepare('CREATE TABLE projectEvents(projectId INTEGER REFERENCES projects ON DELETE CASCADE, event VARCHAR2(500), PRIMARY KEY(projectId, event))').run();


exports.createUser = function(email, username, password, status) {
    let check = db.prepare('SELECT email, username FROM users WHERE email=? OR username=?').get([email, username]);
    if (check === undefined) {
        let insert = db.prepare('INSERT INTO users VALUES(?, ?, ?, ?)');
        insert.run([email, username, password, status]);
        return true;
    }
    return false;
}

exports.updateUser = function(email, username, password, status) {
    let check = sqlCheck(email, users);
    if (check == false) return false;

    let update = db.prepare('UPDATE users SET username=?, password=?, status=? WHERE email=?');
    update.run([username, password, status, email]);
    return true;
}

exports.deleteUser = function(email) {
    let check = sqlCheck(email, users);
    if (check == false) return false;

    db.prepare('DELETE FROM users WHERE email=?').run([email]);
    return true;
}

exports.createProject = function(title, description, creator) {
    let insert = db.prepare('INSERT INTO projects VALUES (?, ?, ?, ?)');
    let projectId = insert.run([projectId, title, description, creator]).lastInsertRowId;
    return projectId;
}

exports.updateProject = function(projectId, title, description, creator) {
    let check = sqlCheck(projectId, projects);
    if (check == false) return false;

    let update = db.prepare('UPDATE projects SET title=?, description=?, creator=? WHERE projectId=?');
    let result = update.run([title, description, creator, projectId]).changes;
    return result == 1;
}

exports.deleteProject = function(projectId) {
    let check = sqlCheck(projectId, projects);
    if (check == false) return false;

    let result = db.prepare('DELETE FROM projects WHERE projectId=?').run([projectId]).changes;
    return result == 1;
}

exports.addMember = function(projectId, user, status) {
    let check = sqlCheck(projectId, projects);
    if (check == false) return false;
    
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
    let result = update.run([user, status, projectId]).changes;
    return result == 1;
}

exports.deleteMember = function(projectId, user) {
    let check = db.prepare('SELECT projectId, user FROM projectMembers WHERE projectId=? AND user=?').get([projectId, user]);
    if(check === undefined) return false;

    let query = db.prepare('DELETE FROM projectMembers WHERE projectId=? AND user=?');
    let result = query.run([projectId, user]).changes;
    return result == 1;
}

exports.addKeyword = function(projectId, keyword) {
    let check = sqlCheck(projectId, projects);
    if (check == false) return false;
    
    check = db.prepare('SELECT * FROM projectKeywords WHERE projectID=? AND keyword=?').get([projectId, keyword]);
    if (check !== undefined) return false;


    let insert = db.prepare('INSERT INTO projectKeywords VALUES (?, ?)');
    insert.run([projectId, keyword]);
    return true;
}

exports.deleteKeyword = function(projectId, keyword) {
    let check = sqlCheck(projectId, projectKeywords);
    if (check == false) return false;

    let result = db.prepare('DELETE FROM projectKeywords WHERE projectId=? AND keyword=?').run([projectId, keyword]).changes;
    return result == 1;
}

exports.addEvent = function(projectId, event) {
    let check = sqlCheck(projectId, projects);
    if (check == false) return false;

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
    let result = update.run([newEvent, projectId, previousEvent]).changes;
    return result == 1;
}

exports.deleteEvent = function(projectId, event) {
    let check = db.prepare('SELECT * FROM projectEvents WHERE projectId=? AND event=?').get([projectId, event]);
    if (check === undefined) return false;

    let toDelete = db.prepare('DELETE FROM projectEvents WHERE projectId=? AND event=?');
    let result = toDelete.run([projectId, event]).changes;
    return result == 1;
}

exports.resetDatabase = function() {
    db.prepare('DROP TABLE projectEvents').run();
    db.prepare('DROP TABLE projectKeywords').run();
    db.prepare('DROP TABLE projectMembers').run();
    db.prepare('DROP TABLE projects').run();
    db.prepare('DROP TABLE users').run();

    //creation of the clean tables.

    db.prepare('CREATE TABLE users (email VARCHAR2(30) PRIMARY KEY, username VARCHAR2(20) UNIQUE, password VARCHAR2(50)), status VARCHAR2(20)').run();

    db.prepare('CREATE TABLE projects (projectId INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR2(60), description VARCHAR2(1000), creator VARCHAR2(30) REFERENCES users)').run();

    db.prepare('CREATE TABLE projectMembers(projectId INTEGER REFERENCES projects ON DELETE CASCADE, user VARCHAR2(30) REFERENCES users ON DELETE CASCADE, status VARCHAR2(15), PRIMARY KEY(projectId, user))').run();

    db.prepare('CREATE TABLE projectKeyWords(projectId INTEGER REFERENCES projects ON DELETE CASCADE, keyword VARCHAR2(15), PRIMARY KEY(projectId, keyword))').run();

    db.prepare('CREATE TABLE projectEvents(projectId INTEGER REFERENCES projects ON DELETE CASCADE, event VARCHAR2(500), PRIMARY KEY(projectId, event))').run();
}

var sqlCheck = function(parameter, table) {
    let check = db.prepare(`SELECT ? FROM ${table} WHERE ?=?`).get([parameter, parameter, parameter]);
    return check !== undefined;
}
