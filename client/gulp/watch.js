'use strict';

var gulp = require('gulp'),
	plugins = {
		// gulp.watch doesn't watch for additions or deletion of new files- so I'm using gulp-watch plugin.
		watch: require('gulp-watch')
	},
	browserSync = require('browser-sync'),
	del = require('del'),
	globby = require('globby');

var compileStyles = require('./styles').compileStyles,
	build = require('./build'),
	buildDist = build.buildDist,
	moveCssToDist = build.moveCssToDist,
	moveScriptsToDist = build.moveScriptsToDist,
	moveIconsToDist = build.moveIconsToDist,
	moveImagesToDist = build.moveImagesToDist,
	moveJsonToDist = build.moveJsonToDist,
	moveHtml = build.moveHtml,
	moveIndexHtml = build.moveIndexHtml,
	templatifyHtml = build.moveAndTemplatifyHtml,
	
	inject = require('./inject'),
	injectDev = inject.injectDev,
	
	injectJs = inject.injectJs,
	
	injectToDist = inject.injectToDist,
	config = require('./config'),
	paths = config.paths,
	files = config.files,
	fileCollections = config.fileCollections;


function watchDev(done) {

	plugins.watch(
		globby.sync(fileCollections.styles),
		{
			events: ['change']
		},
		gulp.series(
			function compileStylesAndReload() {
				return compileStyles()
					.pipe(browserSync.reload({stream: true}));
			}
		)
	);

	plugins.watch(
		globby.sync(fileCollections.scripts),
		{
			events: ['change', 'add', 'addDir', 'unlink', 'unlinkDir']
		},
		gulp.series(
			
			injectJs,
			
			browserSync.reload
		)
	);

	plugins.watch(
		globby.sync(fileCollections.html),
		{
			events: ['add', 'addDir', 'unlink', 'unlinkDir', 'change']
		},
		gulp.series(browserSync.reload)
	);

	plugins.watch(
		files.bowerComponents,
		{
			events: ['change', 'add', 'addDir', 'unlink', 'unlinkDir']
		},
		gulp.series(
			injectDev,
			browserSync.reload
		)
	);

	done();
}

function watchDist(done) {

	plugins.watch(
		globby.sync(fileCollections.htmlRevable),
		{
			events: ['add', 'addDir', 'unlink', 'unlinkDir', 'change']
		},
		gulp.series(
			moveHtml,
			browserSync.reload
		)
	);

	plugins.watch(
		files.indexHtml,
		{
			events: ['add', 'addDir', 'unlink', 'unlinkDir', 'change']
		},
		gulp.series(
			moveIndexHtml,
			injectToDist,
			browserSync.reload
		)
	);

	plugins.watch(
		globby.sync(fileCollections.htmlTemplatecache),
		{
			events: ['add', 'addDir', 'unlink', 'unlinkDir', 'change']
		},
		gulp.series(
			function (done) {
				return del([paths.dist + '/template*.js'], done);
			},
			templatifyHtml,
			injectToDist,
			browserSync.reload
		)
	);

	plugins.watch(
		globby.sync(fileCollections.styles),
		{
			events: ['add', 'addDir', 'change']
		},
		gulp.series(
			function (done) {
				return del([paths.distStyles + '/main*.css'], done);
			},
			compileStyles,
			function moveCssAndReload() {
				return moveCssToDist()
					.pipe(browserSync.reload({stream: true}));
			},
			injectToDist,
			browserSync.reload
		)
	);

	plugins.watch(
		globby.sync(fileCollections.scripts),
		{
			events: ['add', 'addDir', 'unlink', 'unlinkDir', 'change']
		},
		gulp.series(
			function (done) {
				return del([paths.dist + '/app*.js'], done);
			},
			
			injectJs,
			
			moveScriptsToDist,
			injectToDist,
			browserSync.reload
		)
	);

	plugins.watch(
		files.bowerComponents,
		{
			//TODO: Also watch bower_components change event? But in a smart way, because several files could change in quick succession.
			events: ['add', 'addDir', 'unlink', 'unlinkDir']
		},
		gulp.series(
			buildDist,
			browserSync.reload
		)
	);

	plugins.watch(
		files.images,
		{
			events: ['add', 'addDir', 'unlink', 'unlinkDir']
		},
		gulp.series(moveImagesToDist)
	);

	plugins.watch(
		globby.sync(fileCollections.favicons),
		{
			events: ['add', 'addDir', 'unlink', 'unlinkDir']
		},
		gulp.series(moveIconsToDist)
	);

	plugins.watch(
		globby.sync(fileCollections.json),
		{
			events: ['add', 'addDir', 'unlink', 'unlinkDir']
		},
		gulp.series(moveJsonToDist)
	);

	done();
}


module.exports = {
	watchDev: watchDev,
	watchDist: watchDist
};
