

const gulp = require('gulp');
const gulpIf = require('gulp-if');

const plugins = {
  eslint: require('gulp-eslint'),
};

const files = require('./config').files;

function isFixed(file) {
	return file.plugins.eslint != null && file.plugins.eslint.fixed;
}

function lint() {
  // Note: To have the process exit with an error code (1) on lint error, return the stream and pipe to failOnError last.
  return gulp.src([files.moduleScripts, files.scripts, `!${files.tests}`, `!${files.bowerComponents}`, `!${files.tmp}`])
    .pipe(plugins.eslint({
      configFile: ".eslintrc.js" //,
      //fix: true
    }))
    .pipe(plugins.eslint.format())
    //.pipe(gulp.dest('../test/fixtures'))
    .pipe(plugins.eslint.failAfterError())
}
lint.description = 'Ensures scripts (.js files in app directory) follow the style standards set in the .eslintrc file';

function cilint() {
  const reporter = require('../eslint/reports/teamcity-lite-reporter');
  // Note: To have the process exit with an error code (1) on lint error, return the stream and pipe to failOnError last.
  return gulp.src([files.moduleScripts, files.scripts, `!${files.tests}`, `!${files.bowerComponents}`, `!${files.tmp}`])
    .pipe(plugins.eslint({ rulePaths: ['eslint/rules/'] }))
    .pipe(plugins.eslint.format(reporter, (results) => { }))
    //.pipe(plugins.eslint.failAfterError());
}
cilint.description = 'Ensures scripts (.js files in app directory) follow the style standards set in the .eslintrc file';

module.exports = {
  lint,
  cilint,
};
