var promise = require('bluebird');
var config = require('./config.js');

var MsTranslator = require('mstranslator');
var client = new MsTranslator({
  api_key: "c7b746b6d89343349a301d7f5e19a9a1" // use this for the new token API.
}, true);

var flock = require('flockos');

var options = {
  // Initialization Options
  promiseLib: promise
};

var languages = require('./languages');

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://https://flock-babel.herokuapp.com/babeldb';
var db = pgp(connectionString);

// add query functions

module.exports = {
  saveToken: saveToken,
  retrieveUsers: retrieveUsers,
  retrieveUserMessages: retrieveUserMessages,
  setTranslationLanguage: setTranslationLanguage
};

var fullTranslationLanguage = "English";
var translationLanguage = "en";

function saveToken(req, res, next) {
  var user = {userId: req.userId, token: req.token};
  db.none("INSERT INTO users(userId, token) VALUES(${userId}, ${token})", user)
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
  var originalInput = language;
  fullTranslationLanguage = language;
  if (languages[`${language}`]) {
    language = languages[`${language}`];
    targetLanguage = language;
    var message = `Translation language set to ${originalInput}`;
    var params = {
      text: message,
      to: targetLanguage
    };
    client.translate(params, function(err, data) {
      callback(null, {text: data});
    });
  } else {
    var message = "That language is not availabe for translation";
    var params = {
      text: message,
      to: targetLanguage
    };
    client.translate(params, function(err, data) {
      callback(null, {text: data});
    });
  }
}

function sendTranslation(originalMessage, translation, user) {
  flock.chat.sendMessage(config.botToken, {
    to: user.userid,
    text: `${fullTranslationLanguage} translation for \'${originalMessage}\':\n${translation}`
  });
}

function translateMessages(messages, user) {
  for (var i = 0; i < messages.length; i++) {
    var text = messages[i].text;

    var params = {
      text: text,
      to: targetLanguage
    };
    client.translate(params, function(err, data) {
      sendTranslation(text, data, user);
    });
  }
}

function retrieveUserMessages(event, callback) {
  db.one('select * from users where userid = $1', event.userId)
  .then(function (user) {
    var token = user.token;
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
        translateMessages(messages, user);
      }
    });
  });
}





//
