exports.createProject = function(title, description, categories, creator, date, keywords) {
    let insert = db.prepare('INSERT INTO projects VALUES (?, ?, ?, ?)');
    let projectId = insert.run([title, description, creator, date]).lastInsertRowId;

    //remove all duplicates from the array.
    keywords.filter((item, index) => keywords.indexOf(item) === index);
    for(let i = 0 ; i < keywords.length ; i++) {
        addKeyword(projectId, keywords[i]);
    }

    categories.filter((item, index) => categories.indexOf(item) === index);
    for(let i = 0 ; i < categories.length ; i++) {
        addCategory(projectId, categories[i]);
    }

    return projectId;
}

exports.updateProject = function(projectId, title, description, creator) {
    let check = sqlCheck(projectId, projects);
    if (check === false) return false;

    let update = db.prepare('UPDATE projects SET title=?, description=?, creator=? WHERE projectId=?');
    let result = update.run([title, description, creator, projectId]).changes;
    return result === 1;
}

exports.deleteProject = function(projectId) {
    let check = sqlCheck(projectId, projects);
    if (check === false) return false;

    let result = db.prepare('DELETE FROM projects WHERE projectId=?').run([projectId]).changes;
    return result === 1;
}

/***
 * 
 *          FOR THE PROJECT MEMBERS
 * 
 */

exports.addMember = function(projectId, user, status) {
    let check = sqlCheck(projectId, projects);
    if (check === false) return false;
    
    check = db.prepare('SELECT * FROM projectMembers WHERE projectID=? AND user=?').get([projectId, user]);
    if (check !== undefined) return false;

    let insert = db.prepare('INSERT INTO projectMembers VALUES (?, ?, ?)');
    let result = insert.run([projectId, user, status]).changes;
    return result === 1;
}

exports.updateMemberStatus = function(projectId, user, status) {
    let check = db.prepare('SELECT projectId, user FROM projectMembers WHERE projectId=? AND user=?').get([projectId, user]);
    if(check === undefined) return false;

    let update = db.prepare('UPDATE projectMembers SET status=? WHERE projectId=?');
    let result = update.run([status, projectId]).changes;
    return result === 1;
}

exports.removeMember = function(projectId, user) {
    let check = db.prepare('SELECT projectId, user FROM projectMembers WHERE projectId=? AND user=?').get([projectId, user]);
    if(check === undefined) return false;

    let query = db.prepare('DELETE FROM projectMembers WHERE projectId=? AND user=?');
    let result = query.run([projectId, user]).changes;
    return result === 1;
}

exports.getMembers = function(projectId) {
    let query = db.prepare('SELECT U.username, P.status FROM projectMembers P, users U WHERE P.user = U.email AND projectId=? ORDER BY username');
    let result = query.all([projectId]);
    return result;
}
