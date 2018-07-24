'use strict';

var gulp = require('gulp');
var bump = require('gulp-bump');
var semver = require('semver');
var fs = require('fs');

var getPackageJson = function () {
  return JSON.parse(fs.readFileSync('./package.json', 'utf8'));
};

function bumpMajor() {
  var pkg = getPackageJson();
  var newVer = semver.inc(pkg.version, 'major');
  return gulp.src(['./package.json','./bower.json'])
    .pipe(bump({version:newVer}))
    .pipe(gulp.dest('./'));
}

function bumpMinor() {
  var pkg = getPackageJson();
  var newVer = semver.inc(pkg.version, 'minor');
  return gulp.src(['./package.json','./bower.json'])
    .pipe(bump({version:newVer}))
    .pipe(gulp.dest('./'));
}

function bumpPatch() {
  var pkg = getPackageJson();
  var newVer = semver.inc(pkg.version, 'patch');
  return gulp.src(['./package.json','./bower.json'])
    .pipe(bump({version:newVer}))
    .pipe(gulp.dest('./'));
}

module.exports = {
  bumpMajor: bumpMajor,
  bumpMinor:bumpMinor,
  bumpPatch: bumpPatch
};
