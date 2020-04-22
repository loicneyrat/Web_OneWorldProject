var sqlite = require('better-sqlite3');
var db = new sqlite('database.sqlite');



exports.addEvent = function(projectId, title, description, creator, date) {
    let insert = db.prepare('INSERT INTO projectEvents (projectId, title, description, creator, date) VALUES (?, ?, ?, ?, ?)');
    let result = insert.run([projectId, title, description, creator, date]);
    return result.changes === 1;
}


exports.updateEvent = function(projectId, previousTitle, newTitle, description, dateOfEvent) {
    let update = db.prepare('UPDATE projectEvents SET title= ?, description=?, date=? WHERE projectId=? AND title=?');
    let result = update.run([newTitle, description, dateOfEvent, projectId, previousTitle]);
    return result.changes === 1;
}

exports.removeEvent = function(projectId, title) {
    let toDelete = db.prepare('DELETE FROM projectEvents WHERE projectId=? AND title=?');
    let result = toDelete.run([projectId, title]);
    return result.changes === 1;
}

exports.getEventDetails = function(projectId, title) {
    let query = db.prepare("SELECT * FROM projectEvents WHERE projectId=? AND title=?");
    return query.get([projectId, title]);
}

exports.getCreator = function(projectId, title) {
    let query = db.prepare("SELECT creator FROM projectEvents WHERE projectId=? AND title=?");
    return query.get([projectId, title]);
}
