gulp = require "gulp"
gutil = require "gulp-util"
gulpif = require "gulp-if"
zip = require "gulp-zip"
paths = require "../paths"
pkg = require "../../package.json"

correctNumber = (number) ->
	if number < 10 then "0" + number else number

getDateTime = -> 
	now = new Date
	year = now.getFullYear()
	month = correctNumber now.getMonth() + 1
	day = correctNumber now.getDate()
	hours = correctNumber now.getHours()
	minutes = correctNumber now.getMinutes()

	return "#{hours}#{minutes}#{day}#{month}#{year}"

gulp.task "zip", ->
	zipName = "#{pkg.name}_#{do getDateTime}.zip"
	console.log zipName
	gulp.src ["./**/*", "!./node_modules/**", "!./*.zip"]
		.pipe zip zipName
		.pipe gulp.dest "./"