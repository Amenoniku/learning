var AuthError, HttpError, User;

User = require('../modelsDB/user').User;

AuthError = require('../modelsDB/user').AuthError;

HttpError = require('../error').HttpError;

exports.get = function(req, res) {
  return res.render("login", {
    title: "Логин"
  });
};

exports.post = function(req, res, next) {
  var password, username;
  username = req.body.username;
  password = req.body.password;
  console.log(username, password);
  return User.authorize(username, password, function(err, user) {
    if (err) {
      if (err instanceof AuthError) {
        return next(new HttpError(403, err.message));
      } else {
        return next(err);
      }
    }
    req.session.user = user._id;
    return res.send({});
  });
};
