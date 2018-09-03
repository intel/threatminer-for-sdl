

const gulp = require('gulp');
const bump = require('gulp-bump');
const semver = require('semver');
const fs = require('fs');

const getPackageJson = function () {
  return JSON.parse(fs.readFileSync('./package.json', 'utf8'));
};

function bumpMajor() {
  const pkg = getPackageJson();
  const newVer = semver.inc(pkg.version, 'major');
  return gulp.src(['./package.json', './bower.json'])
    .pipe(bump({ version: newVer }))
    .pipe(gulp.dest('./'));
}

function bumpMinor() {
  const pkg = getPackageJson();
  const newVer = semver.inc(pkg.version, 'minor');
  return gulp.src(['./package.json', './bower.json'])
    .pipe(bump({ version: newVer }))
    .pipe(gulp.dest('./'));
}

function bumpPatch() {
  const pkg = getPackageJson();
  const newVer = semver.inc(pkg.version, 'patch');
  return gulp.src(['./package.json', './bower.json'])
    .pipe(bump({ version: newVer }))
    .pipe(gulp.dest('./'));
}

module.exports = {
  bumpMajor,
  bumpMinor,
  bumpPatch,
};
