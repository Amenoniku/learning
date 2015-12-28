gulp = require "gulp"
gutil = require "gulp-util"
browserSync = require("browser-sync").create()

gulp.task "server", ->
	browserSync.init
		files: ["dist/**/*"]
		open: !!gutil.env.open
		reloadOnRestart: true
		port: gutil.env.port or 8000
		server:
			baseDir: ["dist"]