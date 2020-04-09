var sqlite = require('better-sqlite3');
var db = new sqlite('database.sqlite');



exports.addMember = function(projectId, user, affiliation) {
    let insert = db.prepare('INSERT INTO projectLinkedUsers VALUES (?, ?, ?, ?)');
    let result = insert.run([projectId, user, "regular", affiliation]);
    return result.changes === 1;
}

exports.updateMemberStatus = function(projectId, user, status) {
    let check = db.prepare('SELECT projectId, user FROM projectLinkedUsers WHERE projectId=? AND user=?').get([projectId, user]);
    if(check === undefined) return false;
    let update = db.prepare('UPDATE projectLinkedUsers SET status=? WHERE projectId=?');
    let result = update.run([status, projectId]);
    return result.changes === 1;
}

exports.removeMember = function(projectId, user) {
    let query = db.prepare('DELETE FROM projectLinkedUsers WHERE projectId=? AND user=?');
    let result = query.run([projectId, user]);
    return result.changes === 1;
}

exports.getMembers = function(projectId) {
    let query = db.prepare('SELECT U.username, P.status, P.affiliation FROM projectLinkedUsers P, users U WHERE P.user = U.email AND projectId=? ORDER BY username');
    let result = query.all([projectId]);
    return result;
}