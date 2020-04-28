var sqlite = require('better-sqlite3');
var keywordsHandler = require('./keywordsHandler.js');
var categoriesHandler = require('./categoriesHandler.js');
var eventsHandler = require('./eventsHandler.js');
var projectLinkedUsersHandler = require('./projectLinkedUsersHandler.js')
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

    result["numberOfMembers"] = projectLinkedUsersHandler.getNumberOfMember(projectId);

    result["categories"] = categoriesHandler.getCategoriesInString(projectId);
    result["keywords"] = keywordsHandler.getKeywordsInString(projectId);
    result["events"] = eventsHandler.getProjectEvents(projectId);
    return result;
}

exports.getCreator = function(projectId) {
    let query = db.prepare('SELECT creator FROM projects WHERE projectId=?');
    return query.get([projectId]).creator;
}


exports.searchProjects = function(category, keywords) {
    let resultOfQuery;
    let request = "";

    if(keywords !== undefined) {
        keywords = keywords.split(",");
        trimStringsOfArray(keywords);
        
        if(category != "all") {
            request = buildRequestWithKeywordsAndCategory(keywords);
            resultOfQuery = db.prepare(request).all(category, keywords);
        }
        else {
            request = buildRequestWithKeywords(keywords);
            resultOfQuery = db.prepare(request.all(keywords));
        }
    }
    else {
        if (category == "all") {
            let query = db.prepare('SELECT projectId FROM projects ORDER BY RANDOM() LIMIT 100');
            resultOfQuery = query.all();
        }
        else {
            resultOfQuery = categoriesHandler.getProjectsWithCategory(category);
        }
    }

    let validProjects = [];

    for (let i = 0 ; i < resultOfQuery.length() ; i++) {
        let projectId = resultOfQuery[i].projectId;
        validProjects[i] = getProjectDetails(projectId);
    }

    return validProjects;
}


function trimStringsOfArray(arrayOfString) {
    for (let i = 0 ; i < arrayOfString.length() ; i++) {
        arrayOfString[i] = arrayOfString[i].trim();
    }
}


function buildRequestWithKeywordsAndCategory(keywords) {
    let request = "SELECT projectID FROM projectKeywords K, projectCategories C WHERE K.projectId = C.projectId AND category=? AND ";

    return fillWithKeywordsAndFinalParameters(request, keywords);
}

function fillWithKeywordsAndFinalParameters(request, keywords) {
    for (let i = 0 ; i < keywords.length() ; i++) {
        request += "keyword=? AND ";
    }

    request = removeFinalAND(request);
    return request + " ORDER BY RANDOM() LIMIT 100";
}

function removeFinalAND(string) {
    return string.substring(0, request.length() - 5);
}
