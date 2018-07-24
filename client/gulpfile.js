'use strict';

var gulp = require('gulp');


var lint = require('./gulp/lint');
gulp.task('lint', lint.lint);
gulp.task('cilint', lint.cilint);


var build = require('./gulp/build');
gulp.task('build:dev', build.buildDev);
gulp.task('build-dev', build.buildDev);
gulp.task('build:dist', build.buildDist);
gulp.task('build-dist', build.buildDist);
gulp.task('build', gulp.series('build:dist'));
gulp.task('purify-files', build.logPurifyFiles);

var bump = require('./gulp/bump');
gulp.task('bump:major', bump.bumpMajor);
gulp.task('bump:minor', bump.bumpMinor);
gulp.task('bump:patch', bump.bumpPatch);

var clean = require('./gulp/clean');
gulp.task('clean', clean.clean);

// var deploy = require('./gulp/deploy');
// gulp.task('deploy:dev', deploy.deployDev);
// gulp.task('deploy-dev', deploy.deployDev);
// gulp.task('deploy:test', deploy.deployTest);
// gulp.task('deploy-test', deploy.deployTest);
// gulp.task('deploy:prod', deploy.deployProd);
// gulp.task('deploy-prod', deploy.deployProd);
// gulp.task('deploy', gulp.series('deploy:dev'));
// gulp.task('publish', gulp.series('deploy'));

var renameProject = require('./gulp/rename-project');
gulp.task('rename-project', renameProject.renameProject);
gulp.task('renameProject', renameProject.renameProject); // keep this alias for intc gen-ui in intc-cli

var server = require('./gulp/server');
gulp.task('serve:dev', server.serveDev);
gulp.task('serve-dev', server.serveDev);
gulp.task('serve:dist', server.serveDist);
gulp.task('serve-dist', server.serveDist);
gulp.task('serve', gulp.series('serve:dev'));
gulp.task('default', gulp.series('serve'));

var unitTests = require('./gulp/unit-tests');
gulp.task('test', unitTests.test);
gulp.task('tdd', unitTests.tdd);
gulp.task('citest', unitTests.citest);
