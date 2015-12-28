gulp = require "gulp"
gutil = require "gulp-util"
runSequence = require "run-sequence"

gulp.task "stylesDependences", ->
	runSequence ["sprite", "icons", "styles"]

gulp.task "default", ["del"], ->
	runSequence [
			"stylesDependences",
			"jade"
			"ng-templ"
			"copy"
		], "server", "watch", "scripts"

gulp.task "build", ["del"], ->
	gulp.start(
		"stylesDependences"
		"jade"
		"ng-templ"
		"scripts"
		"copy"
	)