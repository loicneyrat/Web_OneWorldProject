let express = require('express');
let app = express();

app.get('/style.css', (req, res) => {
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



module.exports = app;