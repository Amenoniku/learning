crypto = require('crypto')
mongoose = require('../libs/mongoose')
async = require 'async'
path = require 'path'
util = require 'util'
http = require 'http'


Schema = mongoose.Schema

schema = new Schema
	username:
		type: String
		unique: true
		required: true
	hashedPassword:
		type: String
		required: true
	salt:
		type: String
		required: true
	created:
		type: Date
		default: Date.now

schema.methods.encryptPassword = (password) ->
	crypto.createHmac('sha1', @salt).update(password).digest 'hex'

schema.virtual('password').set((password) ->
	@_plainPassword = password
	@salt = Math.random() + ''
	@hashedPassword = @encryptPassword(password)
	return
).get ->
	@_plainPassword

schema.methods.checkPassword = (password) ->
	@encryptPassword(password) == @hashedPassword

schema.statics.authorize = (username, password, callback) ->
	User = @
	async.waterfall [
		(callback) ->
			User.findOne username: username, callback
		(user, callback) ->
			if user
				if user.checkPassword password
					callback null, user
				else
					callback new AuthError "Неверный пароль"
			else
				user = new User username: username, password: password
				user.save (err) ->
					callback err if err
					callback null, user
	], callback

exports.User = mongoose.model('User', schema)

class AuthError
	constructor: (message) ->
		Error.apply @, arguments
		Error.captureStackTrace @, AuthError
		@message = message

util.inherits AuthError, Error

exports.AuthError = AuthError