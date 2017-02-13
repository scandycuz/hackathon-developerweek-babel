var config = require('./config.js');
var flock = require('flockos');
var express = require('express');
var store = require('./store.js');

var db = require('./queries');

flock.appId = config.appId;
flock.appSecret = config.appSecret;

var app = express();
var port = process.env.PORT || 3000;
app.listen(port);
console.log("Listening on port " + port);

app.get("/", function(req, res) {
  res.send(`<div style='width: 100%;
            height: 100%;
            display:flex;
            justify-content: center;
            align-items:center;'>
            <h1>Babel</h1></div>`);
});

app.post('/users', db.saveToken);
app.get('/users', db.retrieveUsers);

app.use(flock.events.tokenVerifier);
app.post('/events', flock.events.listener);

flock.events.on('app.install', db.saveToken);
flock.events.on('client.messageAction', db.retrieveUserMessages);
flock.events.on('client.slashCommand', db.setTranslationLanguage);
