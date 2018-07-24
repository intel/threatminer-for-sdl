'use strict';

var gulp = require('gulp'),
	del = require('del');

var paths = require('./config').paths;


function clean(done) {
	return del([paths.dist, paths.tmp], done);
}
clean.description = 'Delete the .tmp and dist folders.';


module.exports = {
	clean: clean
};
