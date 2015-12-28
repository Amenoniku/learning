gulp = require "gulp"
gulpif = require "gulp-if"
gutil = require "gulp-util"
uglify = require "gulp-uglify"
browserify = require "browserify"
watchify = require "watchify"
source = require "vinyl-source-stream"
bundleLogger = require "../utils/bundleLogger"
handleErrors = require "../utils/handleErrors"
paths = require "../paths"

# Клиенские зависимости
dependencies =
	jquery: "jquery"
	angular: "angular"
	ngRoute: "angular-route"
	ngAnimate: "angular-animate"
	ngResource: "angular-resource"
	fetch: "./node_modules/whatwg-fetch"
	promise: "./node_modules/es6-promise"

gulp.task "scripts", ->
	#==========  Client bundler  ==========#

	clientBundler = browserify
		cache: {}, packageCache: {}
		entries: "./content/scripts/app.coffee"
		extensions: [".cjsx", ".coffee"]

	for k, v of dependencies
		clientBundler.external k

	rebundle = ->
		bundleLogger.start "client.js"

		clientBundler
			.bundle()
				.on "error", handleErrors
				.pipe source "app.js"
				# .pipe gulpif !gutil.env.debug, do uglify
				.pipe gulp.dest paths.scripts
				.on "end", ->
					bundleLogger.end "client.js"

	if global.watch
		clientBundler = watchify clientBundler
		clientBundler.on "update", rebundle
	do rebundle

	#==========  Vendor bundler  ==========#

	vendorBundler = browserify
		cache: {}, packageCache: {}
		extensions: [".coffee"]

	for k, v of dependencies
		vendorBundler.require v, expose: k

	bundleLogger.start "vendor.js"

	vendorBundler.bundle()
		.on "error", handleErrors
		.pipe source "vendor.js"
		# .pipe gulpif !gutil.env.debug, do uglify
		.pipe gulp.dest paths.scripts
		.on "end", ->
			bundleLogger.end "vendor.js"