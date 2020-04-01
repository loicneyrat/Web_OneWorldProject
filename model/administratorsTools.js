exports.updateUserStatus = function (email, status) {
    let update = db.prepare('UPDATE users SET status=? WHERE email=?');
    let result = update.run([status, email]);
    return result.changes === 1;
}

exports.getUsersList = function() {
    let query = db.prepare('SELECT username, status FROM Users ORDER BY username');
    return query.all();
}