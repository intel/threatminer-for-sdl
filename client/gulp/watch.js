

const gulp = require('gulp');


const plugins = {
  // gulp.watch doesn't watch for additions or deletion of new files- so I'm using gulp-watch plugin.
  watch: require('gulp-watch'),
};


const browserSync = require('browser-sync');


const del = require('del');


const globby = require('globby');

const compileStyles = require('./styles').compileStyles;


const build = require('./build');


const buildDist = build.buildDist;


const moveCssToDist = build.moveCssToDist;


const moveScriptsToDist = build.moveScriptsToDist;


const moveIconsToDist = build.moveIconsToDist;


const moveImagesToDist = build.moveImagesToDist;


const moveJsonToDist = build.moveJsonToDist;


const moveHtml = build.moveHtml;


const moveIndexHtml = build.moveIndexHtml;


const templatifyHtml = build.moveAndTemplatifyHtml;


const inject = require('./inject');


const injectDev = inject.injectDev;


const injectJs = inject.injectJs;


const injectToDist = inject.injectToDist;


const config = require('./config');


const paths = config.paths;


const files = config.files;


const fileCollections = config.fileCollections;


function watchDev(done) {
  plugins.watch(
    globby.sync(fileCollections.styles),
    {
      events: ['change'],
    },
    gulp.series(
      () => compileStyles()
        .pipe(browserSync.reload({ stream: true })),
    ),
  );

  plugins.watch(
    globby.sync(fileCollections.scripts),
    {
      events: ['change', 'add', 'addDir', 'unlink', 'unlinkDir'],
    },
    gulp.series(

      injectJs,

      browserSync.reload,
    ),
  );

  plugins.watch(
    globby.sync(fileCollections.html),
    {
      events: ['add', 'addDir', 'unlink', 'unlinkDir', 'change'],
    },
    gulp.series(browserSync.reload),
  );

  plugins.watch(
    files.bowerComponents,
    {
      events: ['change', 'add', 'addDir', 'unlink', 'unlinkDir'],
    },
    gulp.series(
      injectDev,
      browserSync.reload,
    ),
  );

  done();
}

function watchDist(done) {
  plugins.watch(
    globby.sync(fileCollections.htmlRevable),
    {
      events: ['add', 'addDir', 'unlink', 'unlinkDir', 'change'],
    },
    gulp.series(
      moveHtml,
      browserSync.reload,
    ),
  );

  plugins.watch(
    files.indexHtml,
    {
      events: ['add', 'addDir', 'unlink', 'unlinkDir', 'change'],
    },
    gulp.series(
      moveIndexHtml,
      injectToDist,
      browserSync.reload,
    ),
  );

  plugins.watch(
    globby.sync(fileCollections.htmlTemplatecache),
    {
      events: ['add', 'addDir', 'unlink', 'unlinkDir', 'change'],
    },
    gulp.series(
      done => del([`${paths.dist}/template*.js`], done),
      templatifyHtml,
      injectToDist,
      browserSync.reload,
    ),
  );

  plugins.watch(
    globby.sync(fileCollections.styles),
    {
      events: ['add', 'addDir', 'change'],
    },
    gulp.series(
      done => del([`${paths.distStyles}/main*.css`], done),
      compileStyles,
      () => moveCssToDist()
        .pipe(browserSync.reload({ stream: true })),
      injectToDist,
      browserSync.reload,
    ),
  );

  plugins.watch(
    globby.sync(fileCollections.scripts),
    {
      events: ['add', 'addDir', 'unlink', 'unlinkDir', 'change'],
    },
    gulp.series(
      done => del([`${paths.dist}/app*.js`], done),

      injectJs,

      moveScriptsToDist,
      injectToDist,
      browserSync.reload,
    ),
  );

  plugins.watch(
    files.bowerComponents,
    {
      // TODO: Also watch bower_components change event? But in a smart way, because several files could change in quick succession.
      events: ['add', 'addDir', 'unlink', 'unlinkDir'],
    },
    gulp.series(
      buildDist,
      browserSync.reload,
    ),
  );

  plugins.watch(
    files.images,
    {
      events: ['add', 'addDir', 'unlink', 'unlinkDir'],
    },
    gulp.series(moveImagesToDist),
  );

  plugins.watch(
    globby.sync(fileCollections.favicons),
    {
      events: ['add', 'addDir', 'unlink', 'unlinkDir'],
    },
    gulp.series(moveIconsToDist),
  );

  plugins.watch(
    globby.sync(fileCollections.json),
    {
      events: ['add', 'addDir', 'unlink', 'unlinkDir'],
    },
    gulp.series(moveJsonToDist),
  );

  done();
}


module.exports = {
  watchDev,
  watchDist,
};
