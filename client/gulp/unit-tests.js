'use strict';

var gulp = require('gulp'),
	karma = require('karma').Server,
	args = require('yargs').argv;

var injectIntoKarma = require('./inject').injectIntoKarma,
	files = require('./config').files;

function runTests(done, singleRun) {
	if (singleRun === undefined) {
		singleRun = false;
    }
	new karma({
		configFile: process.cwd() + '/' + files.karmaConfig,
		singleRun: singleRun
	}, function() {
		//we do this because otherwise karma passes errors through this callback, and gulp will also pass that error up through `done`, then you will see an uncaught error
		done();
	}).start();
}
runTests.description = 'Runs tests using Karma and PhantomJS. This is defined in your karma.config.js file';

var test = gulp.series(
	injectIntoKarma,
	function runTestsOnce(done) {
		runTests(done, true);
	}
);
test.description = 'Run tests once and exit';

var tdd = gulp.series(
	injectIntoKarma,
	runTests
);
tdd.description = 'Watch for file changes and re-run tests on each change';

function runCITests(done, singleRun) {
	if (singleRun === undefined) {
		singleRun = false;
	}

	new karma(
		{
			configFile: process.cwd() + '/' + files.karmaConfig,
			singleRun: singleRun,
			reporters: ['teamcity', 'coverage'],
			coverageReporter: {
				type: 'teamcity',
				dir: 'coverage/'
			}
		},
		function() {
			done();
		}
	).start();
}

var citest = gulp.series(
	injectIntoKarma,
	function runTestsOnce(done) {
		runCITests(done, true);
	}
);

module.exports = {
	test: test,
	tdd: tdd,
	citest:citest
};
