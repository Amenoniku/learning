express = require('express')
router = express.Router()
User = require('../modelsDB/user').User
checkAuth = require '../middleware/checkAuth'

app = express()
### GET home page. ###
router.get '/', (req, res, next) ->
	res.render 'index', 
		title: 'Главная'
		body: "до свидание"
# app.use require "../middleware/loadUser"
router.route "/login"
	.get (req, res, next) ->
		return res.render "login", title: "Логин"
	.post require("./login").post

router.route "/logout"
	.post (req, res) ->
		console.log "out"
		do req.session.destroy
		res.redirect "/"


router.get "/chat", checkAuth, (req, res, next) ->
		return res.render "chat"#, user: req.user.username

module.exports = router