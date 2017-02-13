var config = require('./config.js');
var flock = require('flockos');
var express = require('express');
const http = require('http');

var db = require('./queries');

var favicon = require('serve-favicon');

flock.appId = config.appId;
flock.appSecret = config.appSecret;

var app = express();
var port = parseInt(process.env.PORT, 10) || 3000;
app.set('port', port);
var server = http.createServer(app);
server.listen(port, function() {
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});


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

module.exports = app;
