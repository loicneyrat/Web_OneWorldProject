var sqlite = require('better-sqlite3');
var db = new sqlite('database.sqlite');

exports.createProject = function(title, description, categories, creator, date, keywords) {
    //Check qu'il n'existe pas de lignes dans la base comportant tout ces champs identiques sauf la date
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
    let update = db.prepare('UPDATE projects SET title=?, description=?, creator=? WHERE projectId=?');
    let result = update.run([title, description, creator, projectId]);
    return result.changes === 1;
}

exports.deleteProject = function(projectId) {
    let result = db.prepare('DELETE FROM projects WHERE projectId=?').run([projectId]);
    return result.changes === 1;
}

exports.getProjectDetails = function(projectId) {
    let query = db.prepare('SELECT * FROM Projects WHERE projectId=?');
    let result = query.get([projectId]);

    result["categories"] = getCategoriesInArray(projectId);
    result["keywords"] = getKeywordsInArray(projectId);

    return result;
}

/***
 * 
 *          FOR THE PROJECT MEMBERS
 * 
 */



function getCategoriesInArray(projectId) {
    query = db.prepare('SELECT category FROM ProjectCategories WHERE projectId=?');
    let categoriesInDic = query.all([projectId]);

    let categoriesInArray = [];

    for (let i = 0 ; i < categoriesInDic.length ; i++) {
        categoriesInDic[i] = categoriesInDic[i].category;
    }

    return categoriesInArray;
}

function getKeywordsInArray(projectId) {
    query = db.prepare('SELECT keyword FROM ProjectKeywordss WHERE projectId=?');
    let keywordsInDic = query.all([projectId]);

    let keywordsInArray = [];

    for (let i = 0 ; i < keywordsInDic.length ; i++) {
        keywordsInDic[i] = keywordsInDic[i].keyword;
    }

    return keywordsInArray;
}
