
exports.addKeyword = function(projectId, keyword) {
    let check = sqlCheck(projectId, projects);
    if (check === false) return false;
    
    check = db.prepare('SELECT * FROM projectKeywords WHERE projectID=? AND keyword=?').get([projectId, keyword]);
    if (check !== undefined) return false;


    let insert = db.prepare('INSERT INTO projectKeywords VALUES (?, ?)');
    let result = insert.run([projectId, keyword]).changes;
    return result === 1;
}

exports.removeKeyword = function(projectId, keyword) {
    let check = sqlCheck(projectId, projectKeywords);
    if (check === false) return false;

    let result = db.prepare('DELETE FROM projectKeywords WHERE projectId=? AND keyword=?').run([projectId, keyword]).changes;
    return result === 1;
}