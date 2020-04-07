var sqlite = require('better-sqlite3');
var db = new sqlite('database.sqlite');



exports.addMember = function(projectId, user, status) {
    let insert = db.prepare('INSERT INTO projectMembers VALUES (?, ?, ?)');
    let result = insert.run([projectId, user, status]);
    return result.changes === 1;
}

exports.updateMemberStatus = function(projectId, user, status) {
    let check = db.prepare('SELECT projectId, user FROM projectMembers WHERE projectId=? AND user=?').get([projectId, user]);
    if(check === undefined) return false;
    let update = db.prepare('UPDATE projectMembers SET status=? WHERE projectId=?');
    let result = update.run([status, projectId]);
    return result.changes === 1;
}

exports.removeMember = function(projectId, user) {
    let query = db.prepare('DELETE FROM projectMembers WHERE projectId=? AND user=?');
    let result = query.run([projectId, user]);
    return result.changes === 1;
}

exports.getMembers = function(projectId) {
    let query = db.prepare('SELECT U.username, P.status FROM projectMembers P, users U WHERE P.user = U.email AND projectId=? ORDER BY username');
    let result = query.all([projectId]);
    return result;
}