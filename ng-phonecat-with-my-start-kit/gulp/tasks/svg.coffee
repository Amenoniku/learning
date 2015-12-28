gulp       = require "gulp"
svgSymbols = require "gulp-svg-symbols"
gulpif     = require "gulp-if"
rename     = require "gulp-rename"
paths      = require "../paths"
path       = require "path"

gulp.task "icons", ->
	gulp.src "content/icons/**/*.svg"
		.pipe svgSymbols
			id: "icon_%f"
			className: "%f"
			templates: [
				path.join __dirname, "../utils/svg.styl"
				"default-svg"
			]

		.pipe gulpif /\.styl$/, gulp.dest paths.appStylesHelpers
		.pipe gulpif /\.svg$/, rename "icons.svg"
		.pipe gulpif /\.svg$/, gulp.dest paths.images