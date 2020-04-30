var sqlite = require('better-sqlite3');
var db = new sqlite('database.sqlite');


exports.updateUserStatus = function (email, status) {
    let update = db.prepare('UPDATE users SET status=? WHERE email=?');
    let result = update.run([status, email]);
    return result.changes === 1;
}

exports.getUsersList = function() {
    let query = db.prepare('SELECT username, status FROM Users ORDER BY username');
    let result = query.all();
    for (let i = 0; i < result.length; i++) {
        result[i].isAdmin = result[i].status === "administrator";
    }
    return result;
}