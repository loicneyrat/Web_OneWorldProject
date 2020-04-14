var sqlite = require('better-sqlite3');
var keywordsHandler = require('./keywordsHandler.js');
var categoriesHandler = require('./categoriesHandler.js');
var db = new sqlite('database.sqlite');

exports.createProject = function(title, description, categories, creator, date, keywords) {
    let insert = db.prepare('INSERT INTO projects (title, description, creator, date) VALUES (?, ?, ?, ?)');
    let projectId = insert.run([title, description, creator, String(date)]).lastInsertRowid;
    
    //remove all duplicates from the array.
    keywords.filter((item, index) => keywords.indexOf(item) === index);
    for(let i = 0 ; i < keywords.length ; i++) {
        keywordsHandler.addKeyword(projectId, keywords[i]);
    }

    categories.filter((item, index) => categories.indexOf(item) === index);
    for(let i = 0 ; i < categories.length ; i++) {
        categoriesHandler.addCategory(projectId, categories[i]);
    }
    return projectId;
}

exports.updateProject = function(projectId, title, description, categories, keywords) {

    keywordsHandler.removeAllKeywords(projectId);
    for(let i = 0; i < keywords.length; i++){
        keywordsHandler.addKeyword(projectId, keywords[i]);
    }

    categoriesHandler.removeAllCategories(projectId);
    for(let i = 0; i < categories.length; i++){
        categoriesHandler.addCategory(projectId, categories[i]);
    }

    let update = db.prepare('UPDATE projects SET title=?, description=?, date=? creator=? WHERE projectId=?');
    let result = update.run([title, description, projectId]);

    return result.changes === 1;
}

exports.deleteProject = function(projectId) {
    let result = db.prepare('DELETE FROM projects WHERE projectId=?').run([projectId]);
    return result.changes === 1;
}

exports.getProjectDetails = function(projectId) {
    let query = db.prepare('SELECT * FROM Projects WHERE projectId=?');
    let result = query.get([projectId]);

    result["categories"] = getCategoriesInString(projectId);
    result["keywords"] = getKeywordsInString(projectId);
    result["events"] = getProjectEvents(projectId);

    return result;
}

exports.getCreator = function(projectId) {
    let query = db.prepare('SELECT creator FROM projects WHERE projectId=?');
    return query.get([projectId]);
}


function getCategoriesInString(projectId) {
    query = db.prepare('SELECT category FROM ProjectCategories WHERE projectId=?');
    let categoriesInDic = query.all([projectId]);

    let categoriesInString = "";

    for (let i = 0 ; i < categoriesInDic.length ; i++) {
        categoriesInString += categoriesInDic[i].category + ", ";
    }

    return categoriesInString !== "" ? categoriesInString.substring(0, categoriesInString.length - 2) : "";
}

function getKeywordsInString(projectId) {
    let query = db.prepare('SELECT keyword FROM ProjectKeywords WHERE projectId=?');
    let keywordsInDic = query.all([projectId]);

    let keywordsInString = "";

    for (let i = 0 ; i < keywordsInDic.length ; i++) {
        keywordsInString += keywordsInDic[i].keyword + ", ";
    }

    return keywordsInString !== "" ? keywordsInString.substring(0, keywordsInString.length - 2) : "";
}

function getProjectEvents(projectId) {
    return db.prepare('SELECT * FROM projectEvents WHERE projectId=?').all([projectId]);
}
