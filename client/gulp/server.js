

const gulp = require('gulp');


const browserSync = require('browser-sync');

const build = require('./build');


const buildDev = build.buildDev;


const buildDist = build.buildDist;


const watch = require('./watch');


const watchDev = watch.watchDev;


const watchDist = watch.watchDist;


const paths = require('./config').paths;


const modRewrite = require('connect-modrewrite');


function browserSyncOptions(serverBaseDir) {
  return {
    server: {
      baseDir: serverBaseDir,
      middleware: [
        modRewrite(['!\.html|\.js|\.css|\.png|\.woff|\.ttf$ /index.html [L]']),
      ],
    },
    port: 9000,
    ghostMode: {
      clicks: true,
      location: false,
      forms: true,
      scrolling: true,
    },
    injectChanges: true,
    logFileChanges: true,
    logPrefix: 'browser-sync',
    notify: true,
    reloadDelay: 100,
  };
}

const serveDev = gulp.series(
  buildDev,
  watchDev,
  (done) => {
    if (browserSync.active) {
      done();
      return;
    }

    browserSync(browserSyncOptions([paths.app, '.']));
    done();
  },
);

const serveDist = gulp.series(
  buildDist,
  watchDist,
  (done) => {
    if (browserSync.active) {
      done();
      return;
    }

    browserSync(browserSyncOptions([paths.dist]));
    done();
  },
);


module.exports = {
  serveDev,
  serveDist,
};
