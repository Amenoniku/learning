HttpError = require('../error').HttpError

module.exports = (req, res, next) ->
	if not req.session.user
		return next new HttpError 401, "Вы не авторизированы"
	do next
