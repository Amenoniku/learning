jQuery = require "jquery"
angular = require "angular"
require "ngAnimate"

phonecatAnimations = angular.module "phonecatAnimations", ["ngAnimate"]
	.animation ".phone", ->
		animateUp = (element, className, done) ->
			if className != "active"
				return
			element.css
				position: "absolute"
				top: 500
				left: 0
				display: "block"
			jQuery(element).animate top: 0, done
			(cancel) ->
				if cancel
					do element.stop
				return

			animateDown = (element, className, done) ->
				if className != "active"
					return
				element.css
					position: "absolute"
					left: 0
					top: 0
				jQuery(element).animate top: -500, done
				(cancel) ->
					if cancel
						do element.stop
					return
			{
				addClass: animateUp
				removeClass: animateDown
		}

module.exports = phonecatAnimations