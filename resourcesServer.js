let express = require('express');
let app = express();

let img_link = __dirname + "/resources";
let stylesheet_link = __dirname + "styles";

app.get('/style.css', (req, res) => {
    res.set('Content-Type', 'text/css');
    res.sendFile(__dirname + '/styles/style.css');
});

app.get('/112868.jpg', (req, res) => {
    res.set('Content-Type', 'image/jpg');
    res.sendFile(img_link+ '/112868.jpg');
});

app.get('/earth-icon.png', (req, res) => {
    res.set('Content-Type', 'image/png');
    res.sendFile(__dirname + '/resources/earth-icon.png');
});

app.get('/bg-faded-blue.png', (req, res) => {
    res.set('Content-Type', 'image/png');
    res.sendFile(__dirname + '/resources/bg-faded-blue.png');
})

app.get('/*.svg', (req, res) => {
    res.set('Content-Type', 'image/svg');
    res.sendFile(img_link + req.url);
});



module.exports = app;