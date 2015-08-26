express = require 'express'
path = require 'path'
favicon = require 'serve-favicon'
logger = require 'morgan'
cookieParser = require 'cookie-parser'
bodyParser = require 'body-parser'
session = require 'express-session'
errorhandler = require 'errorhandler'
MongoStore = require('connect-mongo')(session);
config = require './config'
routes = require './routes/index'
users = require './routes/users'
database = require './database'
mongoose = require './libs/mongoose'
HttpError = require('./error').HttpError

mongoose_store = new MongoStore mongooseConnection: mongoose.connection

app = express()

# uncomment after placing your favicon in /public
app.use favicon path.join __dirname, 'public', 'favicon.ico'
app.use logger 'dev'
app.use bodyParser.json()
app.use bodyParser.urlencoded extended: false
app.use cookieParser()
app.use session {
	secret: config.get "session:secret"
	key: config.get "session:key"
	cookie: config.get "session:cookie"
	saveUninitialized: true
	resave: true
	store: mongoose_store
}
app.use require "./middleware/sendHttpError"
# 	req.session.numberOfVisits = req.session.numberOfVisits + 1 || 1;
# 	res.send "Visits: " + req.session.numberOfVisits
app.use express.static path.join __dirname, 'public'
app.use require "./middleware/loadUser"
app.use '/', routes
app.use '/users', users
# require("./routes")(app)
# view engine setup
app.set 'views', path.join(__dirname, 'views')
app.set 'view engine', 'jade'

app.use (err, req, res, next) ->
	if typeof err == 'number'
		err = new HttpError(err)
	if err instanceof HttpError
		res.sendHttpError err
	else
		if app.get('env') == 'development'
			express.errorHandler() err, req, res, next
		else
			# console.log error err
			err = new HttpError(500)
			res.sendHttpError err
	return

module.exports = app
