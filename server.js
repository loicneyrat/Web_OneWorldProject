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
                        cookie: {maxAge: "3*60*60*1000"}}));
app.use(bodyParser.urlencoded({extended : false}));

app.use('/styles', express.static(__dirname + '/styles'));
app.use('/resources', express.static(__dirname + '/resources'));


app.use ((req, res, next) => {
    res.locals.authenticated = req.session.user !== undefined;
    next();
});


function isAuthenticated(req, res, next) {
    if (req.session == undefined) {
        res.render("users/login-form");
    } else {
        next();
    }
}


app.get('/', (req, res) => {
    res.render('index.html');
});


/**
 * 
 * 
 *              CONNEXION ROUTES
 * 
 */


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
        res.locals.pwdNotConfirmed = true;
        res.render('users/signup-form', content);
        return;
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
        if (! model.createUser(email, username, password, regular)) {
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
    if (isRightPassword === null || isRightPassword === false) {
        res.locals.wrongCredentials = true;
        res.render('users/login-form', {"email" : email});
    }
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
});

app.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/');
});












/**
 * 
 * 
 *              USERS HANDLING ROUTES
 * 
 */

app.get('/home', isAuthenticated, (req, res) => {
    let isAdministrator = isAdmin(req.session.userStatus);
    let isSupervisorOrAbove = isSupervisor(req.session.userStatus)|| isAdmin(req.session.userStatus);
    let username = model.getUsername(req.session.user);
    let projects = model.getProjects(req.session.user);
    if (username === null || projects === null) 
        renderError(req, res);
    else
        res.render('users/home', {"isSupervisorOrAbove" : isSupervisorOrAbove,
                                  "isAdmin": isAdministrator, 
                                  "username": username, 
                                  "projects": projects
                                });
});


app.get('/confirm-user-delete/:username', isAuthenticated, (req, res) => {
    let userEmail = model.getUserId(req.params.username);
    let userStatus = req.session.userStatus;
    let userToDeleteStatus = model.getUserStatus(userEmail);
    if (userEmail === null) 
        renderError(req, res);
    else if (userStatus === userToDeleteStatus && userEmail !== req.session.user)
        renderUnauthorizedAction(req, res);
    else if (isAdmin(userStatus) || isSupervisor(userStatus) || userEmail === req.session.user)
        res.render('moderationTools/delete-user-form', {"username" : req.params.username});
    else {
        renderUnauthorizedAction(req, res);
    }
});

app.get('/confirm-user-delete', isAuthenticated, (req, res) => {
    let userToDelete = model.getUserId(req.query.username);
    let word = req.query.delete.toUpperCase();
    let userStatus = req.session.userStatus;
    let userToDeleteStatus = model.getUserStatus(userToDelete);
    if (userToDelete === null) 
        renderError(req, res);
    else if (userStatus === userToDeleteStatus && userToDelete !== req.session.user)
        renderUnauthorizedAction(req, res);
    else if(!isAdmin(userStatus) && !isSupervisor(userStatus) && req.session.user !== userToDelete) {
        renderUnauthorizedAction(req, res);
    }
    else if (word === "SUPPRIMER") {
        if (model.deleteUser(userToDelete)) {
            let data = {};
            data["linkToNext"] = "/usersList";
            if (req.session.user === userToDelete) {
                req.session = null;
                res.locals.authenticated = false;
                data["linkToNext"] = "/";
            }
            res.render('multiUsage/delete-confirmation', data);
        } else {
                res.locals.deleteFailure = true;
                res.render('moderationTools/delete-user-form', {"username" : req.params.username});
                
        }
    } else {
        res.locals.wrongWord = true;
        res.render('moderationTools/delete-user-form', {"username" : req.query.username});
    }
});

app.get('/change-password-form', isAuthenticated, (req, res) => {
    res.render('users/change-password-form');
});

app.post('/update-password', isAuthenticated, (req, res) => {
    let oldPassword = req.body.oldPwd;
    let newPassword = req.body.newPwd;
    let confirmedPassword = req.body.verifpwd;
    let userEmail = req.session.user;
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
    let username = model.getUsername(req.session.user);
    res.render('users/change-username-form', {username});
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
        res.render('users/change-username-form', {"username" : username});
    }
    else if (checkResult === -2) {
        res.locals.usernameTaken = true;
        res.render('users/change-username-form', {"username" : username});
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
    let isAdministrator = isAdmin(userStatus);
    if (!isAdministrator && !isSupervisor(userStatus)) {
        renderUnauthorizedAction(req, res);
    } else {
        let usersList = model.getUsersList();
        if (usersList === null) renderError(req, res);

        else {
            let dictionnary = {};
            dictionnary["usersList"] = usersList;
            dictionnary["linkToDelete"] = "/confirm-user-delete/";
            dictionnary.linkToUpdateStatus = "/update-user-status-form/"
            dictionnary["objective"] = "utilisateurs du site"
            dictionnary["hasFullRights"] = isAdministrator;
            res.render('moderationTools/users-list', dictionnary);
        }
    }
});

app.get('/update-user-status-form/:username', (req, res) => {
    let userStatus = req.session.userStatus;
    let selectedUser = model.getUserId(req.params.username);
    let selectedUserStatus = model.getUserStatus(selectedUser);
    if (selectedUserStatus === null || selectedUser === null) {
        renderError(req, res);
    } else {
        if (isAdmin(selectedUserStatus) || (! isAdmin(userStatus) && !isSupervisor(userStatus))) {
            renderUnauthorizedAction(req, res);
        } else {
            let datas = {};
            datas.linkToUpdateStatus = "/updating-user-status/" + req.params.username;
            datas.objective = "DU SITE";
            datas.status = ["Regular", "Supervisor"];
            datas.actualStatus = selectedUserStatus;
            datas.username = req.params.username;
            res.render('moderationTools/update-user-status-form', datas);
        }
    }
});

app.get('/updating-user-status/:username', (req, res) => {
    let previousStatus = String(req.query.previousStatus).toLowerCase();
    let newStatus = String(req.query.newStatus).toLowerCase();
    let updatedUser = model.getUserId(req.params.username);
    if (previousStatus === newStatus)
        res.redirect('/usersList');
    else {
        let isUpdated = model.updateUserStatus(updatedUser, newStatus);
        if (isUpdated === null || !isUpdated) renderError(req, res);
        else res.redirect('/usersList');
    }
});

















/**
 * 
 * 
 *              PROJECTS ROUTES
 * 
 */





app.get('/create-project-form', isAuthenticated, (req, res) => {
    let fields = {"objective" : "Créer", "linkToRout" : "/creating-project"};
    fields["allCategories"] = model.allCategories;
    uncheckAllCategories(fields);
    res.render('projects/create-project-form', fields);
});

function uncheckAllCategories(fields) {
    for(let i = 0 ; i < fields.allCategories.length ; i++) {
        fields["allCategories"][i]["check"] = "";
    }
}

app.post('/creating-project', isAuthenticated, (req, res) => {
    let categories = getCategoriesInArray(req.body);
    let date = new Date().toISOString();
    let keywords = req.body.keywords.split(',');
    let keywordsTooBig = false;

    for(let i = 0; i < keywords.length; i++) {
        keywords[i] = keywords[i].trim();
        if(keywords[i].length > 15) {
            keywordsTooBig = true;
            break;
        }
    }
    if(keywordsTooBig) {
        res.locals.keywordHasTooManyCharacters = true;
        let data = {};
        data["title"] = req.body.title;
        data["description"] = req.body.description;
        data["keywords"] = req.body.keywords;
        data["allCategories"] = model.allCategories;
        data["objective"] = "Créer";
        data["linkToRout"] = "/creating-project";
        res.render("projects/create-project-form", data);
    }else if(categories.length == 0) {
        res.locals.noCategoriesChosen = true;
        let data = {};
        data["title"] = req.body.title;
        data["description"] = req.body.description;
        data["keywords"] = req.body.keywords;
        data["allCategories"] = model.allCategories;
        data["objective"] = "Créer";
        data["linkToRout"] = "/creating-project";
        res.render("projects/create-project-form", data);
    }else{
        let result = model.createProject(req.body.title, req.body.description, categories, req.session.user, date, keywords);
        if (result === null)
        renderError(req, res);
        else {
            res.redirect('/project-details/' + result);
        }
    }
});

app.get('/project-details/:projectId', (req, res) => {
    let user = req.session.user;
    let userStatus = req.session.userStatus;
    let projectId = req.params.projectId;
    let details = model.getProjectDetails(projectId);
    details.description = details.description.replace(/\r\n/g, "<br/>").replace(/\n/g, "<br/>").replace(/\r/g, "<br/>");
    details["membershipButtonValue"] = model.isMember(user, projectId) ? "Quitter le projet" : "Devenir membre";
    setProjectStatus(user, userStatus, projectId, details);
    res.render('projects/project-details', details);
});

app.get('/update-project-form/:projectId', isAuthenticated, (req, res) => {
    let fields = model.getProjectDetails(req.params.projectId);
    let user = req.session.user;
    if (!isAdmin(req.session.userStatus) && !isSupervisor(user) && !isCreatorOfProject(user, req.params.projectId)){
        renderUnauthorizedAction(req, res);
        return;
    }
    if(fields === null)
        renderError(req, res);
    else {
        fields["objective"] = "Mettre à jour";
        fields["linkToRout"] = "/updating-project/" + req.params.projectId;
        fields["allCategories"] = model.allCategories;
        fields.allCategories = addCheckedToCategories(fields.categories, fields.allCategories);
        res.render('projects/create-project-form', fields);
    }
});

app.post('/updating-project/:projectId', isAuthenticated, (req, res) => {
    let categories = getCategoriesInArray(req.body);
    let projectId = req.params.projectId;
    let keywords = req.body.keywords.split(',');
    let keywordsTooBig = false;

    if (!isAdmin(req.session.userStatus) && !isSupervisor(req.session.userStatus) && !isCreatorOfProject(req.session.user, projectId)){
        renderUnauthorizedAction(req, res);
        return;
    }
    for(let i = 0; i < keywords.length; i++) {
        keywords[i] = keywords[i].trim();
        if(keywords[i].length > 15) {
            keywordsTooBig = true;
            break;
        }
    }
    if(keywordsTooBig) {
        res.locals.keywordHasTooManyCharacters = true;
        let data = {};
        data["title"] = req.body.title;
        data["description"] = req.body.description;
        data["keywords"] = req.body.keywords;
        data["allCategories"] = model.allCategories;
        data["objective"] = "Mettre à jour";
        data["linkToRout"] = "/updating-project/" + projectId;
        res.render("projects/create-project-form", data);
    }else if(categories.length == 0) {
        res.locals.noCategoriesChosen = true;
        let data = {};
        data["title"] = req.body.title;
        data["description"] = req.body.description;
        data["keywords"] = req.body.keywords;
        data["allCategories"] = model.allCategories;
        data["objective"] = "Mettre à jour";
        data["linkToRout"] = "/updating-project/" + projectId;
        res.render("projects/create-project-form", data);
    }else{
        let result = model.updateProject(projectId, req.body.title, req.body.description, categories, keywords);
        if (result === null) renderError(req, res);
        else {
            res.redirect(`/project-details/${projectId}`);
        }
    }
});

app.get('/delete-project/:projectId', isAuthenticated, (req, res) => {
    let user = req.session.user;
    if (isAdmin(req.session.userStatus) || isSupervisor(req.session.userStatus) || isCreatorOfProject(user, req.params.projectId)){
        res.render("projects/delete-project-form", {"projectId": req.params.projectId});
    }
    else 
        renderUnauthorizedAction(req, res);
});

app.get('/confirm-project-delete', isAuthenticated, (req, res) => {
    let userEmail = req.session.user;
    let word = req.query.delete.toUpperCase();
    let projectId = req.query.projectId;

    if (userEmail === null) renderError(req, res);

    else if(!isAdmin(req.session.userStatus) && !isSupervisor(req.session.userStatus) && !isCreatorOfProject(userEmail, projectId)) {
        renderUnauthorizedAction(req, res);
    }
    else if (word === "SUPPRIMER") {
        if (model.deleteProject(projectId)) {
            let data = {};
            data["linkToNext"] = "/home";
            res.render('multiUsage/delete-confirmation', data);
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
    let projectId = req.params.projectId;
    if (!isAdmin(userStatus) && !isSupervisor(userStatus) && !isCreatorOfProject(userId, projectId) && !isModerator(userId, projectId)) {
        renderUnauthorizedAction(req, res);
    } else {
        let membersList = model.getMembers(req.params.projectId);
        let hasFullRights = isAdmin(userStatus) || isSupervisor(userStatus) || isCreatorOfProject(userId, projectId);
        if (membersList === null) 
            renderError(req, res);
        else {
            let dictionnary = {};
            dictionnary["usersList"] = membersList;
            dictionnary["linkToDelete"] = "/confirm-member-delete/";
            dictionnary.linkToUpdateStatus = `/update-member-status-form/${projectId}/`
            dictionnary["objective"] = "membres du projet";
            dictionnary["projectId"] = "-AND-" + projectId;
            dictionnary["hasFullRights"] = hasFullRights;
            res.render('moderationTools/users-list', dictionnary);
        }
    }
});

app.get('/confirm-member-delete/:username-AND-:projectId', isAuthenticated, (req, res) => {
    let projectId = req.params.projectId;
    let userToDelete = model.getUserId(req.params.username);
    let requester = req.session.user;
    if (userToDelete === null) renderError(req, res);
    if (isCreatorOfProject(userToDelete, projectId))
        renderUnauthorizedAction(req, res);
    else if (isModerator(requester, projectId) && isModerator(userToDelete, projectId)) {
        renderUnauthorizedAction(req, res);
    } else if (isAdmin(req.session.userStatus) || isSupervisor(req.session.userStatus) || isCreatorOfProject(requester, projectId) || isModerator(requester, projectId)) {
        let content = {};
        content["username"] = req.params.username;
        content["projectId"] = req.params.projectId;
        res.render('moderationTools/ban-member-form', content);
    }
    else {
        renderUnauthorizedAction(req, res);
    }
});

app.get('/confirming-member-ban', isAuthenticated, (req, res) => {
    let userToBan = model.getUserId(req.query.username);
    let projectId = req.query.projectId;
    let requester = req.session.user;
    let requesterStatus = req.session.userStatus;
    let word = req.query.delete.toUpperCase(); 
    if (userToBan === null) renderError(req, res);
    if (isCreatorOfProject(userToBan, projectId)) renderUnauthorizedAction(req, res);
    else if (!isAdmin(requesterStatus) && !isSupervisor(requesterStatus) && !isCreatorOfProject(requester, projectId) && !isModerator(requester, projectId)) {
        renderUnauthorizedAction(req, res);
    } else if (isModerator(requester, projectId) && isModerator(userToBan, projectId) && requester !== userToBan) {
        renderUnauthorizedAction(req, res)
    } else if (word !== "EXCLURE") {
        res.locals.wrongWord = true;
        let content = {};
        content["username"] = req.params.username;
        content["projectId"] = req.params.projectId;
        res.render('moderationTools/ban-member-form', content);
    } else {
        if (model.removeMember(projectId, userToBan)){
            let data = {};
            data["linkToNext"] = "/membersList/" + projectId;
            res.render('multiUsage/delete-confirmation', data);
        } else {
            res.locals.deleteFailure = true;
            let content = {};
            content["username"] = req.params.username;
            content["projectId"] = req.params.projectId;
            res.render('moderationTools/ban-member-form', content);
        }
    }
});


app.get("/project-details/membership/:projectId", isAuthenticated, (req, res) => {
    let userEmail = req.session.user;
    let projectId = req.params.projectId;
    let errorOccured = false;
    if(isCreatorOfProject(userEmail, projectId)) {
        res.render('projects/name-new-creator', {"referer": req.headers.referer});
    }
    else if(model.isMember(userEmail, projectId)) {
        if(!model.removeMember(projectId, userEmail)){
            renderError(req, res);
        }else {
            res.redirect("/project-details/" + projectId);
        }
    }
    else {
        if(!model.addMember(projectId, userEmail)){
            renderError(req, res);
        }else {
            res.redirect("/project-details/" + projectId);
        }
    }
});

app.get('/update-member-status-form/:projectId/:username', (req, res) => {
    let projectId = req.params.projectId;
    let user = req.session.user;
    let userStatus = model.getUserStatus(user);
    let selectedUser = model.getUserId(req.params.username);
    let selectedUserStatus = model.getUserProjectStatus(selectedUser, projectId);
    if (selectedUserStatus === null || selectedUser === null) {
        renderError(req, res);
    } else if (isCreatorOfProject(selectedUser, projectId)) {
            renderUnauthorizedAction(req, res);
    } else if (!isCreatorOfProject(user, projectId) && !isSupervisor(userStatus) && !isAdmin(userStatus)) {
            renderUnauthorizedAction(req, res);
    } else {
            let datas = {};
            datas.linkToUpdateStatus = "/updating-member-status/" + projectId + "/" + req.params.username;
            datas.objective = "DU PROJET";
            datas.status = ["Member", "Moderator"];
            if (isCreatorOfProject(user, projectId)) datas.status.push("Creator");
            datas.actualStatus = selectedUserStatus;
            datas.username = req.params.username;
            res.render('moderationTools/update-user-status-form', datas);
    }
});

app.get('/updating-member-status/:projectId/:username', isAuthenticated, (req, res) => {
    if (res.locals.isAuthenticated) {
        renderError(req, res); 
    } else {
        let previousStatus = String(req.query.previousStatus).toLowerCase();
        let newStatus = String(req.query.newStatus).toLowerCase();
        let updatedUser = model.getUserId(req.params.username);
        if (previousStatus === newStatus)
            res.redirect('/membersList/' + req.params.projectId);
        else {
            if (newStatus === "creator") {
                let isUpdated = model.changeCreators(req.params.projectId, updatedUser);
            if (isUpdated) res.redirect('/membersList/' + req.params.projectId);
            else renderError(req, res);
            } else {
                let isUpdated = model.updateMemberStatus(req.params.projectId, updatedUser, newStatus);
                if (isUpdated === null || !isUpdated) renderError(req, res);
                else res.redirect('/membersList/' + req.params.projectId);
            }
        }
    }
});


app.get("/project-details/membership/:projectId", isAuthenticated, (req, res) => {
    let userEmail = req.session.user;
    let projectId = req.params.projectId;
    let errorOccured = false;
    if(isCreatorOfProject(userEmail, projectId)) {
        res.render('projects/name-new-creator', {"referer": req.headers.referer});
    }
    else if(model.isMember(userEmail, projectId)) {
        if(!model.removeMember(projectId, userEmail)){
            renderError(req, res);
        }else {
            res.redirect("/project-details/" + projectId);
        }
    }
    else {
        if(!model.addMember(projectId, userEmail)){
            renderError(req, res);
        }else {
            res.redirect("/project-details/" + projectId);
        }
    }
});











/**
 * 
 * 
 * 
 *              PROJECT EVENTS ROUTES
 * 
 * 
 * 
 */

app.get("/project-details/:projectId/create-event", isAuthenticated, (req, res) => {
    let userEmail = req.session.user;
    let projectId = req.params.projectId;
    if(!isCreatorOfProject(userEmail, projectId) && !isModerator(userEmail, projectId)) {
        renderUnauthorizedAction(req, res);
    }
    else {
        let today = new Date();
        let todaysDate = formatDateToString(today);
        let data = {};
        data["linkToRout"] = `/project-details/${projectId}/creating-event`;
        data["objective"] = "Créer";
        data["todaysDate"] = todaysDate;
        res.render("events/create-event-form", data);
    }
});

app.post("/project-details/:projectId/creating-event", isAuthenticated, (req, res) => {
    let creatorOfEvent = req.session.user;
    let projectId = req.params.projectId;
    let title = req.body.title;
    let date = req.body.date;
    let description = req.body.description;

    if(!isCreatorOfProject(creatorOfEvent, projectId) && !isModerator(creatorOfEvent, projectId)) {
        renderUnauthorizedAction(req, res);
    }
    else if(model.titleIsTaken(projectId, title)) {
        res.locals.titleIsTaken = true;

        let today = new Date();
        let todaysDate = formatDateToString(today);

        let data = {};
        data["linkToRout"] = `/project-details/${projectId}/creating-event`;
        data["objective"] = "Créer";
        data["title"] = title;
        data["description"] = description;
        data["date"] = date;
        data["todaysDate"] = todaysDate;
        res.render("events/create-event-form", data);
    }
    else{
        if(model.addEvent(projectId, title, description, creatorOfEvent, date)) {
            res.redirect("/project-details/" + projectId);
        }
        else{
            renderError(req, res);
        }
    }
});

app.get("/project-details/:projectId/:title/update-event", isAuthenticated, (req, res) => {
    let requestingUserEmail = req.session.user;
    let requestingUserStatus = req.session.userStatus;
    let projectId = req.params.projectId;
    let title = req.params.title;
    if(!isAdmin(requestingUserStatus) && !isSupervisor(requestingUserStatus) && !isCreatorOfProject(requestingUserEmail, projectId) && !isCreatorOfEvent(requestingUserEmail, projectId, title)) {
        res.locals.details = true;
        renderUnauthorizedAction(req, res);
    }
    else {
        let data = model.getEventDetails(projectId, title);
        if (data === null) renderError(req, res);
        else {

            let today = new Date();
            let todaysDate = formatDateToString(today);
            data["linkToRout"] = `/project-details/${projectId}/` + title + "/updating-event";
            data["objective"] = "Mettre à jour";
            data["todaysDate"] = todaysDate;
            res.render("events/create-event-form", data);
        }
    }
});

app.post("/project-details/:projectId/:previousTitle/updating-event", isAuthenticated, (req, res) => {
    let requestingUserEmail = req.session.user;
    let requestingUserStatus = req.session.userStatus;
    let projectId = req.params.projectId;
    let previousTitle = req.params.previousTitle;
    let newTitle = req.body.title;
    let description = req.body.description;
    let date = req.body.date;

    if (!isAdmin(requestingUserStatus) && !isSupervisor(requestingUserStatus) && !isCreatorOfProject(requestingUserEmail, projectId) && !isCreatorOfEvent(requestingUserEmail, projectId, previousTitle)) {
        res.locals.details = true;
        renderUnauthorizedAction(req, res);
    }
    else if (previousTitle !== newTitle && model.titleIsTaken(projectId, newTitle)) {
        res.locals.titleIsTaken = true;

        let today = new Date();
        let todaysDate = formatDateToString(today);

        let data = {};
        data["linkToRout"] = "/project-details/:projectId/" + previousTitle + "/updating-event";
        data["objective"] = "Mettre à jour";
        data["title"] = newTitle;
        data["description"] = description;
        data["date"] = date;
        data["todaysDate"] = todaysDate;
        res.render("events/create-event-form", data);
    }
    else {
        if (model.updateEvent(projectId, previousTitle, newTitle, description, date)) {
            res.redirect("/project-details/" + projectId);
        }
        else {
            renderError(req, res);
        }
    }
});


app.get("/project-details/:projectId/:title/delete-event", isAuthenticated, (req, res) => {
    let requestingUserEmail = req.session.user;
    let requestingUserStatus = req.session.userStatus;
    let projectId = req.params.projectId;
    let title = req.params.title;

    if (!isAdmin(requestingUserStatus) && !isSupervisor(requestingUserStatus) && !isCreatorOfProject(requestingUserEmail, projectId) && !isCreatorOfEvent(requestingUserEmail, projectId, title)) {
        res.locals.details = true;
        renderUnauthorizedAction(req, res);
    }
    else {
        let data = {};
        data["linkToRout"] = `/project-details/${projectId}/${title}/confirm-event-delete`;
        res.render("events/delete-event-form", data);
    }
});

app.get("/project-details/:projectId/:title/confirm-event-delete", isAuthenticated, (req, res) => {
    let requestingUserEmail = req.session.user;
    let requestingUserStatus = req.session.userStatus;
    let projectId = req.params.projectId;
    let title = req.params.title;
    let word = req.query.word.toUpperCase();

    if(!isAdmin(requestingUserStatus) && !isSupervisor(requestingUserStatus) && !isCreatorOfProject(requestingUserEmail, projectId) && !isCreatorOfEvent(requestingUserEmail, projectId, title)) {
        renderUnauthorizedAction(req, res);
    }
    else if (word === "SUPPRIMER") {
        if (model.removeEvent(projectId, title)) {
            let data = {};
            data["linkToNext"] = "/project-details/" + projectId;
            res.render("multiUsage/delete-confirmation", data);
        }
        else {
            res.locals.deleteFailure = true;
            res.render("events/delete-event-form");
        }
    }
    else {
        res.locals.wrongWord = true;
        res.render("events/delete-event-form");
    }
});

app.get('/search-form', (req, res) => {
    let categories = [{name: "all", value: "Toutes les catégories"}].concat(model.allCategories);
    categories = preSelectCategory("Toutes les catégories", categories);
    res.render('search-form', {categories});
});

app.get('/search', (req, res) => {
    let category = req.query.category;
    let keywords = req.query.keywords;
    let projects = model.searchProjects(category, keywords);
    
    let categories = [{name: "all", value: "Toutes les catégories"}].concat(model.allCategories);
    let datas = {category: "selected", "keywords": keywords};   
    datas.projects = projects;
    datas.numberOfResults = projects.length + (projects.length > 1 ? " résultats" : " résultat");
    categories = preSelectCategory(category, categories);
    datas.categories = categories;
    datas.keywords = keywords;
    res.render('search-form', datas);
});

function preSelectCategory(category, arrayOfCategories) {
    for (let i = 0 ; i < arrayOfCategories.length ; i++) {
        if (arrayOfCategories[i].value === category) {
            arrayOfCategories[i]["select"] = "selected";
        } else {
            arrayOfCategories[i]["select"] = "";
        }
    }
    return arrayOfCategories;
}






app.use((req, res, next) => {
    res.send("404 Not Found URL : " + req.url);
    next();
});

/***
 * =============================================
 * |           INTERNAL FUNCTIONS              |
 * =============================================
 */

function getCategoriesInArray(body) {
    let allCategories = model.allCategories;
    let categories = [];
    for (let i = 0 ; i < allCategories.length ; i++) {
        let catName = allCategories[i].name;
        let catValue = allCategories[i].value;
        if (body[catName] === undefined) continue;
        categories.push(catValue);
    }
    return categories;
}

function addCheckedToCategories(categoriesToString, target) {
    let allCategories = model.allCategories;
    for(let i = 0 ; i < allCategories.length ; i++) {
        target[i]["check"] = categoriesToString.includes(allCategories[i].value) ? "checked" : "";
    }
    return target;
}

function isAdmin(userStatus) {
    return userStatus === "administrator";
}

function isSupervisor(userStatus) {
    return userStatus === "supervisor";
}

function isCreatorOfProject(userEmail, projectId) {
    return model.getCreatorOfProject(projectId) === userEmail;
}

function isModerator(userEmail, projectId) {
    return model.getUserProjectStatus(userEmail, projectId) === "moderator";
}

function isCreatorOfEvent(userEmail, projectId, title) {
    return model.getCreatorOfEvent(projectId, title) === userEmail;
}

function renderError(req, res) {
    res.render('errors/unexpectedError', {'referer': req.headers.referer});
}

function renderUnauthorizedAction(req, res) {
    res.render('errors/unauthorized-action', {"referer": req.headers.referer});
}

function setProjectStatus(user, userStatus, projectId, details) {
    let status = model.getUserStatus(user, projectId);
    if (isCreatorOfProject(user, projectId)) {
        details.isCreatorOfProject = true;
    } else if (isAdmin(userStatus) || isSupervisor(userStatus)) {
        details.isSupervisorOrAbove = true;
    } else if(isModerator(user, projectId)) {
        details.isModerator = true;
    }
    if (isAdmin(userStatus) || isSupervisor(userStatus) || isCreatorOfProject(user, projectId) || isModerator(user, projectId)) {
        details.isModeratorOrAbove = true;
    }
}

function formatDateToString(date) {
    var dd = (date.getDate() < 10 ? '0' : '') + date.getDate(); 
    var MM = ((date.getMonth() + 1) < 10 ? '0' : '') + (date.getMonth() + 1);
    var yyyy = date.getFullYear();
    return (yyyy + "-" + MM + "-" + dd);
}
