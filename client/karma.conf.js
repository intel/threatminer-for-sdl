// Karma configuration
module.exports = function (config) {
	config.set({
		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,

		// base path, that will be used to resolve files and exclude
		basePath: '',

		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera
		// - Safari (only Mac)
		// - PhantomJS
		// - IE (only Windows)
		//browsers: ['Chrome'],
		browsers: ['PhantomJS'],

		// If browser does not capture in given timeout [ms], kill it
		captureTimeout: 5000,

		// enable / disable colors in the output (reporters and logs)
		colors: true,

		coverageReporter: {
			dir: 'coverage/',
			reporters: [
				{ type:'html', subdir: 'report-html' },
				{ type:'lcov', subdir: 'report-lcov' },
				{ type: 'text-summary' }
			]
		},

		// list of files to exclude
		exclude: [],
		frameworks: ['chai', 'mocha', 'sinon', 'chai-sinon'],

		// list of files / patterns to load in the browser
		// ** automatically managed by gulp **
		files: [
			"app/bower_components/angular/angular.js",
			"app/bower_components/angular-resource/angular-resource.js",
			"app/bower_components/angular-cookies/angular-cookies.js",
			"app/bower_components/angular-sanitize/angular-sanitize.js",
			"app/bower_components/angular-animate/angular-animate.js",
			"app/bower_components/angular-touch/angular-touch.js",
			"app/bower_components/angular-route/angular-route.js",
			"app/bower_components/lodash/lodash.js",
			"app/bower_components/jquery/dist/jquery.js",
			"app/bower_components/configurator/dist/configurator.js",
			"app/bower_components/bootstrap-sass/assets/javascripts/bootstrap.js",
			"app/bower_components/intcAppFrame/js/intcAppFrame.js",
			"app/bower_components/intcAppFrame/js/linksDeterminedByObjLinks.directive.js",
			"app/bower_components/intcAppFrame/js/intcAppFrame.templates.js",
			"app/app.js",
			"app/home/home.controller.js",
			"app/home/home.spec.js"
		],

		// level of logging
		// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
		logLevel: config.LOG_INFO,

		// By default, Karma loads all sibling NPM modules which have a name starting with karma-*.
		// Uncomment the following if you want to deal with it manually:
		//plugins: [
		//  'karma-teamcity-reporter',
		//  'karma-ng-html2js-preprocessor',
		//  'karma-coverage',
		//  'karma-jasmine',
		//  'karma-phantomjs-launcher'
		//],

		ngHtml2JsPreprocessor: {
			stripPrefix: 'app/'
		},

		// web server port
		port: 8080,

		preprocessors: {
			'app/!(bower_components)/**/!(*mock|*spec).js': ['coverage'],
			'app/**/*.html': ['ng-html2js']
		},

		//test results reporter
		reporters: ['progress', 'coverage'],

		// cli runner port
		runnerPort: 9100,

		// Continuous Integration mode
		// if true, it capture browsers, run tests and exit
		singleRun: false
	});
};
