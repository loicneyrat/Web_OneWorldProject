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

app.use(cookieSession({secret: 'WeLoveBeingConfined'}));
app.use(isAuthenticated);
app.use(bodyParser.urlencoded({extended : false}));

app.use('/styles', express.static(__dirname + '/styles'));
app.use('/resources', express.static(__dirname + '/resources'));


function isAuthenticated(req, res, next) {
    res.locals.authenticated = req.session.user !== undefined;
    next();
}

app.get('/', (req, res) => {
    res.render('index.html');
});

app.get('/signup-form', (req, res) => {
    res.render('signup-form');
});

app.post('/signup', (req, res) => {
    let email = req.body.mail;
    let username = req.body.username;
    let password = req.body.pwd;
    let confirmedPassword = req.body.verifpwd;

    if (password !== confirmedPassword) {
        res.locals.pwdNotConfirmed;
        res.render('signup-form');
    }

    let checkResult = model.credentialsAreFree(email, username);
    if (checkResult === -1) {
        res.locals.emailTaken = true;
        res.render('signup-form');
    }
    else if (checkResult === -2) {
        res.locals.usernameTaken = true;
        res.render('signup-form');
    }
    else {
        let regular = "normal";
        model.createUser(email, username, password, regular);
        req.session.user = email;
        res.redirect('/home');
    }
});

app.get('/login-form', (req, res) => {
    res.render('login-form');
});

app.post('/login', (req, res) => {
    let email = req.body.mail;
    let password = req.body.password;
    if (model.isTheRightPassword(email, password)) {
        req.session.user = email;
        req.session.userStatus = model.getUserStatus(email);
        res.redirect('/home');
    }
    else {
        res.locals.wrongCredentials = true;
        res.render('login-form');
    }
});

app.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/');
});

app.get('/home', (req, res) => {
    if (!res.locals.authenticated) {
        res.locals.wrongCredentials = true;
        res.render('login-form');
    } else {
    let isAdmin = isAdmin(req.session.user);
    let username = model.getUsername(req.session.user);
    let projects = model.getProjects(req.session.user);
    res.render('home', {"isAdmin": isAdmin, "username": username, "projects": projects});
    }
});

app.get('/#', (req, res) => {
    res.redirect('/');
});

app.get('/confirm-user-delete/:username', (req, res) => {
    let userEmail = model.getUserId(req.params.username);
    
    if (req.session.user === userEmail)
        res.render('delete-user-form', {"username" : req.params.username});
    else if (isAdmin(req.session.user) || isSupervisor(req.session.user))
        res.render('delete-user-form', {"username" : req.params.username});
    else {
        res.render('unauthorized-action', {"referer": req.headers.referer});
        //setTimeout(() => res.redirect('/'), 5000);
    }
});

app.get('/confirm-user-delete', (req, res) => {
    let userEmail = model.getUserId(req.params.username);
    let word = req.query.delete.toUpperCase();

    if(!isAdmin(userEmail) || !isSupervisor(userEmail) || req.session.user !== userEmail) {
        res.render('unauthorized-action', {"referer": req.headers.referer});
    }
    else if(word === "SUPPRIMER") {
        if (model.deleteUser(userEmail)){
            res.render('delete-confirmation');
            //setTimeout(() => res.redirect('/'), 5000);
        }
        else {
            res.locals.deleteFailure = true;
            res.render('delete-user-form', {"username" : req.query.username});
            }
        }
    else {
        res.locals.wrongWord = true;
        res.render('delete-user-form', {"username": req.query.username});
    }
});

app.get('/change-password-form', (req, res) => {
    res.render('change-password-form');
});

app.post('/update-password', (res, req) => {
    let oldPassword = req.body.oldPwd;
    let newPassword = req.body.newPwd;
    let confirmedPassword = req.body.verifpwd;
    let userEmail = req.session.email;
    if(!model.isTheRightPassword(userEmail, oldPassword)) {
        res.locals.wrongPassword = true;
        res.render('change-password-form')
    }
    else if(newPassword !== confirmedPassword) {
        res.locals.pwdNotConfirmed = true;
        res.render('change-password-form');
    }
    else {
        if(model.updateUserPassword(req.session.user, newPassword)) {
            res.render('update-confirmation');
            //setTimeout(5000, res.redirect('/home'));
        }
        else {
            res.locals.updateFailure = true;
            res.render('/change-password-form');
        }
    }
});

app.get('/update-username-form', (req, res) => {
    res.render('change-username-form');
});

app.post('/update-username', (req, res) => {
    let username = req.body.username;
    let password = req.body.pwd;
    let checkResult = model.credentialsAreFree(req.session.user, username);

    if (password !== model.getUserPassword(req.session.user)) {
        res.locals.wrongPassword = true;
        res.render('update-username-form', {"username" : username});
    }
    else if (checkResult === -2) {
        res.locals.usernameTaken = true;
        res.render('update-username-form');
    }
    else {
        if (model.updateUserUsername(req.session.user, username)) {
            res.render('update-confirmation');
            //setTimeout(5000, res.redirect('/home'));
        }
        else {
            res.locals.updateFailure = true;
            res.render('update-username-form', {"username" : username});
        }
    }
});

app.get('/usersList', (req, res) => {
    
    if (!isAdmin(req.session.user) && !isSupervisor(req.session.user)) {
        res.render('unauthorized-action', {"referer": req.headers.referer});
        //setTimeout(res.redirect('/'), 5000); Ne fonctionne pas (cause une erreur d'exécution) Ajout d'un bouton qui renvoie vers la page précédente.
    } else {
        let usersList = model.getUsersList();
        let dictionnary = {};
        dictionnary["usersList"] = usersList;
        dictionnary["linkToDelete"] = "/confirm-user-delete/";
        res.render('users-list', dictionnary);
    }
});

app.get('/create-project-form', (req, res) => {
    let fields = {"objective" : "Créer", "linkToRout" : "/creating-project"};
    res.render('create-project-form', fields);
});

app.post('/creating-project', (req, res) => {
    let categories = getCategoriesArray(req.body);
    let keywords = req.body.keywords.split(', ');
    let result = model.createProject(req.body.title, req.body.description, categories, req.session.user, String(new Date()), keywords);
    res.redirect('/home');
});

app.get('/update-project-form/:projectId', (req, res) => {
    let fields = model.getProjectDetails(req.params.projectId);
    if(fields === null) res.render("unexpectedError", {"referer": req.headers.referer});
    fields["objective"] = "Mettre à jour";
    fields["linkToRout"] = "/updating-project/" + req.params.projectId;
    addCheckedToCategories(fields.categories, fields);
    res.render('create-project-form', fields);
});

app.post('/updating-project/:projectId', (req, res) => {
    let categories = getCategoriesArray(req.body);
    let keywords = req.body.keywords.split(', ');
    let result = model.updateProject(req.params.projectId, req.body.title, req.body.description, categories, keywords);
    if(result === null) res.render('unexpectedError', {"referer": req.headers.referer});
    res.redirect('/projects/:projectId');
});

app.get('/delete-project/:projectId', (req, res) => {
    let user = req.session.user;
    if(creator === null) res.render('unexpectedError', {"referer": req.headers.referer});
    if(isAdmin(user) || isSupervisor(user) || isCreator(user, req.params.user)){
        res.render("unauthorized-action", {"referer": req.headers.referer});
    }
    else {
        res.render("delete-project-form", {"projectId": req.params.projectId});
    }
});

app.get('/confirm-project-delete', (req, res) => {
    let userEmail = model.getUserId(req.params.username);
    let word = req.query.delete.toUpperCase();
    let projectId = req.query.projectId;

    if(!isAdmin(userEmail) || !isSupervisor(userEmail) || isCreator(userEmail, projectId)) {
        res.render('unauthorized-action', {"referer": req.headers.referer});
    }
    else if(word === "SUPPRIMER") {
        if (model.deleteProject(projectId)){
            res.render('delete-confirmation');
            //setTimeout(() => res.redirect('/'), 5000);
        }
        else {
            res.locals.deleteFailure = true;
            res.render('delete-project-form', {"projectId" : prrojectId});
            }
        }
    else {
        res.locals.wrongWord = true;
        res.render('delete-project-form', {"projectId" : prrojectId});
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

function isAdmin(userEmail) {
    return req.session.userStatus === "administrator";
}

function isSupervisor(userEmail) {
    return req.session.userStatus === "supervisor";
}

function isCreator(userEmail, projectId) {
    return model.getCreator(projectId) === userEmail;
}

function isModerator(userEmail, projectId) {
    return model.getMemberStatus(userEmail, projectId) === "moderator";
}