var sqlite = require('better-sqlite3');
var db = new sqlite('database.sqlite');


exports.addCategory = function(projectId, category) {
   if (isAlreadyPresent(projectId, category)) return false;
   let insert = db.prepare('INSERT INTO projectCategories VALUES (?, ?)');
   let result = insert.run([projectId, category]);
   return result.changes === 1;
 }


exports.removeCtategory = function(projectId, category) {
   let check = sqlCheck(projectId, projects);
   if (check === undefined) return false;

   let result = db.prepare('DELETE FROM projectKeywords WHERE projectId=? AND category=?').run([projectId, category]);
   return result.changes === 1;
 }


function isAlreadyPresent(projectId, category) {
   let check = db.prepare('SELECT * FROM projectCategories WHERE projectId=? AND category=?').get([projectId, category]);
   return check !== undefined;
 }