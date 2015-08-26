var User, async, createUsers, dropDatabase, mongoose, open, requireModels;

mongoose = require('./libs/mongoose');

User = require('./modelsDB/user').User;

async = require('async');

open = function(callback) {
  return mongoose.connection.on("open", callback);
};

dropDatabase = function(callback) {
  var db;
  db = mongoose.connection.db;
  return db.dropDatabase(callback);
};

requireModels = function(callback) {
  require('./modelsDB/user');
  return async.each(Object.keys(mongoose.models), function(modelName, callback) {
    return mongoose.models[modelName].ensureIndexes(callback);
  }, callback);
};

createUsers = function(callback) {
  var users;
  users = [
    {
      username: "Вася1",
      password: "supernov41a"
    }, {
      username: "Вася2",
      password: "supern4ova"
    }, {
      username: "Вася3",
      password: "superno6va"
    }
  ];
  return async.each(users, function(userData, callback) {
    var user;
    user = new User(userData);
    return user.save(callback);
  }, callback);
};

async.series([open, requireModels], function(err, result) {
  console.log(arguments);
  return mongoose.disconnect;
});
