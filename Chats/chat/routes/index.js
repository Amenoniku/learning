var User, app, checkAuth, express, router;

express = require('express');

router = express.Router();

User = require('../modelsDB/user').User;

checkAuth = require('../middleware/checkAuth');

app = express();


/* GET home page. */

router.get('/', function(req, res, next) {
  return res.render('index', {
    title: 'Главная',
    body: "до свидание"
  });
});

router.route("/login").get(function(req, res, next) {
  return res.render("login", {
    title: "Логин"
  });
}).post(require("./login").post);

router.route("/logout").post(function(req, res) {
  console.log("out");
  req.session.destroy();
  return res.redirect("/");
});

router.get("/chat", checkAuth, function(req, res, next) {
  return res.render("chat");
});

module.exports = router;
