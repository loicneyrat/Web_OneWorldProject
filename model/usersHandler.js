exports.createUser = function(email, username, password, status) {
    let check = db.prepare('SELECT email, username FROM users WHERE email=? OR username=?').get([email, username]);
    if (check === undefined) {
        let insert = db.prepare('INSERT INTO users VALUES(?, ?, ?, ?)');
        let result = insert.run([email, username, password, status]).changes;
        return result == 1;
    }
    return false;
}

exports.updateUserPassword = function(email, password) {
    let update = db.prepare('UPDATE users SET password=? WHERE email=?');
    let result = update.run([password, email]).changes;
    return result == 1;
}

exports.updateUserUsername = function(email, username) {

    let update = db.prepare('UPDATE users SET username=? WHERE email=?');
    let result = update.run([username, email]).changes;
    return result == 1;
}


exports.deleteUser = function(email) {
    let check = sqlCheck(email, users);
    if (check == false) return false;

    let query = db.prepare('DELETE FROM users WHERE email=?');
    let result = query.run([email]).changes;
    return result == 1;
}

exports.getUserStatus = function(email) {
    let check = sqlCheck(email, users);
    if (check == false) return null;

    let query = db.prepare('SELECT status FROM users WHERE email=?');
    return db.get([email]).status;
}

exports.getUserId = function(username) {
    let query = db.prepare('SELECT email FROM users WHERE username=?');
    let result = query.get([username]).email;
    return result;
}

exports.getUserPassword = function(email) {
    let query = db.prepare('SELECT password FROM Users WHERE email=?');
    return query.get([email]).password;
}

exports.login = function(email, userpassword) {
    let query = db.prepare('SELECT password FROM users WHERE email=?');
    let result = query.get([email]);
    return result !== undefined && result.password === userpassword;
}

exports.credentialsAreFree = function(email, username) {
    let query = db.prepare('SELECT email FROM Users WHERE email=?');
    if (query.get([email]) !== undefined) return -1;
    query = db.prepare('SELECT username FROM Users WHERE username=?');
    if (query.get([username]) !== undefined) return -2;
    return 1;
}