exports.addEvent = function(projectId, event, date) {
    let check = sqlCheck(projectId, projects);
    if (check === false) return false;

    check = db.prepare('SELECT * FROM projectEvents WHERE projectID=? AND event=?').get([projectId, event]);
    if (check !== undefined) return false;


    let insert = db.prepare('INSERT INTO projectEvents VALUES (?, ?, ?)');
    let result = insert.run([projectId, event, date]).changes;
    return result === 1;
}

exports.updateEvent = function(projectId, previousEvent, newEvent) {
    let check = db.prepare('SELECT * FROM projectEvents WHERE projectId=? AND event=?').get([projectId, previousEvent]);
    if (check === undefined) return false;

    let update = db.prepare('UPDATE projectEvents SET event=? WHERE projectId=? AND event=?');
    let result = update.run([newEvent, projectId, previousEvent]).changes;
    return result === 1;
}

exports.removeEvent = function(projectId, event) {
    let check = db.prepare('SELECT * FROM projectEvents WHERE projectId=? AND event=?').get([projectId, event]);
    if (check === undefined) return false;

    let toDelete = db.prepare('DELETE FROM projectEvents WHERE projectId=? AND event=?');
    let result = toDelete.run([projectId, event]).changes;
    return result === 1;
}
