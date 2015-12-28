"use strict"
angular = require "angular"
require "ngRoute"

phonecatApp = angular.module "phonecatApp", [
	"ngRoute"
	require("./animation").name
	require("./filters").name
	require("./services").name
	require("./controllers").name
]
phonecatApp.config ["$routeProvider", ($routeProvider) ->
	$routeProvider
		.when "/phones",
			templateUrl: "views/phone-list.html"
			controller: "PhoneListCtrl"
		.when "/phones/:phoneId",
			templateUrl: "views/phone-detail.html"
			controller: "PhoneDetailCtrl"
		.otherwise
			redirectTo: "/phones"
	]

module.exports = phonecatApp