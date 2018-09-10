

const gulp = require('gulp');


const del = require('del');

const paths = require('./config').paths;


function clean(done) {
  return del([paths.dist, paths.tmp], done);
}
clean.description = 'Delete the .tmp and dist folders.';


module.exports = {
  clean,
};
