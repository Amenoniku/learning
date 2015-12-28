gulp = require "gulp"
runSequence = require "run-sequence"
browserSync = require "browser-sync"
reload = browserSync.reload

gulp.task "watch", ->
	global.watch = on
	gulp.watch "content/sprite/**/*.png", ["sprite"]
	gulp.watch "content/{styles,views}/**/*.styl", ["styles", reload]
	gulp.watch "content/views/**/*.jade", ["jade"], reload
	gulp.watch "content/ng-views/**/*.jade", ["ng-templ"], reload
	gulp.watch "content/resources/**/*", ["copy:resources", reload]
	gulp.watch "content/images/**/*", ["copy:images", reload]
	gulp.watch "content/icons/**/*.svg", ["svg", reload]
	gulp.watch "dist/scripts/*.js", reload