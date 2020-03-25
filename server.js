let express = require('express');
let app = express();
let mustache = require('mustache-express');
let resources = require('./resourcesServer.js');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const model = require('./model/model.js');

app.listen(3000, () => console.log("Server running on port 3000"));

//let model = require('./model/model.js');


app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', './views');


app.use('/styles', resources);
app.use('/resources', resources);
app.use(cookieSession({secret: 'WeLoveBeingConfined'}));
app.use(isAuthenticated);
app.use(bodyParser.urlencoded({extended : false}));


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
        model.createUser(email, username, password, regular);
        req.session.user=email;
        res.redirect('/home');
    }
});

app.get('/login-form', (req, res) => {
    res.render('login-form');
});

app.post('/login', (req, res) => {
    let email = req.body.mail;
    let password = req.body.password;

    if (model.login(email, password)) {
        req.session.user=email;
        res.redirect('/home');
    }
    else {
        res.locals.wrongCredentials;
        res.render('login-form');
    }
});

app.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/');
});

app.get('/#', (req, res) => {
    res.redirect('/');
});

app.use((req, res, next) => {
    res.sendStatus(404);
    res.send("404 Not Found");
    next();
});

