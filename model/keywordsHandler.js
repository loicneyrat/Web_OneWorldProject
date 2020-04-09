var sqlite = require('better-sqlite3');
var db = new sqlite('database.sqlite');


exports.addKeyword = function(projectId, keyword) {
    if(isAlreadyPresent(projectId, keyword)) return false;
    let insert = db.prepare('INSERT INTO projectKeywords VALUES (?, ?)');
    let result = insert.run([projectId, keyword]);
    return result.changes === 1;
}

exports.removeAllKeywords = function(projectId) {
    let numberOfKeywords = db.prepare('SELECT count(keyword) FROM projectKeywords WHERE projectId=?').get([projectId]);
    let result = db.prepare('DELETE FROM projectKeywords WHERE projectID=?').run({projectId});
    return result.changes === numberOfKeywords;
}

function isAlreadyPresent(projectId, keyword) {
    let check = db.prepare('SELECT keyword FROM projectKeywords WHERE projectId=? AND keyword=?').get([projectId, keyword]);
    return check !== undefined;
}