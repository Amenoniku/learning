gulp = require 'gulp'
connect = require 'gulp-connect'
jade = require 'gulp-jade'
stylus = require 'gulp-stylus'
coffee = require 'gulp-coffee'
rjs = require 'gulp-requirejs'
uglify = require 'gulp-uglify'
clean = require 'gulp-clean'

gulp.task 'connect', ->
	connect.server
		port: 8000
		livereload: on
		root: './dist/snapsvgmenu'

gulp.task 'jade', -> 
	gulp.src 'jade/*.jade'
		.pipe do jade
		.pipe gulp.dest 'dist/snapsvgmenu'
		.pipe do connect.reload

gulp.task 'stylus', -> 
	gulp.src 'stylus/*.styl'
		.pipe stylus set: ['compress']
		.pipe gulp.dest 'dist/snapsvgmenu/css'
		.pipe do connect.reload

gulp.task 'build', ['coffee'], ->
	rjs
		baseUrl: 'js'
		name: '../bower_components/almond/almond'
		include: ['main']
		insertRequire: ['main']
		out: 'all.min.js'
		wrap: on
	.pipe do uglify
	.pipe gulp.dest 'dist/snapsvgmenu/js'
	.pipe do connect.reload

	gulp.src 'js/', read: no
		.pipe do clean

gulp.task 'coffee', -> 
	gulp.src 'coffee/main.coffee'
		.pipe do coffee
		.pipe gulp.dest 'js'

gulp.task 'watch', ->
	gulp.watch 'jade/*.jade', ['jade']
	gulp.watch 'stylus/*.styl', ['stylus']
	gulp.watch 'coffee/*.coffee', ['build']

gulp.task 'default', ['jade', 'stylus', 'build', 'connect', 'watch']

	# gulp.task 'default', ->   
	# console.log 'hello world'