"use strict"
angular = require "angular"
require "ngResource"


phonecatServices = angular.module "phonecatServices", ["ngResource"]
	.factory "Phone", ["$resource", ($resource) ->
		$resource "phones/:phoneId.json", {},
			query:
				method: "GET"
				params:
					phoneId: "phones"
				isArray: on
	]

module.exports = phonecatServices