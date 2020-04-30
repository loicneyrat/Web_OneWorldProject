var sqlite = require('better-sqlite3');
var keywordsHandler = require('./keywordsHandler.js');
var categoriesHandler = require('./categoriesHandler.js');
var eventsHandler = require('./eventsHandler.js');
var projectLinkedUsersHandler = require('./projectLinkedUsersHandler.js');
var db = new sqlite('database.sqlite');

exports.createProject = function(title, description, categories, creator, date, keywords) {
    let insert = db.prepare('INSERT INTO projects (title, description, creator, date) VALUES (?, ?, ?, ?)');
    let projectId = insert.run([title, description, creator, String(date)]).lastInsertRowid;
    
    //remove all duplicates from the array.
    keywords.filter((item, index) => keywords.indexOf(item) === index);
    for(let i = 0 ; i < keywords.length ; i++) {
        if (keywords[i] != "")
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
        if (keywords[i] != "")
            keywordsHandler.addKeyword(projectId, keywords[i]);
    }

    categoriesHandler.removeAllCategories(projectId);
    for(let i = 0; i < categories.length; i++){
        categoriesHandler.addCategory(projectId, categories[i]);
    }
    let update = db.prepare('UPDATE projects SET title=?, description=? WHERE projectId=?');
    let result = update.run([title, description, projectId]);
    return result.changes === 1;
}

exports.deleteProject = function(projectId) {
    let result = db.prepare('DELETE FROM projects WHERE projectId=?').run([projectId]);
    return result.changes === 1;
}

exports.getProjectDetails = function(projectId) {
    let query = db.prepare('SELECT projectId, title, description, creator, date(date) date FROM Projects WHERE projectId=?');
    let result = query.get([projectId]);

    result['creator'] = db.prepare('SELECT username FROM users WHERE email=?').get([result.creator]).username;

    result["numberOfMembers"] = projectLinkedUsersHandler.getNumberOfMembers(projectId);

    result["categories"] = categoriesHandler.getCategoriesInString(projectId);
    result["keywords"] = keywordsHandler.getKeywordsInString(projectId);
    result["events"] = eventsHandler.getProjectEvents(projectId);
    return result;
}

exports.getCreator = function(projectId) {
    let query = db.prepare('SELECT creator FROM projects WHERE projectId=?');
    let result = query.get([projectId]);
    return result === undefined ? result : result.creator;
}


exports.changeCreators = function(projectId, newCreatorId) {
    let actualCreatorId = this.getCreator(projectId);
    if (actualCreatorId === undefined) return false;
    let setCreator = db.prepare('UPDATE projects SET creator=? WHERE projectId=?').run([newCreatorId, projectId]);
    let deleting = db.prepare('DELETE FROM projectLinkedUsers WHERE projectId=? AND user=?').run([projectId, newCreatorId]);
    if (deleting === undefined || deleting.changes !== 1) return false;
    let isPresent = db.prepare('SELECT * FROM projectLinkedUsers WHERE projectId=? AND user=?').get([projectId, actualCreatorId]);
    let final;
    if (isPresent === undefined) {
        final = db.prepare('INSERT INTO projectLinkedUsers (projectId, user, status) VALUES (?, ?, ?)').run([projectId, actualCreatorId, "moderator"]);
    } else {
        final = projectLinkedUsersHandler.updateMemberStatus(projectId, actualCreatorId, "moderator"); db.prepare('UPDATE projectLinkedUsers SET status=? WHERE projectId=? AND user=?').run(["moderator", projectId, actualCreatorId]);
    }                       
    return final !== undefined && final.changes === 1; 
}


exports.searchProjects = function(category, keywords) {
    let resultOfQuery;
    let request = "";
    if(keywords !== "") {
        keywords = keywords.split(",");
        trimStringsOfArray(keywords);
        if (category != "Toutes les catégories") {
            request = buildRequestWithKeywordsAndCategory(keywords);
            resultOfQuery = db.prepare(request).all(category, keywords);
        }
        else {
            request = buildRequestWithKeywords(keywords);
            resultOfQuery = db.prepare(request).all(keywords);
        }
    }
    else {
        if (category == "Toutes les catégories") {
            let query = db.prepare('SELECT projectId FROM projects ORDER BY RANDOM() LIMIT 100');
            resultOfQuery = query.all();
        }
        else {
            resultOfQuery = categoriesHandler.getProjectsWithCategory(category);
        }
    }
    let validProjects = [];

    for (let i = 0 ; i < resultOfQuery.length ; i++) {
        let projectId = resultOfQuery[i].projectId;
        validProjects.push(this.getProjectDetails(projectId));
    }

    return validProjects;
}


function trimStringsOfArray(arrayOfString) {
    for (let i = 0 ; i < arrayOfString.length ; i++) {
        arrayOfString[i] = arrayOfString[i].trim();
    }
}


function buildRequestWithKeywordsAndCategory(keywords) {
    let request = "SELECT K.projectId FROM projectKeywords K, projectCategories C WHERE K.projectId = C.projectId AND category=? AND ";
    return fillWithKeywordsAndFinalParameters(request, keywords);
}

function buildRequestWithKeywords(keywords) {
    let request = "SELECT projectId FROM projectKeywords WHERE ";
    return fillWithKeywordsAndFinalParameters(request, keywords);
}

function fillWithKeywordsAndFinalParameters(request, keywords) {
    for (let i = 0 ; i < keywords.length ; i++) {
        request += "keyword=? OR ";
    }

    request = removeFinalOR(request);
    return request + " ORDER BY RANDOM() LIMIT 100";
}

function removeFinalOR(string) {
    return string.substring(0, string.length - 4);
}

