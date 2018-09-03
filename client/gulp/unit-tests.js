

const gulp = require('gulp');


const karma = require('karma').Server;


const args = require('yargs').argv;

const injectIntoKarma = require('./inject').injectIntoKarma;


const files = require('./config').files;

function runTests(done, singleRun) {
  if (singleRun === undefined) {
    singleRun = false;
  }
  new karma({
    configFile: `${process.cwd()}/${files.karmaConfig}`,
    singleRun,
  }, (() => {
    // we do this because otherwise karma passes errors through this callback, and gulp will also pass that error up through `done`, then you will see an uncaught error
    done();
  })).start();
}
runTests.description = 'Runs tests using Karma and PhantomJS. This is defined in your karma.config.js file';

const test = gulp.series(
  injectIntoKarma,
  (done) => {
    runTests(done, true);
  },
);
test.description = 'Run tests once and exit';

const tdd = gulp.series(
  injectIntoKarma,
  runTests,
);
tdd.description = 'Watch for file changes and re-run tests on each change';

function runCITests(done, singleRun) {
  if (singleRun === undefined) {
    singleRun = false;
  }

  new karma(
    {
      configFile: `${process.cwd()}/${files.karmaConfig}`,
      singleRun,
      reporters: ['teamcity', 'coverage'],
      coverageReporter: {
        type: 'teamcity',
        dir: 'coverage/',
      },
    },
    (() => {
      done();
    }),
  ).start();
}

const citest = gulp.series(
  injectIntoKarma,
  (done) => {
    runCITests(done, true);
  },
);

module.exports = {
  test,
  tdd,
  citest,
};
