(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
require("../views/root/ng-modules/main");


},{"../views/root/ng-modules/main":5}],2:[function(require,module,exports){
var angular, jQuery, phonecatAnimations;

jQuery = require("jquery");

angular = require("angular");

require("ngAnimate");

phonecatAnimations = angular.module("phonecatAnimations", ["ngAnimate"]).animation(".phone", function() {
  var animateUp;
  return animateUp = function(element, className, done) {
    var animateDown;
    if (className !== "active") {
      return;
    }
    element.css({
      position: "absolute",
      top: 500,
      left: 0,
      display: "block"
    });
    jQuery(element).animate({
      top: 0
    }, done);
    (function(cancel) {
      if (cancel) {
        element.stop();
      }
    });
    animateDown = function(element, className, done) {
      if (className !== "active") {
        return;
      }
      element.css({
        position: "absolute",
        left: 0,
        top: 0
      });
      jQuery(element).animate({
        top: -500
      }, done);
      return function(cancel) {
        if (cancel) {
          element.stop();
        }
      };
    };
    return {
      addClass: animateUp,
      removeClass: animateDown
    };
  };
});

module.exports = phonecatAnimations;


},{"angular":"angular","jquery":"jquery","ngAnimate":"ngAnimate"}],3:[function(require,module,exports){
"use strict";
var angular;

angular = require("angular");

module.exports = angular.module('phonecatControllers', []).controller("PhoneListCtrl", [
  "$scope", "Phone", function($scope, Phone) {
    $scope.phones = Phone.query();
    return $scope.orderProp = "age";
  }
]).controller("PhoneDetailCtrl", [
  "$scope", "$routeParams", "Phone", function($scope, $routeParams, Phone) {
    $scope.phone = Phone.get({
      phoneId: $routeParams.phoneId
    }, function(phone) {
      return $scope.mainImageUrl = phone.images[0];
    });
    return $scope.setImage = function(imageUrl) {
      console.log($scope.mainImageUrl);
      return $scope.mainImageUrl = imageUrl;
    };
  }
]);


},{"angular":"angular"}],4:[function(require,module,exports){
"use strict";
var angular;

angular = require("angular");

module.exports = angular.module("phonecatFilters", []).filter("checkmark", function() {
  return function(input) {
    if (input) {
      return "\u2713";
    } else {
      return "\u2718";
    }
  };
});


},{"angular":"angular"}],5:[function(require,module,exports){
"use strict";
var angular, phonecatApp;

angular = require("angular");

require("ngRoute");

phonecatApp = angular.module("phonecatApp", ["ngRoute", require("./animation").name, require("./filters").name, require("./services").name, require("./controllers").name]);

phonecatApp.config([
  "$routeProvider", function($routeProvider) {
    return $routeProvider.when("/phones", {
      templateUrl: "views/phone-list.html",
      controller: "PhoneListCtrl"
    }).when("/phones/:phoneId", {
      templateUrl: "views/phone-detail.html",
      controller: "PhoneDetailCtrl"
    }).otherwise({
      redirectTo: "/phones"
    });
  }
]);

module.exports = phonecatApp;


},{"./animation":2,"./controllers":3,"./filters":4,"./services":6,"angular":"angular","ngRoute":"ngRoute"}],6:[function(require,module,exports){
"use strict";
var angular, phonecatServices;

angular = require("angular");

require("ngResource");

phonecatServices = angular.module("phonecatServices", ["ngResource"]).factory("Phone", [
  "$resource", function($resource) {
    return $resource("phones/:phoneId.json", {}, {
      query: {
        method: "GET",
        params: {
          phoneId: "phones"
        },
        isArray: true
      }
    });
  }
]);

module.exports = phonecatServices;


},{"angular":"angular","ngResource":"ngResource"}]},{},[1]);
