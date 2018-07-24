'use strict';

var gulp = require('gulp'),
	plugins = {
		autoprefixer: require('gulp-autoprefixer'),
		flatten: require('gulp-flatten'),
		inject: require('gulp-inject'),
		sass: require('gulp-sass'),
		sourcemaps: require('gulp-sourcemaps')
	},
	mainBowerFiles = require('main-bower-files');

var config = require('./config'),
	paths = config.paths,
	files = config.files;


//TODO: separate injection and compilation. We only need to inject when files are added or deleted. We need to compile whenever there is a change.
function compileStyles() {
	return gulp.src(files.mainScss)
		.pipe(plugins.inject(
			gulp.src([files.styles, '!' + files.mainScss, '!' + files.bowerComponents]),
			{
				relative: true,
				starttag: '/*** scss-inject ***/',
				endtag: '/*** end scss-inject ***/',
				transform: function (filepath) {
					return '@import "' + filepath + '";';
				}
			}
		))
		.pipe(plugins.sourcemaps.init())
		.pipe(plugins.sass({
			includePaths: [paths.bowerComponents],
			outputStyle: 'compressed'
		}))
		.pipe(plugins.autoprefixer())
		.pipe(plugins.sourcemaps.write())
		.pipe(gulp.dest(paths.tmp));
}

//Bower components that have CSS dependencies
function moveVendorCssFiles(cb) {
	var bowerCss = mainBowerFiles({filter: '**/*.css'});
	// the below if statement is a temporary workaround for gulp 4.0; implemented Sep 29 2015
	// gulp 4.0 (still alpha) cannot handle empty arrays in a `gulp.src` until this is fixed (again). See the following discussions:
	// https://github.com/gulpjs/vinyl-fs/issues/40#issuecomment-144231884
	// https://github.com/jonschlinkert/is-valid-glob/issues/3
	// We can remove it once the issues are resolved and vinyl-fs is using the fixed version of is-valid-glob
	if(bowerCss.length === 0) {
		cb();
		return;
	}
	return gulp.src(bowerCss, {base: paths.bowerComponents})
		.pipe(plugins.flatten())
		.pipe(gulp.dest(paths.tmp));
}

module.exports = {
	compileStyles: compileStyles,
	moveVendorCssFiles: moveVendorCssFiles
};
