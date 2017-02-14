var promise = require('bluebird');
var config = require('./config.js');
var express = require('express');

var MsTranslator = require('mstranslator');
var client = new MsTranslator({
  api_key: "c7b746b6d89343349a301d7f5e19a9a1" // use this for the new token API.
}, true);

var app = express();

var flock = require('flockos');

var languages = require('./languages');

var pgp = require('pg-promise')(options);
var options = {
  // Initialization Options
  promiseLib: promise
};
pgp.pg.defaults.ssl = true;

// development database
if (app.settings.env === "development") {
  var connectionString = 'postgres://localhost:5432/babeldb';
}
// production database
if (app.settings.env === "production") {
  var connectionString = 'postgres://udqlmldvxupapd:7aec70c86d9ad585c5342773c19f29db9a7d02111c2c19537acfa96dbd4778d6@ec2-54-243-55-1.compute-1.amazonaws.com:5432/dehb0buqj333e7';
}

var db = pgp(connectionString);


// add query functions

module.exports = {
  saveToken: saveToken,
  retrieveUsers: retrieveUsers,
  retrieveUserMessages: retrieveUserMessages,
  setTranslationLanguage: setTranslationLanguage
};

function saveToken(req, res, next) {
  var user = {userId: req.userId, token: req.token, language: "English"};
  db.none("INSERT INTO users(userId, token, language) VALUES(${userId}, ${token}, ${language})", user)
    .then(function (data) {
      res();
    })
    .catch(function (err) {
      return next(err);
    });
}

function retrieveUsers(req, res, next) {
  var userId = parseInt(req.params.id);
  db.any('select * from users')
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved all users'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function setTranslationLanguage(event, callback) {
  var language = event.text.split(" ").slice(1).join(" ");
  language = language[0].toUpperCase() + language.slice(1);
  var longLanguage = language;
  if (languages[`${language}`]) {
    language = languages[`${language}`];
    var message = `Translation language set to ${longLanguage}`;
    var params = {
      text: message,
      to: language
    };
    client.translate(params, function(err, data) {
      callback(null, {text: data});
    });
    var userId = event.userId;
    db.none('UPDATE users SET language=$1 WHERE userid=$2', [longLanguage, userId])
      .then(function (data) {
        return console.log(`Language set to ${longLanguage}`);
      })
      .catch(function (err) {
        return console.log(err);
      });
  } else {
    db.one('select * from users where userid = $1', event.userId)
    .then(function (user) {
      var token = user.token;
      longLanguage = user.language;
      language = languages[`${longLanguage}`];
      var message = "That language is not availabe for translation";
      var params = {
        text: message,
        to: language
      };
      client.translate(params, function(err, data) {
        callback(null, {text: data});
      });
    });
  }
}

function sendTranslation(originalMessage, translation, user, language) {
  flock.chat.sendMessage(config.botToken, {
    to: user.userid,
    text: `${language} translation for \'${originalMessage}\':\n${translation}`
  });
}

function translateMessages(messages, user, language) {
  for (var i = 0; i < messages.length; i++) {
    var text = messages[i].text;
    var shortLanguage = languages[`${language}`];
    var params = {
      text: text,
      to: shortLanguage
    };
    client.translate(params, function(err, data) {
      sendTranslation(text, data, user, language);
    });
  }
}

function retrieveUserMessages(event, callback) {
  db.one('select * from users where userid = $1', event.userId)
  .then(function (user) {
    var token = user.token;
    var language = user.language;
    var chat = event.chat;
    var uids = event.messageUids;
    flock.chat.fetchMessages(token, {
      chat: chat,
      uids: uids
    }, function(error, messages) {
      if (error) {
        console.warn(error);
        callback(error);
      } else {
        translateMessages(messages, user, language);
      }
    });
  });
}





//
