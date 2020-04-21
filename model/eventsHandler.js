var sqlite = require('better-sqlite3');
var db = new sqlite('database.sqlite');



exports.addEvent = function(projectId, title, event, creator, date) {
    let insert = db.prepare('INSERT INTO projectEvents (projectId, title, event, creator, date) VALUES (?, ?, ?, ?, ?)');
    let result = insert.run([projectId, title, event, creator, date]);
    return result.changes === 1;
}


exports.updateEvent = function(projectId, previousTitle, newTitle, event, dateOfEvent) {
    let update = db.prepare('UPDATE projectEvents SET title= ?, event=?, date=? WHERE projectId=? AND title=?');
    let result = update.run([newTitle, event, dateOfEvent, projectId, previousTitle]);
    return result.changes === 1;
}

exports.removeEvent = function(projectId, title) {
    let toDelete = db.prepare('DELETE FROM projectEvents WHERE projectId=? AND title=?');
    let result = toDelete.run([projectId, title]);
    return result.changes === 1;
}
