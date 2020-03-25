let express = require('express');
let app = express();
let mustache = require('mustache-express');
let resources = require('./resourcesServer.js');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');

app.listen(3000, () => console.log("Server running on port 3000"));

//let model = require('./model/model.js');


app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', './views');


app.use('/styles', resources);
app.use('/resources', resources);
app.use(cookieSession({secret: 'WeLoveBeingConfined'}));
app.use(isAuthenticated);
app.use(bodyParser.urlencoded({extended = false}));


function isAuthenticated(req, res, next) {
    res.locals.authenticated = req.session.user != undefined;
}

app.get('/', (req, res) => {
    res.render('index.html');
});

app.get('/login-form', (req, res) => {
    res.render('login-form');
});

app.get('/signup-form', (req, res) => {
    res.render('signup-form');
});

app.get('/#', (req, res) => {
    res.redirect('/');
});

app.use((req, res, next) => {
    res.sendStatus(404);
    res.send("404 Not Found");
    next();
});

