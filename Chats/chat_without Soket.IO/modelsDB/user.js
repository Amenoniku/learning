var AuthError, Schema, async, crypto, http, mongoose, path, schema, util;

crypto = require('crypto');

mongoose = require('../libs/mongoose');

async = require('async');

path = require('path');

util = require('util');

http = require('http');

Schema = mongoose.Schema;

schema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    "default": Date.now
  }
});

schema.methods.encryptPassword = function(password) {
  return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

schema.virtual('password').set(function(password) {
  this._plainPassword = password;
  this.salt = Math.random() + '';
  this.hashedPassword = this.encryptPassword(password);
}).get(function() {
  return this._plainPassword;
});

schema.methods.checkPassword = function(password) {
  return this.encryptPassword(password) === this.hashedPassword;
};

schema.statics.authorize = function(username, password, callback) {
  var User;
  User = this;
  return async.waterfall([
    function(callback) {
      return User.findOne({
        username: username
      }, callback);
    }, function(user, callback) {
      if (user) {
        if (user.checkPassword(password)) {
          return callback(null, user);
        } else {
          return callback(new AuthError("Неверный пароль"));
        }
      } else {
        user = new User({
          username: username,
          password: password
        });
        return user.save(function(err) {
          if (err) {
            callback(err);
          }
          return callback(null, user);
        });
      }
    }
  ], callback);
};

exports.User = mongoose.model('User', schema);

AuthError = (function() {
  function AuthError(message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, AuthError);
    this.message = message;
  }

  return AuthError;

})();

util.inherits(AuthError, Error);

exports.AuthError = AuthError;
