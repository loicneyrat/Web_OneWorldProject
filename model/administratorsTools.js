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