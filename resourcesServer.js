let express = require('express');
let app = express();

app.get('/styles.css', (req, res) => {
    res.sendFile(__dirname + '/style.css');
});




module.exports = this;