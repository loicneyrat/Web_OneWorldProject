var sqlite = require('better-sqlite3');
var db = new sqlite('database.sqlite');



exports.addEvent = function(projectId, event, date) {
    
    if(eventAlreadyExist(projectId, event, date)) return false;

    let insert = db.prepare('INSERT INTO projectEvents VALUES (?, ?, ?)');
    let result = insert.run([projectId, event, date]);
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


exports.removeEvent = function(projectId, event) {
    
    let toDelete = db.prepare('DELETE FROM projectEvents WHERE projectId=? AND event=?');
    let result = toDelete.run([projectId, event]);
    return result.changes === 1;
}


function eventAlreadyExist(projectId, event, date) {
    let check = db.prepare('SELECT * FROM projectEvents WHERE projectID=? AND event=? AND date=?').get([projectId, event, date]);
    return check !== undefined;
}
