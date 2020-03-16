let express = require('express');
let app = express();
let mustache = require('mustache-express');
let resources = require('./resourcesServer.js');

let model = require('./model/model.js');


app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', './views');


app.use('/styles', resources);


app.get('/', (req, res) => {
    res.render('index.html');
});

app.get('/#', (req, res) => {
    res.redirect('/');
});

app.use((req, res, next) => {
    res.sendStatus(404);
    res.send("404 Not Found");
    next();
});

