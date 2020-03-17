let express = require('express');
let app = express();

let img_link = __dirname + "/resources";
let styesheet_link = __dirname + "styles";

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
    res.set('Content-Type', 'image/svg');
    res.sendFile(img_link + "/person-fill.svg");
});



module.exports = app;