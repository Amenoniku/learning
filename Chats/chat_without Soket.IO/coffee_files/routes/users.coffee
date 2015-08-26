express = require('express')
router = express.Router()
User = require('../modelsDB/user').User
ObjectID = require('mongodb').ObjectID
# HttpError = require('../error').HttpError
### GET users listing. ###
router.get '/', (req, res, next) ->
	User.find {}, (err, users) ->
		next err if err
		res.json(users)

router.get "/:id", (req, res, next) ->
	id = new ObjectID req.params.id
	User.findById id, (err, user) ->
		next err if err
		if !user
			error = 
				title: "Пользователи"
				error: "Ошибка"
				message: "Пользователь ненайден"
			return res.render "error", error
		res.json(user)

module.exports = router