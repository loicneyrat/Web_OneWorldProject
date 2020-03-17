let express = require('express');
let app = express();

let icons_link = "/node_modules/bootstrap-icons/icons"

app.get('/style.css', (req, res) => {
    res.set('Content-Type', 'text/css');
    res.sendFile(__dirname + '/styles/style.css');
});

app.get('/112868.jpg', (req, res) => {
    res.set('Content-Type', 'image/jpg');
    res.sendFile(__dirname + '/resources/112868.jpg');
});

app.get('/earth-icon.png', (req, res) => {
    res.set('Content-Type', 'image/png');
    res.sendFile(__dirname + '/resources/earth-icon.png');
});

app.get('/bg-faded-blue.png', (req, res) => {
    res.set('Content-Type', 'image/png');
    res.sendFile(__dirname + '/resources/bg-faded-blue.png');
})

app.get('/person-fill.svg', (req, res) => {
    console.log(req.url);
    res.set('Content-Type', 'image/webp');
    res.sendFile(__dirname + icons_link + "/person-fill.svg");
});



module.exports = app;