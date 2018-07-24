'use strict';

var gulp = require('gulp'),
	plugins = {
		replace: require('gulp-replace')
	},
	args = require('yargs').argv,
	chalk = require('chalk'),
	_ = require('lodash');

var config = require('./config'),
	files = config.files;


function renameProject() {
	if (!args.name && !args.n) {
		console.error(chalk.red('You must specify a new name for the project.') + '\n\nUsage:\n    gulp rename-project --name [name]\n    gulp rename-project -n [name]');
		return;
	}

	var oldProjectName = config.projectName;
	var newProjectName = args.name || args.n;

	var oldProjectNameKebab = _.kebabCase(oldProjectName);
	var newProjectNameKebab = _.kebabCase(newProjectName);

	var oldProjectNameCamel = _.camelCase(oldProjectName);
	var newProjectNameCamel = _.camelCase(newProjectName);

	// if name is unchanged, do nothing
	if (oldProjectName === newProjectNameKebab) {
		console.warn(chalk.yellow('Project name will remain unchanged, as the provided name is the same as the current name.'));
		return;
	}

	if (hasUpperCase(newProjectName)) {
		console.info(chalk.yellow('The project name you provided has been converted to its kebab-case equivalent: ' + chalk.green.bold(newProjectNameKebab) + '.'));
	}

	console.log('Changing project name from ' + chalk.gray.bold(oldProjectName) + ' to ' + chalk.green.bold(newProjectNameKebab) + '.');

	// replace the ng-app and all the module declarations
	return gulp.src([
		files.indexHtml,
		files.scripts,
		files.gulpConfig,
		files.packageJson,
		files.bowerJson,
		'!' + files.bowerComponents
	], {base: '.'})
		.pipe(plugins.replace(oldProjectNameCamel, newProjectNameCamel))
		.pipe(plugins.replace(oldProjectNameKebab, newProjectNameKebab))
		.pipe(gulp.dest('.'));
}
renameProject.description = 'Renames entire project, changing strings in all .html and .js files to match the new name.'

function hasUpperCase(str) {
	return str.toLowerCase() !== str;
}


module.exports = {
	renameProject: renameProject
};
