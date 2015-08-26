User = require('../modelsDB/user').User

module.exports =(req, res, next) ->
	req.user = res.locals.user = null
	if not req.session.user then return do next
	User.findById req.session.user, (err, user) ->
		next err if err
		req.user = res.locals.user = user
		do next