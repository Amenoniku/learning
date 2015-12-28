gulp = require "gulp"
stylus = require "gulp-stylus"
plumber = require "gulp-plumber"
autoprefixer = require "autoprefixer-stylus"
rupture = require "rupture"
cmq = require "gulp-group-css-media-queries"
minifyCss = require "gulp-minify-css"
rename = require "gulp-rename"
gutil = require "gulp-util"
gulpif = require "gulp-if"
paths = require "../paths"
pkg = require "../../package.json"
browsers = pkg.browsers

gulp.task "styles", ->
	gulp.src "*.styl", cwd: "content/styles", nonull: true
		.pipe do plumber
		.pipe stylus
			errors: true
			use: [
				autoprefixer(
					"Android >= " + browsers.android
					"Chrome >= " + browsers.chrome
					"Firefox >= " + browsers.firefox
					"Explorer >= " + browsers.ie
					"iOS >= " + browsers.ios
					"Opera >= " + browsers.opera
					"Safari >= " + browsers.safari
				)
			]
			sourcemap: if gutil.env.debug then comment: false, inline: true else false
		.pipe gulpif !gutil.env.debug, do cmq
		.pipe gulpif !gutil.env.debug, do minifyCss
		.pipe rename suffix: ".min"
		.pipe gulp.dest paths.styles