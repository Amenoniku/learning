var ObjectID, User, express, router;

express = require('express');

router = express.Router();

User = require('../modelsDB/user').User;

ObjectID = require('mongodb').ObjectID;


/* GET users listing. */

router.get('/', function(req, res, next) {
  return User.find({}, function(err, users) {
    if (err) {
      next(err);
    }
    return res.json(users);
  });
});

router.get("/:id", function(req, res, next) {
  var id;
  id = new ObjectID(req.params.id);
  return User.findById(id, function(err, user) {
    var error;
    if (err) {
      next(err);
    }
    if (!user) {
      error = {
        title: "Пользователи",
        error: "Ошибка",
        message: "Пользователь ненайден"
      };
      return res.render("error", error);
    }
    return res.json(user);
  });
});

module.exports = router;
