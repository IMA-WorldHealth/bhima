/*jshint -W079 */
/**
 * Build Script
 * @TODO
 * Should we make these requires dependent on what path is being taken, so that
 * not all are required to build bhima?  In this format, there is no difference
 * between the install requirements of a developer and a production environment.
 */
const gulp    = require('gulp');
const gulpif  = require('gulp-if');
const concat  = require('gulp-concat');
const uglify  = require('gulp-uglify');
const cssnano = require('gulp-cssnano');
const jshint  = require('gulp-jshint');
const flatten = require('gulp-flatten');
const path    = require('path');
const iife    = require('gulp-iife');
const rimraf  = require('rimraf');
const gutil   = require('gulp-util');
const less    = require('gulp-less');

// child process for custom scripts
const exec = require('child_process').exec;

// toggle client javascript minification
const UGLIFY = false;

// path to the jshintrc to use
const JSHINT_PATH = '.jshintrc';

// the output folder for built server files
const SERVER_FOLDER = './bin/server/';

// the output folder for built client files
const CLIENT_FOLDER = './bin/client/';

// resource paths
var paths = {
  client : {
    javascript : [
      'client/src/js/define.js',
      'client/src/js/app.js',
      'client/src/**/*.js',
      '!client/src/i18n/**/*.js'
    ],
    css : [
      'client/src/partials/**/*.css',
      'client/src/css/*.css'
    ],
    vendorStyle : [
      'client/vendor/**/*.{css,ttf,woff,woff2,eot,svg}',

      // this is very cheeky
      'client/vendor/moment/moment.js',
      '!client/vendor/**/src{,/**}',
      '!client/vendor/**/js{,/**}'
    ],
    vendorJs   : [
      // jquery
      'client/vendor/jquery/dist/jquery.min.js',

      // Angular
      'client/vendor/angular/angular.min.js',
      'client/vendor/angular-messages/angular-messages.min.js',

      // Angular Sanitize
      'client/vendor/angular-sanitize/angular-sanitize.js',

      // Angular UI
      'client/vendor/angular-ui-router/release/angular-ui-router.min.js',
      'client/vendor/angular-bootstrap/ui-bootstrap-tpls.js',
      'client/vendor/angular-ui-grid/ui-grid.min.js',

      // Angular UI Select
      'client/vendor/angular-ui-select/dist/select.js',

      // ChartJS
      'client/vendor/Chart.js/dist/Chart.bundle.min.js',
      'client/vendor/angular-chart.js/dist/angular-chart.min.js',

      // Angular Growl
      // 'client/vendor/angular-growl-notifications/dist/angular-growl-notifications.js',
      'client/vendor/angular-animate/angular-animate.js',

      // MomentJS
      'client/vendor/moment/moment.js',
      'client/vendor/angular-moment/angular-moment.js',
      'client/vendor/moment/locale/fr.js',

      // Angular Translate
      'client/vendor/angular-translate/angular-translate.min.js',
      'client/vendor/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js',
      'client/vendor/angular-translate-loader-url/angular-translate-loader-url.min.js',

      // Angular Locale
      'client/vendor/angular-dynamic-locale/dist/tmhDynamicLocale.js',

      // Angular File Upload
      'client/vendor/ng-file-upload/ng-file-upload.min.js',

      // ngStorage
      'client/vendor/ngstorage/ngStorage.min.js'
    ],
    e2etest    : [
      'client/test/e2e/**/*.spec.js'
    ],

    // these must be globs ("**" syntax) to retain their folder structures
    static : [
      'client/src/index.html',
      'client/src/js/app.js',
      'client/src/**/*',
      '!client/src/js/**/*.js',
      '!client/src/partials/**/*.js',
      '!client/src/**/*.css'
    ]
  },
  server : {
    javascript : ['server/*.js', 'server/**/*.js'],
    files      : ['server/*', 'server/**/*', '.env.*'],
  }
};

/* -------------------------------------------------------------------------- */

/*
 * Client Builds
 *
 * The client build process takes files from the client/src/ folder
 * and writes them to the /bin/client/ folder.  There are tasks to do
 * the following:
 *   - [client-lint-js]     lint the client javascript code (via jshint)
 *   - [client-minify-css]  minify (via css nano) the css
 *   - [client-compile-js]   minify (via uglify) the clientside js code
 *   - [client-lint-i18n]   compares translation files for missing values
 *   - [client-mv-static]   moves the static files (html, img) to the client
 *                          folder
 * To run all of the above, run the gulp task `gulp build-client`.
 *
 * Other options include
 *   - [client-watch]       watch the client/src/ for changes and run the build
*/

// run jshint on the client javascript code
gulp.task('client-lint-js', function () {
  return gulp.src(paths.client.javascript)
    .pipe(jshint(JSHINT_PATH))
    .pipe(jshint.reporter('default'));
});

// minify the client javascript code via uglify writes output to bhima.min.js
gulp.task('client-compile-js', function () {
  return gulp.src(paths.client.javascript)
    .pipe(gulpif(UGLIFY, uglify({ mangle: true })))
    .pipe(concat('js/bhima.min.js'))
    .pipe(iife())
    .pipe(gulp.dest(CLIENT_FOLDER));
});

// minify the vendor JS code and compact into a vendor.min.js file.
gulp.task('client-compile-vendor', function () {
  return gulp.src(paths.client.vendorJs)
    .pipe(gulpif(UGLIFY, uglify({ mangle: true })))
    .pipe(concat('js/vendor.min.js'))
    .pipe(gulp.dest(CLIENT_FOLDER));
});


// minify the client css styles via minifycss
// writes output to style.min.css
gulp.task('client-minify-css', function () {
  return gulp.src(paths.client.css)
    .pipe(cssnano())
    .pipe(concat('style.min.css'))
    .pipe(gulp.dest(CLIENT_FOLDER + 'css/'));
});

// move vendor files over to the /vendor directory
gulp.task('client-mv-vendor-style', function () {
  return gulp.src(paths.client.vendorStyle)
    .pipe(gulp.dest(CLIENT_FOLDER + 'vendor/'));
});

gulp.task('client-vendor-build-bootstrap', function () {

  /**
   * For now this just moves the latest version of bootstrap into the repository
   * This build process should compile the latest bhima less definition with the
   * latest vendor files
   * - move less file to bootstrap vendor folder
   * - compile with lessc
   * - copy CSS into static file folder
   */

  var bhimaDefinition = 'client/src/less/bhima-bootstrap.less';

  return gulp.src(bhimaDefinition)
    .pipe(gulp.dest('client/vendor/bootstrap/less'))
    .pipe(less({
      paths : ['./client/vendor/bootstrap/less/mixins']
    }))
    .pipe(gulp.dest(CLIENT_FOLDER + 'css'));
});

// move static files to the public directory
gulp.task('client-mv-static', ['client-lint-i18n'], function () {
  return gulp.src(paths.client.static)
    .pipe(gulp.dest(CLIENT_FOLDER));
});

// custom task: compare the English and French for missing tokens
gulp.task('client-lint-i18n', function (cb) {
  var progPath = './utilities/translation/tfcomp.js',
      enPath = 'client/src/i18n/en.json',
      frPath = 'client/src/i18n/fr.json';

  exec('node ' + [progPath, enPath, frPath].join(' '), function(err, _, warning) {
    if (err) { throw err; }
    if (warning) { console.error(warning); }
    cb();
 	});
});

// watches for any change and builds the appropriate route
gulp.task('watch-client', function () {
  gulp.watch(paths.client.css, ['client-minify-css']);
  gulp.watch(paths.client.javascript, ['client-compile-js']);
  gulp.watch(paths.client.static, ['client-mv-static']);
  gulp.watch(paths.client.vendor, ['client-mv-vendor-style', 'client-compile-vendor']);
});

// TODO This message can be removed once the lint/build process has been transitioned
gulp.task('notify-lint-process', function () {
  gutil.log(gutil.colors.yellow('REMINDER: Please ensure you have run the command `gulp lint` before submitting a pull request to github'));
});

// builds the client with all the options available
gulp.task('build-client', function () {
  gulp.start('client-compile-js', 'client-compile-vendor', 'client-minify-css', 'client-mv-vendor-style', 'client-vendor-build-bootstrap', 'client-mv-static', 'notify-lint-process');
});

// Lint client code seperately from build process
// TODO Processes for linting server code - requires uncategorised commit update
gulp.task('lint', function () {
  gulp.start('client-lint-js', 'client-lint-i18n');
});

/* -------------------------------------------------------------------------- */

/*
 * Server Builds
 *
 * The server build process takes files from the server/ folder and
 * writes them to the /bin/server/ folder.  It also copies the package.json
 * folder for convenience.
 *
 * Building will run the following tasks:
 *   - [server-lint-js]    lint the server javascript code (via jshint)
 *   - [server-mv-files]   move the server files into the /bin/server folder
 *
 * To run all of the above, run the gulp task `gulp build-server`.
*/

// run jshint on all server javascript files
gulp.task('server-lint-js', function () {
  return gulp.src(paths.server.javascript)
    .pipe(jshint(JSHINT_PATH))
    .pipe(jshint.reporter('default'));
});

// move the server files into /bin/server
gulp.task('server-mv-files', function () {
  return gulp.src(paths.server.files)
    .pipe(gulp.dest(SERVER_FOLDER));
});

// build the server
gulp.task('build-server', function () {
  gulp.start('server-mv-files');
});

/* -------------------------------------------------------------------------- */

/** shared utilities */

gulp.task('clean', function (cb) {
  rimraf('./bin/', cb);
});

gulp.task('build', ['clean'], function () {
  gulp.start('build-client', 'build-server');
});

gulp.task('test', ['build'], function () {
  gulp.start('client-test-e2e');
});

// run the build-client and build-server tasks when no arguments
gulp.task('default', ['clean'], function () {
  gulp.start('build-client', 'build-server');
});
