'use strict';

var gulpUtil = require('gulp-util');


var projectName = 'threat'; // must be kebab-case
var moduleName = 'threat'; // must be camelCase

var distRoot = 'dist';
var appRoot = 'app';
var paths = {
	app: appRoot,
	styles: appRoot + '/styles',
	images: appRoot + '/images',
	test: 'test',
	dist: distRoot,
	distStyles: distRoot + '/styles',
	distFonts: distRoot + '/styles/fonts', //put fonts one directory up so that $intel-icon-path and $icon-font-path paths set in main.scss work correctly
	distImages: distRoot + '/images/',
	tmp: appRoot + '/.tmp',
	tmpFonts: appRoot + '/.tmp/fonts', //put fonts one directory up so that $intel-icon-path and $icon-font-path paths ("../fonts", used in it-mlaf-sass and bootstrap-sass) work correctly
	bowerComponents: appRoot + '/bower_components',
	nodeModules: 'node_modules'
};

var files = {
	bowerComponents: paths.bowerComponents + '/**/*',
	nodeModules: paths.nodeModules + '/**/*',
	templates: paths.app + '/**/*.html',
	scripts: paths.app + '/**/*.js',
	styles: paths.app + '/**/*.scss',
	moduleScripts: paths.app + '/**/*.module.js',
	tests: paths.app + '/**/*.{spec,mock}.js',
	testFiles: paths.app + '/**/*spec.js',
	mockFiles: paths.app + '/**/*mocks.js',
	testFolder: 'test/**/*{spec,mock}.js',
 testDependencies: [
		'bower_components/angular-scenario/angular-scenario.js',
		'bower_components/angular-mocks/angular-mocks.js',
		'bower_components/sinon-as-promised/release/sinon-as-promised.js',
		'node_modules/bardjs/dist/bard.js',
		'node_modules/bardjs/dist/bard-ngRouteTester.js',
		'node_modules/sinon/pkg/sinon.js',
	],
	ie8Scripts: [
		paths.bowerComponents + '/html5shiv/dist/html5shiv.min.js',
		paths.bowerComponents + '/es5-shim/es5-shim.js',
		paths.bowerComponents + '/json3/lib/json3.min.js',
		paths.bowerComponents + '/respond/dest/respond.min.js'
	],
	favicons: paths.app + '/**/*.ico',
	fonts: paths.app + '/**/*.{eot,svg,ttf,woff}',
	images: paths.images + '/**/*',
	json: paths.app + '/**/*.json',
	html: paths.app + '/**/*.html',
	htmlTopLevel: paths.app + '/*.html',
	htmlTemplatecache: paths.app + '/**/*.template.html',
	gulpConfig: 'gulp/config.js',
	karmaConfig: 'karma.conf.js',
	tmp: paths.tmp + '/**/*',
	tmpCss: paths.tmp + '/**/*.css',
	tmpFonts: paths.tmpFonts + '/**/*',
	dist: paths.dist + '/**/*',
	distHtml: paths.dist + '/**/*.html',
	distCss: paths.distStyles + '/**/*.css',
	distIndexHtml: paths.dist + '/index.html',
	distScripts: paths.dist + '/**/*.js',
	distManifest: paths.dist + '/rev-manifest.json',
	indexHtml: paths.app + '/index.html',
	html404: paths.app + '/404.html',
	indexJs: paths.app + '/index.js',
	mainScss: paths.styles + '/main.scss',
	// These files will be moved to your dist folder at build time.
	serverConfig: [
		paths.app + '/nginx.conf',
		paths.app + '/.htaccess',
		paths.app + '/robots.txt',
		paths.app + '/web.config'
	],
	packageJson: 'package.json',
	bowerJson: 'bower.json'
};

// groups of globs that are used more than once
//TODO: give this a better name?
var fileCollections = {
	//all application html except index.html, 404.html, and html templates that are templatecached, all of which are handled differently in the build step
	htmlRevable: [
		files.html,
		'!' + files.htmlTemplatecache,
		'!' + files.indexHtml,
		'!' + files.html404,
		'!' + files.bowerComponents,
		'!' + files.tmp
	],
	//all application html that will be templatecached
	htmlTemplatecache: [
		files.htmlTemplatecache,
		'!' + files.bowerComponents,
		'!' + files.tmp
	],
	//all application html
	html: [
		files.html,
		'!' + files.bowerComponents,
		'!' + files.tmp
	],
	scripts: [
		files.scripts,
		'!' + files.tests,
		'!' + files.bowerComponents,
		'!' + files.tmp
	],
	styles: [
		files.styles,
		'!' + files.bowerComponents,
		'!' + files.tmp
	],
	json: [
		files.json,
		'!' + files.bowerComponents,
		'!' + files.tmp
	],
	favicons: [
		files.favicons,
		'!' + files.bowerComponents,
		'!' + files.tmp
	],
	revReplaceFiles: [
		files.distScripts,
		files.distHtml,
		files.distCss
	]
};

function errorHandler(title) {
	return function (err) {
		gulpUtil.log(gulpUtil.colors.red('[' + title + ']'), err.toString());
		this.emit('end');
	};
}

module.exports = {
	projectName: projectName,
	moduleName: moduleName,
	paths: paths,
	files: files,
	fileCollections: fileCollections,
	errorHandler: errorHandler,
	minifyHtml: {
		removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
	  minifyCSS: true,
	  minifyJS: true
	}
};
