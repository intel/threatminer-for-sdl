'use strict';

var gulp = require('gulp'),
	plugins = {
		angularFilesort: require('gulp-angular-filesort'),
		cheerio: require('gulp-cheerio'),
    debug: require('gulp-debug'),
		domSrc: require('gulp-dom-src'),
		inject: require('gulp-inject'),
		minifyHtml: require('gulp-htmlmin'),
		naturalSort: require('gulp-natural-sort'),
		size: require('gulp-size'),
		replace: require('gulp-replace')
	},
	mainBowerFiles = require('main-bower-files'),
	series = require('stream-series');

var styles = require('./styles'),
	compileStyles = styles.compileStyles,
	moveVendorCssFiles = styles.moveVendorCssFiles,
	config = require('./config'),
	paths = config.paths,
	files = config.files,
 	fileCollections = config.fileCollections;

var injectCss = gulp.series(
	gulp.parallel(
		moveVendorCssFiles,
		compileStyles
	),
	function() {
		return gulp.src(files.indexHtml)
				.pipe(plugins.inject(gulp.src(files.tmpCss),
					{
						relative: true
					}))
				.pipe(gulp.dest(paths.app));
	}
);

var injectDev = gulp.series(
	//injectIntoKarma,
	injectJs,
	injectCss,
  injectHtml
);

var injectIgnore = [
		'sinon-as-promised',
			'angular-mocks',
	  'angular-scenario'
	   
];

function mainBowerFilesFilter(filePath) {
	for (var i = 0; i < injectIgnore.length; i++) {
		if (filePath.indexOf(injectIgnore[i]) !== -1) {
			return false;
		}
	}

	return true;
}

function injectJs() {
	return gulp.src(files.indexHtml)
		.pipe(plugins.inject(gulp.src(mainBowerFiles({ 	filter: mainBowerFilesFilter		}), {
			base: paths.app,
			read: false
		}), {
			relative: true,
			name: 'bower'
		}))
		
		.pipe(plugins.inject(gulp.src([files.moduleScripts, files.scripts, '!' + files.tests, '!' + files.bowerComponents])
				.pipe(plugins.naturalSort())
				.pipe(plugins.angularFilesort()),
			{relative: true}))
		
		.pipe(gulp.dest(paths.app));
}

//main-bower-files; gulp-inject
function injectHtml() {
  var fs = require('fs');
  if (!fs.existsSync("bower.json")) {
    console.error("injectHtml FAILED - could not locate bower.json");
    process.exit(1);
  }

  var bowerContent = JSON.parse(fs.readFileSync("bower.json", "utf-8"));
  var topBowerDependencies = [];
  for (var prop in bowerContent.dependencies) {
    topBowerDependencies.push(prop);
  }

  var filterTopHtmlFn = function (filePath) {
    for (var i = 0, j = topBowerDependencies.length; i < j; i++) {
      if (filePath.indexOf('.html') > 0 && filePath.indexOf(topBowerDependencies[i]) !== -1) {
        return true;
      }
    }
    return false;
  }

  if ((mainBowerFiles({ filter: filterTopHtmlFn }).length > 0)) {
    return gulp.src(files.indexHtml)
      .pipe(
      plugins.inject(
        gulp.src(
          mainBowerFiles({ filter: filterTopHtmlFn }), { base: paths.app, read: false }
        ),
        {
          relative: true,
          name: 'webcomp'
        }
      )
      )
      .pipe(plugins.debug({ title: 'injectHtml - do' }))
      .pipe(gulp.dest(paths.app));
  }
  else {
    return gulp.src(files.indexHtml)
      .pipe(plugins.debug({ title: 'injectHtml - skip' }))
      .pipe(gulp.dest(paths.app));
  }
}

//main-bower-files; gulp-inject
function injectHtml() {
  var fs = require('fs');
  if (!fs.existsSync("bower.json")) {
    console.error("injectHtml FAILED - could not locate bower.json");
    process.exit(1);
  }

  var bowerContent = JSON.parse(fs.readFileSync("bower.json", "utf-8"));
  var topBowerDependencies = [];
  for (var prop in bowerContent.dependencies) {
    topBowerDependencies.push(prop);
  }

  var filterTopHtmlFn = function (filePath) {
    for (var i = 0, j = topBowerDependencies.length; i < j; i++) {
      if (filePath.indexOf('.html') > 0 && filePath.indexOf(topBowerDependencies[i]) !== -1) {
        return true;
      }
    }
    return false;
  }

  if ((mainBowerFiles({ filter: filterTopHtmlFn }).length > 0)) {
    return gulp.src(files.indexHtml)
      .pipe(
      plugins.inject(
        gulp.src(
          mainBowerFiles({ filter: filterTopHtmlFn }), { base: paths.app, read: false }
        ),
        {
          relative: true,
          name: 'webcomp'
        }
      )
      )
      .pipe(plugins.debug({ title: 'injectHtml - do' }))
      .pipe(gulp.dest(paths.app));
  }
  else {
    return gulp.src(files.indexHtml)
      .pipe(plugins.debug({ title: 'injectHtml - skip' }))
      .pipe(gulp.dest(paths.app));
  }
}

function injectIntoKarma() {
	return gulp.src(files.karmaConfig)
		.pipe(plugins.inject(
			series(
				plugins.domSrc({
					file: files.indexHtml,
					selector: 'script',
					attribute: 'src'
				}),
				gulp.src(files.testDependencies),
				gulp.src([files.mockFiles, '!' + files.bowerComponents]),
				gulp.src([files.testFiles, '!' + files.bowerComponents]),
				gulp.src([files.testFolder, '!' + files.bowerComponents]),
				gulp.src(fileCollections.htmlTemplatecache),
				gulp.src(fileCollections.html)
			),
			{
				relative: true,
				starttag: 'files: [',
				endtag: ']',
				transform: function (filepath, file, i, length) {
					return '"' + filepath + '"' + (i + 1 < length ? ',' : '');
				}
			}))
		.pipe(gulp.dest('.'));
}
injectIntoKarma.description = 'Takes all the files in the index.html and injects them into the karmaConfig, also adds the test files into the karmaConfig';

function injectToDist() {
	return gulp.src(files.distIndexHtml)
		.pipe(plugins.replace(/<!-- bower:js -->([\S\s]*?)<!-- endinject -->/gmi, '<!-- bower:js -->\n<!-- endinject -->')) //remove all of the bower component scripts,  they are already minified in the javascript that is injected in the next line
		.pipe(plugins.inject(gulp.src(files.distScripts), {relative: true}))
		.pipe(plugins.inject(gulp.src(files.distCss), {relative: true}))
		.pipe(gulp.dest(paths.dist))
    .pipe(plugins.minifyHtml({
      removeComments: true
    }))
		.pipe(plugins.size({title: 'SIZE: ', showFiles: true}));
}
injectToDist.description = 'Takes the built .js and .css files in dist, injects them into index.html, and minifies the result.';

module.exports = {
	injectDev: injectDev,
	injectCss: injectCss,
	injectJs: injectJs,
	injectIntoKarma: injectIntoKarma,
	injectToDist: injectToDist
};
