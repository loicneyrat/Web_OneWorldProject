let express = require('express');
let app = express();
let mustache = require('mustache-express');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const model = require('./model/model.js');

app.listen(3000, () => console.log("Server running on port 3000"));

//let model = require('./model/model.js');


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
    let isAdmin = req.session.userStatus === "administrator";
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
    else if (model.getUserStatus(userEmail) === 'administrator' || 'supervisor')
        res.render('delete-user-form', {"username" : req.params.username});
    else {
        res.render('unauthorized-action');
        //setTimeout(() => res.redirect('/'), 5000);
    }
});

app.get('/confirm-user-delete', (req, res) => {
    let word = req.query.delete.toUpperCase();
    if (word === "SUPPRIMER") {
        let userEmail = model.getUserId(req.query.username);
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
    let userStatus = model.getUserStatus(req.session.user);
    if (userStatus !== "administrator" && userStatus !== "supervisor") {
        res.render('unauthorized-action', {referer: req.headers.referer});
        //setTimeout(res.redirect('/'), 5000); Ne fonctionne pas (cause une erreur d'exécution) Ajout d'un bouton qui renvoie vers la page précédente.
    } else {
        let usersList = model.getUsersList();
        res.render('users-list', {"usersList": usersList});
    }
});

app.get('/create-project-form', (req, res) => {
    res.render('create-project-form');
});

app.post('/creating-project', (req, res) => {
    let recyclage = req.body.recyclage === "on" ? "recyclage" : "";
    let lobbying = req.body.lobbying === "on" ? "lobbying" : "";
    let nettoyage = req.body.cleaning === "on" ? "nettoyage" : "";
    let aide = req.body.person === "on" ? "aide" : "";
    let sensibilisation = req.body.sensibilisation === "on" ? "sensib" : "";
    let categories = recyclage + ", " + lobbying + ", " + nettoyage + ", " + aide + ", " + sensibilisation;
    let result = model.createProject(req.body.title, req.body.description, "Category", req.session.user, String(new Date()), req.body.keywords);
    res.redirect('/create-project-form');
});

app.use((req, res, next) => {
    res.send("404 Not Found URL : " + req.url);
    next();
});

