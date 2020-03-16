var sqlite = require('better-sqlite3');
var db = new sqlite('database.sqlite');

db.prepare('DROP TABLE users').run();
db.prepare('DROP TABLE projects').run();
//db.prepare('DROP TABLE projectMembers').run();
//db.prepare('DROP TABLE projectKeyWords').run();
//db.prepare('DROP TABLE projectEvents').run();


db.prepare('CREATE TABLE users (email VARCHAR2(30) PRIMARY KEY, username VARCHAR2(20) UNIQUE, password VARCHAR2(50), status VARCHAR2(20))').run();
// AUTOINCREMENT added for projectId in projects ? Need to change type for INTEGER instead of INTEGER(7)
db.prepare('CREATE TABLE projects (projectId INTEGER(7) PRIMARY KEY, name VARCHAR2(60), description VARCHAR2(1000), creator VARCHAR2(30) REFERENCES users)').run();

// Execution error for these query : incomplete input
//db.prepare('CREATE TABLE projectMembers (projectId INTEGER(7) REFERENCES projects, user VARCHAR2(30) REFERENCES users, status VARCHAR2(15), PRIMARY KEY (projectId, user)').run();
//db.prepare('CREATE TABLE projectKeyWords (projectId INTEGER(7) REFERENCES projects, keyword VARCHAR2(15), PRIMARY KEY (projectId, keyword)').run();
//db.prepare('CREATE TABLE projectEvents (projectId INTEGER(7) REFERENCES projects, event VARCHAR2(500), PRIMARY KEY (projectId, event)').run();

exports.createUser = function(email, username, password, status) {
    let check = db.prepare('SELECT email, username FROM users WHERE email=? OR username=?').get([email, username]);
    if (check === undefined) {
        let insert = db.prepare('INSERT INTO users VALUES (?, ?, ?, ?)');
        insert.run([email, username, password, status]);
        return true;
    }
    return false;
}

exports.updateUser = function(email, username, password, status) {
    let update = db.prepare('UPDATE users SET username=?, password=?, status=? WHERE email=?');
    update.run([username, password, status, email]);
}


exports.createProject = function(name, description, creator) {
    let projectId = db.prepare('SELECT count(projectId) FROM projects').get();
    let insert = db.prepare('INSERT INTO project VALUES (?, ?, ?, ?)');
    insert.run([projectId, name, description, creator]);
    return projectId;
}


/**
 * Another version that take into account the autoincrement of the projectId attribute.
 *//*
exports.createProject = function(name, description, creator) {
    let insert = db.prepare('INSERT INTO users VALUES (?, ?, ?)');
    let insertedProjectId = insert.run([name, description, creator]).lastInsertRowid;
    return insertedProjectId;
}
*/



/**
 * 2 last lines changed to know if the table is updated successfully.
 */
exports.updateProject = function(projectId, name, description, creator) {
    let check = db.prepare('SELECT projectId FROM projects WHERE projectId=?');
    let test = check.get([projectId]);
    if (test === undefined) return false;

    let update = db.prepare('UPDATE projects SET name=?, description=?, creator=? WHERE projectId=?');
    let result = update.run([name, description, creator, projectId]).changes;
    return result == 1;
}
