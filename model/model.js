var sqlite = require('better-sqlite3');
var db = new sqlite('database.sqlite');


db.prepare('CREATE TABLE IF NOT EXISTS users (email VARCHAR2(30) PRIMARY KEY, username VARCHAR2(20) UNIQUE, password VARCHAR2(50), status VARCHAR2(20))').run();

db.prepare('CREATE TABLE IF NOT EXISTS projects (projectId INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR2(60), description VARCHAR2(1000), creator VARCHAR2(30) REFERENCES users, date DATE)').run();

db.prepare('CREATE TABLE IF NOT EXISTS projectMembers(projectId INTEGER REFERENCES projects ON DELETE CASCADE, user VARCHAR2(30) REFERENCES users ON DELETE CASCADE, status VARCHAR2(15), PRIMARY KEY(projectId, user))').run();

db.prepare('CREATE TABLE IF NOT EXISTS projectKeyWords(projectId INTEGER REFERENCES projects ON DELETE CASCADE, keyword VARCHAR2(15), PRIMARY KEY(projectId, keyword))').run();

db.prepare('CREATE TABLE IF NOT EXISTS projectCategories (projectId INTEGER REFERENCES projects, category VARCHAR(20), PRIMARY KEY(projectId, category))').run();

db.prepare('CREATE TABLE IF NOT EXISTS projectEvents(projectId INTEGER REFERENCES projects ON DELETE CASCADE, event VARCHAR2(500), date DATE, PRIMARY KEY(projectId, event))').run();


/***
 * 
 *          FOR A USER
 * 
 */
exports.createUser = function(email, username, password, status) {
    let check = db.prepare('SELECT email, username FROM users WHERE email=? OR username=?').get([email, username]);
    if (check === undefined) {
        let insert = db.prepare('INSERT INTO users VALUES(?, ?, ?, ?)');
        let result = insert.run([email, username, password, status]).changes;
        return result == 1;
    }
    return false;
}

exports.updateUserCredentials = function(email, username, password) {
    let check = sqlCheck(email, users);
    if (check == false) return false;

    let update = db.prepare('UPDATE users SET username=?, password=? WHERE email=?');
    let result = update.run([username, password, email]).changes;
    return result == 1;
}


exports.deleteUser = function(email) {
    let check = sqlCheck(email, users);
    if (check == false) return false;

    let query = db.prepare('DELETE FROM users WHERE email=?');
    let result = query.run([email]).changes;
    return result == 1;
}


//TODO modifier la function pour associer un tableau de catégories au résultat. 
exports.getProjects = function(username) {
    let query = db.prepare('SELECT P.title, P.creator FROM Projects P, Users U WHERE P.creator=U.email AND U.username=?');
    let projectsList = query.all([username]);

    for (let i = 0; i < projectsList.length ; i++) {
        projectsList[i][status] = creator;
    }

    query = db.prepare('SELECT P.title, P.creator, P.category, M.status FROM Projects P, ProjectMembers M, Users U WHERE P.projectId = M.projectId AND U.email = M.user AND U.username=?');
    let projectsFollowed = query.all([username]);

    for (let i = 0; i < projectsFollowed.length ; i++) {
        projectsList.push(projectsFollowed[i]);
    }

    return projectsList;
}


/***
 * 
 *          TO LOGIN AND SIGNIN
 * 
 */

 exports.login = function(email, userpassword) {
     let query = db.prepare('SELECT password FROM users WHERE email=?');
     let result = query.get([email]);
     return result !== undefined && userpassword == result[password];
 }

 exports.credentialsAreFree = function(email, username) {
     let query = db.prepare('SELECT email FROM Users WHERE email=?');
     if (query.get([email]) !== undefined) return -1;

     query = db.prepare('SELECT username FROM Users WHERE username=?');
     if(query.get([username] !== undefined)) return -2;
     
     return 1;
 }


/***
 * 
 *          FOR THE ADMINISTRATORS
 * 
 */

exports.updateUserStatus = function (email, status) {
    let check = sqlCheck(email, users);
    if (check == false) return false;

    let update = db.prepare('UPDATE users SET status=? WHERE email=?');
    let result = update.run([status, email]).changes;
    return result == 1;
}

exports.getUsersList = function() {
    let query = db.prepare('SELECT username, status FROM Users ORDER BY username');
    return query.all();
}


/***
 * 
 *          FOR THE PROJECTS
 * 
 */


exports.createProject = function(title, description, categories, creator, date, keywords) {
    let insert = db.prepare('INSERT INTO projects VALUES (?, ?, ?, ?)');
    let projectId = insert.run([title, description, creator, date]).lastInsertRowId;

    //remove all duplicates from the array.
    keywords.filter((item, index) => keywords.indexOf(item) === index);
    for(let i = 0 ; i < keywords.length ; i++) {
        addKeyword(projectId, keywords[i]);
    }

    categories.filter((item, index) => categories.indexOf(item) === index);
    for(let i = 0 ; i < categories.length ; i++) {
        addCategory(projectId, categories[i]);
    }

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

/***
 * 
 *          FOR THE PROJECT MEMBERS
 * 
 */

exports.addMember = function(projectId, user, status) {
    let check = sqlCheck(projectId, projects);
    if (check == false) return false;
    
    check = db.prepare('SELECT * FROM projectMembers WHERE projectID=? AND user=?').get([projectId, user]);
    if (check !== undefined) return false;

    let insert = db.prepare('INSERT INTO projectMembers VALUES (?, ?, ?)');
    let result = insert.run([projectId, user, status]).changes;
    return result == 1;
}

exports.updateMemberStatus = function(projectId, user, status) {
    let check = db.prepare('SELECT projectId, user FROM projectMembers WHERE projectId=? AND user=?').get([projectId, user]);
    if(check === undefined) return false;

    let update = db.prepare('UPDATE projectMembers SET status=? WHERE projectId=?');
    let result = update.run([status, projectId]).changes;
    return result == 1;
}

exports.removeMember = function(projectId, user) {
    let check = db.prepare('SELECT projectId, user FROM projectMembers WHERE projectId=? AND user=?').get([projectId, user]);
    if(check === undefined) return false;

    let query = db.prepare('DELETE FROM projectMembers WHERE projectId=? AND user=?');
    let result = query.run([projectId, user]).changes;
    return result == 1;
}

exports.getMembers = function(projectId) {
    let query = db.prepare('SELECT U.username, P.status FROM projectMembers P, users U WHERE P.user = U.email AND projectId=? ORDER BY username');
    let result = query.all([projectId]);

    return result;
}

/***
 * 
 *          FOR THE KEYWORDS
 * 
 */

exports.addKeyword = function(projectId, keyword) {
    let check = sqlCheck(projectId, projects);
    if (check == false) return false;
    
    check = db.prepare('SELECT * FROM projectKeywords WHERE projectID=? AND keyword=?').get([projectId, keyword]);
    if (check !== undefined) return false;


    let insert = db.prepare('INSERT INTO projectKeywords VALUES (?, ?)');
    let result = insert.run([projectId, keyword]).changes;
    return result == 1;
}

exports.removeKeyword = function(projectId, keyword) {
    let check = sqlCheck(projectId, projectKeywords);
    if (check == false) return false;

    let result = db.prepare('DELETE FROM projectKeywords WHERE projectId=? AND keyword=?').run([projectId, keyword]).changes;
    return result == 1;
}

/***
 * 
 *          FOR THE EVENTS
 * 
 */

exports.addEvent = function(projectId, event, date) {
    let check = sqlCheck(projectId, projects);
    if (check == false) return false;

    check = db.prepare('SELECT * FROM projectEvents WHERE projectID=? AND event=?').get([projectId, event]);
    if (check !== undefined) return false;


    let insert = db.prepare('INSERT INTO projectEvents VALUES (?, ?, ?)');
    let result = insert.run([projectId, event, date]).changes;
    return result == 1;
}

exports.updateEvent = function(projectId, previousEvent, newEvent) {
    let check = db.prepare('SELECT * FROM projectEvents WHERE projectId=? AND event=?').get([projectId, previousEvent]);
    if (check === undefined) return false;

    let update = db.prepare('UPDATE projectEvents SET event=? WHERE projectId=? AND event=?');
    let result = update.run([newEvent, projectId, previousEvent]).changes;
    return result == 1;
}

exports.removeEvent = function(projectId, event) {
    let check = db.prepare('SELECT * FROM projectEvents WHERE projectId=? AND event=?').get([projectId, event]);
    if (check === undefined) return false;

    let toDelete = db.prepare('DELETE FROM projectEvents WHERE projectId=? AND event=?');
    let result = toDelete.run([projectId, event]).changes;
    return result == 1;
}


/***
 * 
 *          FOR THE CATEGORIES
 * 
 */

 exports.addCategory = function(projectId, category) {
    let check = sqlCheck(projectId, projects);
    if (check === undefined) return false;

    check = db.prepare('SELECT * FROM projectCategories WHERE projectID=? AND category=?').get([projectId, category]);
    if (check !== undefined) return false;


    let insert = db.prepare('INSERT INTO projectCategories VALUES (?, ?)');
    let result = insert.run([projectId, category]).changes;
    return result == 1;
 }

 exports.removeCategory = function(projectId, category) {
    let check = sqlCheck(projectId, projects);
    if (check === undefined) return false;

    let result = db.prepare('DELETE FROM projectKeywords WHERE projectId=? AND category=?').run([projectId, category]).changes;
    return result == 1;
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
}



/***
 * 
 *          INTERNAL FUNCTIONS
 * 
 */

var sqlCheck = function(parameter, table) {
    let check = db.prepare(`SELECT ? FROM ${table} WHERE ?=?`).get([parameter, parameter, parameter]);
    return check !== undefined;
}
