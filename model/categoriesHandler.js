var sqlite = require('better-sqlite3');
var db = new sqlite('database.sqlite');


exports.addCategory = function(projectId, category) {
   if (isAlreadyPresent(projectId, category)) return false;
   let insert = db.prepare('INSERT INTO projectCategories VALUES (?, ?)');
   let result = insert.run([projectId, category]);
   return result.changes === 1;
 }

 exports.removeAllCategories = function(projectId) {
  let numberOfCategories = db.prepare('SELECT count(category) FROM projectCategories WHERE projectId=?').get([projectId]);
  let result = db.prepare('DELETE FROM projectCategories WHERE projectID=?').run(projectId);
  return result.changes === numberOfCategories;
}

exports.getProjectsWithCategory = function(category) {
  let query = db.prepare('SELECT projectId FROM projectCategories WHERE category=?');
  return query.all([category]);
}

exports.getCategoriesInString = function(projectId) {
  query = db.prepare('SELECT category FROM ProjectCategories WHERE projectId=?');
  let categoriesInDic = query.all([projectId]);

  let categoriesInString = "";

  for (let i = 0 ; i < categoriesInDic.length ; i++) {
      categoriesInString += categoriesInDic[i].category + ", ";
  }

  return categoriesInString !== "" ? categoriesInString.substring(0, categoriesInString.length - 2) : "";
}

function isAlreadyPresent(projectId, category) {
   let check = db.prepare('SELECT * FROM projectCategories WHERE projectId=? AND category=?').get([projectId, category]);
   return check !== undefined;
 }