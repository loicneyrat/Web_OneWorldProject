function createUser(email, username, password, status) {
    let insert = db.prepare('INSERT INTO users VALUES(?, ?, ?, ?)');
    let result = insert.run([email, username, password, status]);
    return result.changes == 1;
}

exports.updateUserPassword = function(email, password) {
    let update = db.prepare('UPDATE users SET password=? WHERE email=?');
    let result = update.run([password, email]);
    return result.changes == 1;
}

exports.updateUserUsername = function(email, username) {
    let update = db.prepare('UPDATE users SET username=? WHERE email=?');
    let result = update.run([username, email]);
    return result.changes == 1;
}


exports.deleteUser = function(email) {
    let query = db.prepare('DELETE FROM users WHERE email=?');
    let result = query.run([email]);
    return result.changes == 1;
}

exports.getUserStatus = function(email) {
    let query = db.prepare('SELECT status FROM users WHERE email=?');
    return db.get([email]).status;
}

exports.getUserId = function(username) {
    let query = db.prepare('SELECT email FROM users WHERE username=?');
    let result = query.get([username]);
    return result.email;
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