// Build, Lint, and Test bhima

// TODO
//  Should we make these requires dependent on what path is being taken, so that
//  not all are required to build bhima?  In this format, there is no difference
//  between the install requirements of a developer and a production environment.

var gulp       = require('gulp'),
    gulpif     = require('gulp-if'),
    concat     = require('gulp-concat'),
    uglify     = require('gulp-uglify'),
    cssnano    = require('gulp-cssnano'),
    cssnano    = require('gulp-cssnano'),
    jshint     = require('gulp-jshint'),
    flatten    = require('gulp-flatten'),
    spawn      = require('child_process').spawn,
    path       = require('path'),
    iife       = require('gulp-iife'),
    rimraf     = require('rimraf'),
    gutil      = require('gulp-util'),
    less       = require('gulp-less'),

    // mocha for server-side testing
    mocha      = require('gulp-mocha'),

    // protractor for e2e tests
    protractor = require('gulp-protractor').protractor,

    // child process for custom scripts
    exec       = require('child_process').exec;


// constants
// toggle client javascript minification
var UGLIFY = false,

    // path to the jshintrc to use
    JSHINT_PATH = '.jshintrc',

    // TODO - remove this link
    PLUGIN_FOLDER = './bin/plugins',

    // the output folder for built server files
    SERVER_FOLDER = './bin/server/',

    // the output folder for built client files
    CLIENT_FOLDER = './bin/client/';


// resource paths
var paths = {
  client : {
    javascript : ['client/src/js/define.js', 'client/src/js/app.js', 'client/src/**/*.js', '!client/src/i18n/**/*.js', '!client/src/lib/**/*.js'],
    excludeLint: ['!client/src/lib/**/*.js'],
    css        : ['client/src/partials/**/*.css', 'client/src/css/*.css'],
    vendor     : ['client/vendor/**/*.js', 'client/vendor/**/*.css', 'client/vendor/**/*.ttf', 'client/vendor/**/*.wof*', 'client/vendor/**/*.eot','client/vendor/**/*.svg', '!client/vendor/**/src{,/**}', '!client/vendor/**/js{,/**}'],
    e2etest    : ['client/test/e2e/**/*.spec.js'],
    unittest   : [],

    // these must be globs ("**" syntax) to retain their folder structures
    static     : ['client/src/index.html', 'client/src/js/app.js', 'client/src/**/*', '!client/src/js/**/*.js', '!client/src/partials/**/*.js', '!client/src/**/*.css']
  },
  server : {
    javascript : ['server/*.js', 'server/**/*.js'],
    files      : ['server/*', 'server/**/*', '.env.*'],
    plugins    : ['plugins/*', 'plugins/**/*'],
    unittest   : []
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
 *   - [client-minify-js]   minify (via uglify) the clientside js code
 *   - [client-lint-i18n]   compares translation files for missing values
 *   - [client-mv-static]   moves the static files (html, img) to the client
 *                          folder
 *   - [client-mv-vendor]   copy the vendor files into the client/vendor folder
 *
 * To run all of the above, run the gulp task `gulp build-client`.
 *
 * Other options include
 *   - [client-watch]       watch the client/src/ for changes and run the build
*/

// run jshint on the client javascript code
gulp.task('client-lint-js', function () {
  return gulp.src(paths.client.javascript.concat(paths.client.excludeLint))
    .pipe(jshint(JSHINT_PATH))
    .pipe(jshint.reporter('default'));
});

// minify the client javascript code via uglify
// writes output to bhima.min.js
gulp.task('client-minify-js', function () {
  return gulp.src(paths.client.javascript)
    .pipe(gulpif(UGLIFY, uglify({ mangle: true })))
    .pipe(concat('js/bhima.min.js'))
    .pipe(iife())
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
gulp.task('client-mv-vendor', function () {
  return gulp.src(paths.client.vendor)
    // .pipe(flatten())
    .pipe(gulp.dest(CLIENT_FOLDER + 'vendor/'));
});

// SlickGrid repository is very modular and does not include distribution folder
// This build process combines all required components for BHIMA and optionally
// minifies the output
gulp.task('client-vendor-build-slickgrid', function () {

  // Specifiy components required by BHIMA
  var slickgridComponents = [
    'client/vendor/slickgrid/lib/jquery.event.*.js',
    'client/vendor/slickgrid/*.js',
    'client/vendor/slickgrid/plugins/*.js'
  ];

  return gulp.src(slickgridComponents)
    .pipe(concat('bhima.slickgrid.js'))
    .pipe(gulp.dest(CLIENT_FOLDER + 'vendor/slickgrid'));
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
    if (warning) { console.error(warning); }
    cb();
 	});
});

// watchs for any change and builds the appropriate route
gulp.task('watch-client', function () {
  gulp.watch(paths.client.css, ['client-minify-css']);
  gulp.watch(paths.client.javascript, ['client-minify-js']);
  gulp.watch(paths.client.static, ['client-mv-static']);
  gulp.watch(paths.client.vendor, ['client-mv-vendor']);
});

// TODO This message can be removed once the lint/build process has been transitioned
gulp.task('notify-lint-process', function () {
  gutil.log(gutil.colors.yellow('REMINDER: Please ensure you have run the command `gulp lint` before submitting a pull request to github'));
});

// builds the client with all the options available
gulp.task('build-client', function () {
  gulp.start('client-minify-js', 'client-minify-css', 'client-mv-vendor', 'client-vendor-build-slickgrid', 'client-vendor-build-bootstrap', 'client-mv-static', 'notify-lint-process');
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
 *   - [server-mv-plugins] move the server plugins into the /bin/server folder
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

// move plugins
gulp.task('server-mv-plugins', function () {
  return gulp.src(paths.server.plugins)
    .pipe(gulp.dest(PLUGIN_FOLDER));
});

// build the server
gulp.task('build-server', function () {
  gulp.start('server-mv-files', 'server-mv-plugins');
});

/* -------------------------------------------------------------------------- */

/* Testing Client Builds
 *
 * The following tasks will run unit and end-to-end tests
 * on bhima.
*/

// run the selenium server for e2e tests
gulp.task('client-test-e2e', function () {
  return gulp.src(paths.client.e2etest)
    .pipe(protractor({
      configFile : 'protractor.conf.js'
    }))
    .on('error', function (e) { throw e; });
});


/* -------------------------------------------------------------------------- */

/* Testing Server Builds
 *
 * TODO
 *
 * The following tasks will run unit tests on the bhima server using gulp-mocha
*/

/* -------------------------------------------------------------------------- */

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
