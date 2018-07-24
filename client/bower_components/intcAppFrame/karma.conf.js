module.exports = function (config) {
  config.set({
    autoWatch: true,
    basePath: '',
    browsers: ['PhantomJS'],
    captureTimeout: 5000,
    colors: true,
    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        { type: 'html', subdir: 'report-html' },
        { type: 'lcov', subdir: 'report-lcov' },
        { type: 'text-summary' }
      ]
    },
    exclude: [],
    frameworks: ['mocha', 'chai', 'chai-sinon'],
    files: [
      "docs/bower_components/angular/angular.js",
      "docs/bower_components/angular-mocks/angular-mocks.js",
      "docs/bower_components/angular-sanitize/angular-sanitize.js",
      "docs/bower_components/jquery/dist/jquery.js",
      "docs/bower_components/bootstrap-sass/assets/javascripts/bootstrap.js",
      "docs/bower_components/intc-enter/src/intcEnter.directive.js",
      'js/intcAppFrame.js',
      'js/intcAppFrame.templates.js',
      'js/dataDrivenLinks.directive.js',
      'templates/*.html',
      'tests/*.js'
    ],
    logLevel: config.LOG_INFO,
    port: 9876,
    preprocessors: {
      'templates/*.html': ['ng-html2js'],
      'js/*.js': ['coverage'],
    },
    reporters: ['progress', 'coverage'],
    runnerPort: 9100,
    singleRun: false
  });
};
