let express = require('express');
let app = express();
let mustache = require('mustache-express');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const model = require('./model/model.js');

app.listen(3000, () => console.log("Server running on port 3000"));

app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', './views');

app.use(cookieSession({secret: 'WeLoveBeingConfined',
                        cookie: {maxAge="3*60*60*1000"}}));
app.use(bodyParser.urlencoded({extended : false}));

app.use('/styles', express.static(__dirname + '/styles'));
app.use('/resources', express.static(__dirname + '/resources'));


app.use ((req, res, next) => {
    res.locals.authenticated = req.session.user !== undefined;
    next();
});


function isAuthenticated(req, res, next) {
    if (req.session.user == undefined) {
        res.render("users/login-form");
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('index.html');
});

app.get('/signup-form', (req, res) => {
    res.render('users/signup-form');
});

app.post('/signup', (req, res) => {
    let email = req.body.mail;
    let username = req.body.username;
    let password = req.body.pwd;
    let confirmedPassword = req.body.verifpwd;
    let content = {};
        content["email"] = email;
        content["username"] = username;

    if (password !== confirmedPassword) {
        res.locals.pwdNotConfirmed;
        res.render('users/signup-form', content);
    }

    let checkResult = model.credentialsAreFree(email, username);
    
    if (checkResult === null) 
        renderError(req, res);

    else if (checkResult === -1) {
        res.locals.emailTaken = true;
        res.render('users/signup-form', content);
    }
    else if (checkResult === -2) {
        res.locals.usernameTaken = true;
        res.render('users/signup-form', content);
    }
    else {
        let regular = "regular";
        if (model.createUser(email, username, password, regular)) {
            renderError(req, res);
        }
        else {
            req.session.user = email;
            req.session.userStatus = regular;
            res.redirect('/home');
        }
    }
});

app.get('/login-form', (req, res) => {
    res.render('users/login-form');
});

app.post('/login', (req, res) => {
    let email = req.body.mail;
    let password = req.body.password;
    let isRightPassword = model.isTheRightPassword(email, password);
    if (isRightPassword === null) 
        renderError(req, res);
    else if (model.isTheRightPassword(email, password)) {
        req.session.user = email;
        let userStatus = model.getUserStatus(email);
        if (userStatus === null) 
            renderError(req, res);
        else {
            req.session.userStatus = userStatus;
            res.redirect('/home');
        }
    }
    else {
        res.locals.wrongCredentials = true;
        res.render('users/login-form', {"email" : email});
    }
});

app.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/');
});

app.get('/home', isAuthenticated, (req, res) => {
    let isAdministrator = isAdmin(req.session.userStatus);
    let username = model.getUsername(req.session.user);
    let projects = model.getProjects(req.session.user);
    if (username === null || projects === null) 
        renderError(req, res);
    else
        res.render('users/home', {"isAdmin": isAdministrator, "username": username, "projects": projects});
});

app.get('/#', (req, res) => {
    res.redirect('/');
});

app.get('/confirm-user-delete/:username', isAuthenticated, (req, res) => {
    let userEmail = model.getUserId(req.params.username);
    let userStatus = req.session.userStatus;
    if (userEmail === null) 
        renderError(req, res);
    
    else if (isAdmin(userStatus) || isSupervisor(userStatus) || userEmail === req.session.user)
        res.render('moderationTools/delete-user-form', {"username" : req.params.username});
    else {
        renderUnexpectedAction(req, res);
    }
});

app.get('/confirm-user-delete', isAuthenticated, (req, res) => {
    let userToDelete = model.getUserId(req.query.username);
    let word = req.query.delete.toUpperCase();
    let userStatus = req.session.userStatus;
    if (userToDelete === null) 
        renderError(req, res);
    else if(!isAdmin(userStatus) && !isSupervisor(userStatus) && req.session.user !== userToDelete) {
        renderUnexpectedAction(req, res);
    }
    else if(word === "SUPPRIMER") {
        if (model.deleteUser(userToDelete)){
            res.render('moderationTools/delete-confirmation');
        }
        else {
            res.locals.deleteFailure = true;
            res.render('moderationTools/delete-user-form', {"username" : req.params.username});
            }
        }
    else {
        res.locals.wrongWord = true;
        res.render('moderationTools/delete-user-form', {"username" : req.params.username});
    }
});

app.get('/change-password-form', isAuthenticated, (req, res) => {
    res.render('users/change-password-form');
});

app.post('/update-password', isAuthenticated, (res, req) => {
    let oldPassword = req.body.oldPwd;
    let newPassword = req.body.newPwd;
    let confirmedPassword = req.body.verifpwd;
    let userEmail = req.session.email;
    let isRightPassword = model.isTheRightPassword(userEmail, oldPassword);
    if (isRightPassword === null) 
        renderError(req, res);
    
    else if(!isRightPassword) {
        res.locals.wrongPassword = true;
        res.render('users/change-password-form')
    }
    else if(newPassword !== confirmedPassword) {
        res.locals.pwdNotConfirmed = true;
        res.render('users/change-password-form');
    }
    else {
        if(model.updateUserPassword(req.session.user, newPassword)) {
            res.render('users/update-confirmation');
        }
        else {
            res.locals.updateFailure = true;
            res.render('users/change-password-form');
        }
    }
});

app.get('/update-username-form', isAuthenticated, (req, res) => {
    res.render('users/change-username-form');
});

app.post('/update-username', isAuthenticated, (req, res) => {
    let username = req.body.username;
    let password = req.body.pwd;
    let checkResult = model.credentialsAreFree(req.session.user, username);
    let expectedPassword = model.getUserPassword(req.session.user);

    if (expectedPassword === null || checkResult === null) 
        renderError(req, res);
    else if (password !== expectedPassword) {
        res.locals.wrongPassword = true;
        res.render('users/update-username-form', {"username" : username});
    }
    else if (checkResult === -2) {
        res.locals.usernameTaken = true;
        res.render('users/update-username-form', {"username" : username});
    }
    else {
        if (model.updateUserUsername(req.session.user, username)) {
            res.render('users/update-confirmation');
        }
        else {
            res.locals.updateFailure = true;
            res.render('users/update-username-form', {"username" : username});
        }
    }
});

app.get('/usersList', isAuthenticated, (req, res) => {
    let userStatus = req.session.userStatus;
    if (!isAdmin(userStatus) && !isSupervisor(userStatus)) {
        renderUnexpectedAction(req, res);
    } else {
        let usersList = model.getUsersList();
        if (usersList === null) renderError(req, res);

        else {
            let dictionnary = {};
            dictionnary["usersList"] = usersList;
            dictionnary["linkToDelete"] = "/confirm-user-delete/";
            dictionnary["objective"] = "utilisateurs du site"
            res.render('moderationTools/users-list', dictionnary);
        }
    }
});

app.get('/create-project-form', isAuthenticated, (req, res) => {
    let fields = {"objective" : "Créer", "linkToRout" : "/creating-project"};
    res.render('projects/create-project-form', fields);
});

app.post('/creating-project', isAuthenticated, (req, res) => {
    let categories = getCategoriesArray(req.body);
    let keywords = req.body.keywords.split(',');

    for(let i = 0; i < keywords.length; i++) {
        keywords[i] = keywords[i].trim();
    }
    let date = new Date().toISOString();
    let result = model.createProject(req.body.title, req.body.description, categories, req.session.user, date, keywords);
    if (result === null)
        renderError(req, res);
    else {
        res.redirect('/project-details/' + result);
    }
});

app.get('/project-details/:projectId', (req, res) => {
    let user = req.session.user;
    let userStatus = req.session.userStatus;
    let projectId = req.params.projectId;
    let details = model.getProjectDetails(req.params.projectId);
    setProjectStatus(user, userStatus, projectId, details);
    res.render('projects/project-details', details);
});

app.get('/update-project-form/:projectId', isAuthenticated, (req, res) => {
    let fields = model.getProjectDetails(req.params.projectId);
    if(fields === null)
        renderError(req, res);
    else {
        fields["objective"] = "Mettre à jour";
        fields["linkToRout"] = "/updating-project/" + req.params.projectId;
        addCheckedToCategories(fields.categories, fields);
        res.render('projects/create-project-form', fields);
    }
});

app.post('/updating-project/:projectId', isAuthenticated, (req, res) => {
    let categories = getCategoriesArray(req.body);
    let keywords = req.body.keywords.split(',');

    for (let i = 0 ; i < keywords.length() ; i++) {
        keywords[i] = keywords[i].trim();
    }

    let result = model.updateProject(req.params.projectId, req.body.title, req.body.description, categories, keywords);
    if (result === null) renderError(req, res);
    else {
        res.redirect('/projects/:projectId');
    }
});

app.get('/delete-project/:projectId', isAuthenticated, (req, res) => {
    let user = req.session.user;
    if(isAdmin(req.session.userStatus) || isSupervisor(user) || isCreator(user, req.params.user)){
        res.render("moderationTools/delete-project-form", {"projectId": req.params.projectId});
        console.log("Passed 2");
    }
    else 
        renderUnexpectedAction(req, res);
});

app.get('/confirm-project-delete', isAuthenticated, (req, res) => {
    let userEmail = req.session.user;
    let word = req.query.delete.toUpperCase();
    let projectId = req.query.projectId;

    if (userEmail === null) renderError(req, res);

    else if(!isAdmin(req.session.userStatus) && !isSupervisor(req.session.userStatus) && !isCreator(userEmail, projectId)) {
        renderUnexpectedAction(req, res);
    }
    else if (word === "SUPPRIMER") {
        if (model.deleteProject(projectId)) {
            res.render('moderationTools/delete-confirmation');
        }
        else {
            res.locals.deleteFailure = true;
            res.render('projects/delete-project-form', {"projectId" : projectId});
            }
        }
    else {
        res.locals.wrongWord = true;
        res.render('projects/delete-project-form', {"projectId" : projectId});
    }
});

app.get('/membersList/:projectId', isAuthenticated, (req, res) => {
    let userId = req.session.user;
    let userStatus = req.session.userStatus;
    if (isAdmin(userStatus) || isSupervisor(userStatus) || isCreator(userId, req.params.projectId) || isModerator(userId)) {
        let membersList = model.getMembers(req.params.projectId);
        if (usersList === null) 
            renderError(req, res);
        else {
            let dictionnary = {};
            dictionnary["usersList"] = membersList;
            dictionnary["linkToDelete"] = "/confirm-member-delete/";
            dictionnary["objective"] = "membres du projet";
            dictionnary["projectId"] = "+AND+" + req.params.projectId;
            res.render('moderationTools/users-list', dictionnary);
        }
    } else {
        renderUnexpectedAction(req, res);
    }
});

app.get('/confirm-member-delete/:username+AND+:projectId', (req, res) => {
    let userEmail = model.getUserId(req.params.username);
    if (userEmail === null) renderError(req, res);
    
    else if (isAdmin(req.session.userStatus) || isSupervisor(req.session.userStatus) || isCreator(req.session.user, req.params.projectId) || isModerator(req.session.user)) {
        let content = {};
        content["username"] = req.params.username;
        content["projectId"] = req.params.projectId;
        res.render('moderationTools/ban-member-form', content);
    }
    else {
        renderUnexpectedAction(req, res);
    }
});

app.get('/confirm-member-ban', (req, res) => {
    let userToBan = model.getUserId(req.query.username);
    let projectId = req.query.projectId;
    let userWhoAsks = req.session.user;
    let askingUserStatus = req.session.userStatus;
    let word = req.query.delete.toUpperCase();

    if (userToBan === null) renderError(req, res);

    else if(!isAdmin(askingUserStatus) && !isSupervisor(askingUserStatus) && isCreator(userWhoAsks, projectId) && isModerator(userWhoAsks)) {
        renderUnexpectedAction(req, res);
    }
    else if(word !== "EXCLURE") {
        res.locals.wrongWord = true;
        let content = {};
        content["username"] = req.params.username;
        content["projectId"] = req.params.projectId;
        res.render('moderationTools/ban-member-form', content);
    }
    else {
        if (model.removeMember(projectId, userToBan)){
            res.render('moderationTools/delete-confirmation');
        }
        else {
            res.locals.deleteFailure = true;
            let content = {};
            content["username"] = req.params.username;
            content["projectId"] = req.params.projectId;
            res.render('moderationTools/ban-member-form', content);
        }
    }
});


app.use((req, res, next) => {
    res.send("404 Not Found URL : " + req.url);
    next();
});


function getCategoriesArray(body) {
    let AllCategories = ["recycling", "lobbying", "cleaning", "person", "awareness"];
    let categories = []; let index = 0;
    for (cat of AllCategories) {
        if (body[cat] === undefined) continue;
        categories[index] = cat; 
        index++;
    }
    return categories;
}

function addCheckedToCategories(categoriesToString, target) {
    if(categoriesToString.includes('recycling')) {
        target["recycling"] = "checked";
    }
    if(categoriesToString.includes('lobbying')) {
        target['lobbying'] = "checked";
    }
    if(categoriesToString.includes('cleaning')) {
        target['cleaning'] = "checked";
    }
    if(categoriesToString.includes('person')) {
        target['person'] = "checked";
    }
    if(categoriesToString.includes('awareness')) {
        target['awareness'] = "checked";
    }
}

function isAdmin(userStatus) {
    return userStatus === "administrator";
}

function isSupervisor(userStatus) {
    return userStatus === "supervisor";
}

function isCreator(userEmail, projectId) {
    return model.getCreator(projectId) === userEmail;
}

function isModerator(userEmail, projectId) {
    return model.getUserProjectStatus(userEmail, projectId) === "moderator";
}

function renderError(req, res) {
    res.render('errors/unexpectedError', {'referer': req.headers.referer});
}

function renderUnexpectedAction(req, res) {
    res.render('errors/unauthorized-action', {"referer": req.headers.referer});
}

function setProjectStatus(user, userStatus, projectId, details) {
    let status = model.getUserStatus(user, projectId);
    switch (status) {
        case 'member' : details.isSupporting = true; break;
        case 'follower' : details.isFollowing = true; break;
        case 'moderator' : details.isModerator = true; break;
        default : details.isRegular = true; break;
    }
    if (isCreator(user, projectId)) {
        details.isCreator = true;
    } else if (isAdmin(userStatus) || isSupervisor(userStatus)) {
        details.isSupervisor = true;
    } else details.isRegular = true;
}