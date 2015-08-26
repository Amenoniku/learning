path = require 'path'
util = require 'util'
http = require 'http'

class HttpError
	constructor: (status, message) ->
		Error.apply @, arguments
		Error.captureStackTrace @, HttpError

		@status = status
		@message = message or http.STATUS_CODE[status] or "Error"

	name: "HttpError"

util.inherits HttpError, Error

exports.HttpError = HttpError