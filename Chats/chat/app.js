var HttpError, MongoStore, app, bodyParser, config, cookieParser, database, errorhandler, express, favicon, logger, mongoose, mongooseStore, path, routes, session, sessionStore, users;

express = require('express');

path = require('path');

favicon = require('serve-favicon');

logger = require('morgan');

cookieParser = require('cookie-parser');

bodyParser = require('body-parser');

session = require('express-session');

errorhandler = require('errorhandler');

MongoStore = require('connect-mongo')(session);

config = require('./config');

routes = require('./routes/index');

users = require('./routes/users');

database = require('./database');

mongoose = require('./libs/mongoose');

HttpError = require('./error').HttpError;

mongooseStore = new MongoStore({
  mongooseConnection: mongoose.connection
});

app = express();

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(cookieParser());

sessionStore = require("./libs/sessionSrote");

app.use(session({
  secret: config.get("session:secret"),
  key: config.get("session:key"),
  cookie: config.get("session:cookie"),
  saveUninitialized: true,
  resave: true,
  store: sessionStore
}));

app.use(require("./middleware/sendHttpError"));

app.use(express["static"](path.join(__dirname, 'public')));

app.use(require("./middleware/loadUser"));

app.use('/', routes);

app.use('/users', users);

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'jade');

app.use(function(err, req, res, next) {
  console.log(err);
  if (typeof err === 'number') {
    err = new HttpError(err);
  }
  if (err instanceof HttpError) {
    res.sendHttpError(err);
  } else {
    if (app.get('env') === 'development') {
      express.errorHandler()(err, req, res, next);
    } else {
      err = new HttpError(500);
      res.sendHttpError(err);
    }
  }
});

module.exports = app;
