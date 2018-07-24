'use strict';

var gulp = require('gulp'),
	browserSync = require('browser-sync');

var build = require('./build'),
	buildDev = build.buildDev,
	buildDist = build.buildDist,
	watch = require('./watch'),
	watchDev = watch.watchDev,
	watchDist = watch.watchDist,
	paths = require('./config').paths,
	modRewrite = require('connect-modrewrite');


function browserSyncOptions(serverBaseDir) {
	return {
		server: {
			baseDir: serverBaseDir,
			middleware: [
				modRewrite(['!\.html|\.js|\.css|\.png|\.woff|\.ttf$ /index.html [L]'])
			]
		},
		port: 9000,
		ghostMode: {
			clicks: true,
			location: false,
			forms: true,
			scrolling: true
		},
		injectChanges: true,
		logFileChanges: true,
		logPrefix: 'browser-sync',
		notify: true,
		reloadDelay: 100
	}
}

var serveDev = gulp.series(
	buildDev,
	watchDev,
	function (done) {
		if (browserSync.active) {
			done();
			return;
		}

		browserSync(browserSyncOptions([paths.app, '.']));
		done();
	}
);

var serveDist = gulp.series(
	buildDist,
	watchDist,
	function (done) {
		if (browserSync.active) {
			done();
			return;
		}

		browserSync(browserSyncOptions([paths.dist]));
		done();
	}
);


module.exports = {
	serveDev: serveDev,
	serveDist: serveDist
};
