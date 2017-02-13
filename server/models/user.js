'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    userid: DataTypes.STRING
    token: DataTypes.STRING
    langauge: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return User;
};
