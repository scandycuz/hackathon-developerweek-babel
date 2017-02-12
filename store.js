'use strict';

var db = {
  users: {}
}

exports.saveToken = function(userId, token) {
  db.users[userId] = token;
  return  {status: 200 };
}

module.exports = exports;
