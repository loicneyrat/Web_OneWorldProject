let express = require('express');
let app = express();

let img_link = __dirname + "/resources";
let stylesheet_link = __dirname + "styles";

app.get('/style.css', (req, res) => {
    res.set('Content-Type', 'text/css');
    res.sendFile(__dirname + '/styles/style.css');
});

app.get('/*', (req, res) => {
    res.set('Content-Type', 'image/webp');
    res.sendFile(img_link + req.url);
});

app.get('/earth-icon.png', (req, res) => {
    res.set('Content-Type', 'image/png');
    res.sendFile(__dirname + '/resources/earth-icon.png');
});

app.get('/bg-faded-blue.png', (req, res) => {
    res.set('Content-Type', 'image/png');
    res.sendFile(__dirname + '/resources/bg-faded-blue.png');
})




module.exports = app;