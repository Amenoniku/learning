"use strict"
angular = require "angular"

module.exports = angular.module 'phonecatControllers', []
	.controller "PhoneListCtrl", ["$scope", "Phone", ($scope, Phone) ->
		$scope.phones = do Phone.query
		$scope.orderProp = "age"
	]
	.controller "PhoneDetailCtrl", ["$scope", "$routeParams", "Phone", 
		($scope, $routeParams, Phone) ->
			$scope.phone = Phone.get
				phoneId: $routeParams.phoneId
				, (phone) ->
					$scope.mainImageUrl = phone.images[0]
			$scope.setImage = (imageUrl) ->
				console.log $scope.mainImageUrl
				$scope.mainImageUrl = imageUrl
	]