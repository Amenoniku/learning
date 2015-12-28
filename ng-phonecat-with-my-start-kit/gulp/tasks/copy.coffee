gulp = require "gulp"
changed = require "gulp-changed"
gutil = require "gulp-util"
paths = require "../paths"

gulp.task "copy:images", ->
	gulp.src ["**/*.{png,jpg,gif}", "!sprite/**/*", "!icons/**/*"], cwd: paths.appImages
		.pipe gulp.dest paths.images

gulp.task "copy:resources", ->
	gulp.src "content/resources/**/*"
		.pipe changed paths.dist
		.pipe gulp.dest paths.dist

gulp.task "copy", ["copy:images", "copy:resources"]