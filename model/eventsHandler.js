var sqlite = require('better-sqlite3');
var db = new sqlite('database.sqlite');



exports.addEvent = function(projectId, title, event, creator, date) {
    if (eventAlreadyExist(projectId, event, date, creator)) return false;
    let insert = db.prepare('INSERT INTO projectEvents (projectId, title, event, creator, date) VALUES (?, ?, ?, ?, ?)');
    let result = insert.run([projectId, title, event, creator, date]);
    return result.changes === 1;
}


exports.updateEvent = function(projectId, previousEvent, newEvent) {
    let update = db.prepare('UPDATE projectEvents SET event=? WHERE projectId=? AND event=?');
    let result = update.run([newEvent, projectId, previousEvent]);
    return result.changes === 1;
}

exports.changeEventDate = function(projectIdConcerned, eventToChange, newDate) {
    let query = db.prepare('UPDATE projectEvents SET date=? WHERE projectId=? AND event=?');
    let result = udpate.run([newDate, projectIdConcerned, eventToChange]);
    return result.changes === 1;
}


exports.removeEvent = function(projectId, event, creator) {
    let toDelete = db.prepare('DELETE FROM projectEvents WHERE projectId=? AND event=? AND creator=?');
    let result = toDelete.run([projectId, event, creator]);
    return result.changes === 1;
}


function eventAlreadyExist(projectId, event, date, creator) {
    let check = db.prepare('SELECT * FROM projectEvents WHERE projectId=? AND event=? AND date=? AND creator=?').get([projectId, event, date, creator]);
    return check !== undefined;
}
