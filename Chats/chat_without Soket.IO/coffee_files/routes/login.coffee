User = require('../modelsDB/user').User
AuthError = require('../modelsDB/user').AuthError
HttpError = require('../error').HttpError

exports.get =(req, res) ->
	res.render "login", 
		title: "Логин"

exports.post =(req, res, next) ->
	username = req.body.username
	password = req.body.password
	console.log username, password

	User.authorize username, password, (err, user) ->
		if err
			if err instanceof AuthError
				return next new HttpError 403, err.message
			else
				return next err
		req.session.user = user._id
		res.send {}

# (err, user) ->
# 		next err if err
# 		req.session.user = user._id
# 		res.send {}