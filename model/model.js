var sqlite = require('better-sqlite3');
var db = new sqlite('database.sqlite');

db.prepare("CREATE TABLE users (email VARCHAR2(30) PRIMARY KEY, username VARCHAR2(20) UNIQUE, password VARCHAR2(50)), status VARCHAR2(20)").run();
db.prepare("CREATE TABLE projects (projectId INTEGER(7) PRIMARY KEY, name VARCHAR2(60), description VARCHAR2(1000), creator VARCHAR2(30) REFERENCES users)").run();
db.prepare("CREATE TABLE projectMembers(projectId INTEGER(7) REFERENCES projects, user VARCHAR2(30) REFERENCES users, status VARCHAR2(15)").run();
db.prepare("CREATE TABLE projectKeyWords(projectId INTEGER(7) REFERENCES projects, keyword VARCHAR2(15)").run();
db.prepare("CREATE TABLE projectEvents(projectId INTEGER(7) REFERENCES projects, event VARCHAR2(500)").run();

var projectId = 0;
