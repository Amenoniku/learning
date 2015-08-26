gulp = require 'gulp'
coffee = require 'gulp-coffee'
connect = require 'gulp-connect'
jade = require "gulp-jade"
stylus = require 'gulp-stylus'
concat = require 'gulp-concat'

gulp.task 'connect', ->
	connect.server
		port: 8000
		livereload: on
		root: './dist'

gulp.task 'jade', ->
	gulp.src 'jade/index.jade'
		.pipe do jade
		.pipe gulp.dest 'dist'
		.pipe do connect.reload

gulp.task 'stylus', ->
	gulp.src 'stylus/*.styl'
		.pipe stylus compress: no
		.pipe concat 'styles.css'
		.pipe gulp.dest 'dist/css'
		.pipe do connect.reload


gulp.task 'coffee', ->
	gulp.src 'coffee/*.coffee'
		.pipe do coffee
		.pipe concat 'scripts.js'
		.pipe gulp.dest 'dist/js'
		.pipe do connect.reload

gulp.task 'watch', ->
	gulp.watch 'coffee/*.coffee', ['coffee']
	gulp.watch 'jade/*.jade', ['jade']
	gulp.watch 'stylus/*.styl', ['stylus']

gulp.task 'default', ['connect', 'coffee', 'jade', 'stylus', 'watch']