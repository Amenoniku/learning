gulp = require "gulp"
jade = require "gulp-jade"
plumber = require "gulp-plumber"
paths = require "../paths"

data = 
	title: "Phone Cat"
	timestamp: +new Date

gulp.task "jade", ->
	gulp.src "content/views/root/*.jade"
		.pipe do plumber
		.pipe jade data: data
		.pipe gulp.dest paths.dist

gulp.task "ng-templ", ->
	gulp.src "content/ng-views/**/*.jade"
		.pipe do plumber
		.pipe do jade
		.pipe gulp.dest "dist/views"