var sqlite = require('better-sqlite3');
var db = new sqlite('database.sqlite');



exports.addMember = function(projectId, user) {
    let insert = db.prepare('INSERT INTO projectLinkedUsers (projectId, user, status) VALUES (?, ?, ?)');
    let result = insert.run([projectId, user, "member"]);
    return result.changes === 1;
}

exports.updateMemberStatus = function(projectId, user, status) {
    let check = db.prepare('SELECT projectId, user FROM projectLinkedUsers WHERE projectId=? AND user=?').get([projectId, user]);
    if(check === undefined) return false;
    let update = db.prepare('UPDATE projectLinkedUsers SET status=? WHERE projectId=? AND user=?');
    let result = update.run([status, projectId, user]);
    return result.changes === 1;
}

exports.removeMember = function(projectId, user) {
    let query = db.prepare('DELETE FROM projectLinkedUsers WHERE projectId=? AND user=?');
    let result = query.run([projectId, user]);
    return result.changes === 1;
}

exports.getMembers = function(projectId) {
    let query = db.prepare('SELECT U.username, P.status FROM projectLinkedUsers P, users U WHERE P.user = U.email AND projectId=? ORDER BY username');
    return query.all([projectId]);
}

exports.isMember = function(user, projectId){
    let query = db.prepare('SELECT status FROM projectLinkedUsers WHERE projectId=? AND user=?').get([projectId, user]);
    return query !== undefined && (query.status === "member" || query.status === "moderator");
}


exports.getUserProjectStatus = function(userEmail, projectId) {
    let query = db.prepare('SELECT status FROM projectLinkedUsers WHERE user=? AND projectId=?');
    return query.get([userEmail, projectId]).status;
}

exports.getNumberOfMembers = function(projectId) {
    let query = db.prepare('SELECT count(DISTINCT user) count FROM projectLinkedUsers WHERE projectId=?');
    return query.get([projectId]).count;
}
