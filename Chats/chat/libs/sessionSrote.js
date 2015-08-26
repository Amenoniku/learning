var MongoStore, mongoose, session, sessionStore;

session = require('express-session');

mongoose = require('mongoose');

MongoStore = require('connect-mongo')(session);

sessionStore = new MongoStore({
  mongooseConnection: mongoose.connection
});

module.exports = sessionStore;
