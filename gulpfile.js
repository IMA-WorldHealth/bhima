/**
 * Build Script
 * @TODO
 * Should we make these requires dependent on what path is being taken, so that
 * not all are required to build bhima?  In this format, there is no difference
 * between the install requirements of a developer and a production environment.
 *
 * @TODO
 * Make sure all CSS from vendors are gathered and compiled into a vendor minified
 * CSS file.
 */
const gulp = require('gulp');
const gulpif = require('gulp-if');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cssnano = require('gulp-cssnano');
const template = require('gulp-template');
const rev = require('gulp-rev');
const revReplace = require('gulp-rev-replace');
const iife = require('gulp-iife');
const pump = require('pump');
const rimraf = require('rimraf');
const less = require('gulp-less');
const merge = require('gulp-merge-json');

// child process for custom scripts
const exec = require('child_process').exec;

// toggle client javascript minification
const isProduction = (process.env.NODE_ENV === 'production');
const isDevelopment = (process.env.NODE_ENV !== 'production');

// the output folder for built server files
const SERVER_FOLDER = './bin/server/';

// the output folder for built client files
const CLIENT_FOLDER = './bin/client/';

// globals
const MANIFEST_PATH = 'rev-manifest.json';
const BHIMA_LESS = 'client/src/less/bhima-bootstrap.less';

// resource paths
const paths = {
  client : {
    javascript : [
      'client/src/js/define.js',
      'client/src/js/app.js',
      'client/src/**/*.js',
      '!client/src/i18n/**/*.js',
    ],
    css         : ['client/src/css/*.css'],
    vendorStyle : [
      'client/vendor/**/*.{css,ttf,woff,woff2,eot,svg}',

      // this is very cheeky
      'client/vendor/moment/moment.js',
      'client/vendor/JsBarcode/dist/JsBarcode.all.min.js',

      '!client/vendor/**/src{,/**}',
      '!client/vendor/**/js{,/**}',
    ],
    vendorJs : [
      // jquery
      'client/vendor/jquery/dist/jquery.min.js',

      // Angular
      'client/vendor/angular/angular.min.js',
      'client/vendor/angular-messages/angular-messages.min.js',

      // Angular Sanitize
      'client/vendor/angular-sanitize/angular-sanitize.min.js',

      // Angular UI
      'client/vendor/angular-ui-router/release/angular-ui-router.min.js',

      // @TODO - rm this
      'client/vendor/angular-ui-router/release/stateEvents.min.js',

      'client/vendor/angular-bootstrap/ui-bootstrap-tpls.min.js',
      'client/vendor/angular-ui-grid/ui-grid.min.js',

      // Angular Touch
      'client/vendor/angular-touch/angular-touch.min.js',

      // Angular UI Select
      'client/vendor/angular-ui-select/dist/select.min.js',

      // ChartJS
      'client/vendor/chart.js/dist/Chart.min.js',
      'client/vendor/angular-chart.js/dist/angular-chart.min.js',

      // Angular Growl
      'client/vendor/angular-growl-notifications/dist/angular-growl-notifications.min.js',
      'client/vendor/angular-animate/angular-animate.min.js',

      // MomentJS
      'client/vendor/moment/moment.js',
      'client/vendor/angular-moment/angular-moment.min.js',
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
      'client/vendor/ngstorage/ngStorage.min.js',
    ],
    translate_en : ['client/src/i18n/en/*.json'],

    translate_fr : ['client/src/i18n/fr/*.json'],

    // these must be globs ("**" syntax) to retain their folder structures
    static : [
      'client/src/js/app.js',
      'client/src/**/*',
      '!client/src/index.html',
      '!client/src/js/**/*.js',
      '!client/src/modules/**/*.js',
      '!client/src/**/*.css',
      '!client/src/i18n/en/*',
      '!client/src/i18n/fr/*',
      '!client/src/i18n/fr/',
      '!client/src/i18n/en/'
    ],
    index : 'client/src/index.html',
  },
  server : {
    javascript : ['server/*.js', 'server/**/*.js'],
    files      : ['server/*', 'server/**/*', '.env.*'],
  },
};

/* -------------------------------------------------------------------------- */

/*
 * Client Builds
 *
 * The client build process takes files from the client/src/ folder
 * and writes them to the /bin/client/ folder.  There are tasks to do
 * the following:
 *   - [client-minify-css]  minify (via css nano) the css
 *   - [client-compile-js]  minify (via uglify) the client-side js code
 *   - [client-mv-static]   moves the static files (html, img) to the client
 *                          folder
 * To run all of the above, run the gulp task `gulp build-client`.
 *
 * Other options include
 *   - [client-watch]       watch the client/src/ for changes and run the build
*/


// minify the client javascript code via uglify writes output to bhima.min.js
gulp.task('client-compile-js', (cb) => {
  pump([
    gulp.src(paths.client.javascript),
    gulpif(isProduction, uglify({ mangle: true })),
    concat('js/bhima.min.js'),
    iife(),
    gulp.dest(CLIENT_FOLDER),
  ], cb);
});

// minify the vendor JS code and compact into a vendor.min.js file.
gulp.task('client-compile-vendor', () =>
  gulp.src(paths.client.vendorJs)
    .pipe(gulpif(isProduction, uglify({ mangle: true })))
    .pipe(concat('js/vendor.min.js'))
    .pipe(gulp.dest(CLIENT_FOLDER))
);


// minify the client css styles via cssnano
// writes output to style.min.css
gulp.task('client-compile-css', () =>
  gulp.src(paths.client.css)
    .pipe(cssnano())
    .pipe(concat('css/style.min.css'))
    .pipe(gulp.dest(CLIENT_FOLDER))
);

// move vendor files over to the /vendor directory
// TODO - separate movement of fonts from the movement of styles
gulp.task('client-mv-vendor-style', () =>
  gulp.src(paths.client.vendorStyle)
    .pipe(gulp.dest(`${CLIENT_FOLDER}vendor/`))
);

gulp.task('client-vendor-build-bootstrap', () =>
  /**
   * For now this just moves the latest version of bootstrap into the repository
   * This build process should compile the latest bhima less definition with the
   * latest vendor files
   * - move less file to bootstrap vendor folder
   * - compile with less
   * - copy CSS into static file folder
   */
  gulp.src(BHIMA_LESS)
    .pipe(gulp.dest('client/vendor/bootstrap/less/'))
    .pipe(less({
      paths : ['./client/vendor/bootstrap/less/'],
    }))
    .pipe(gulp.dest(`${CLIENT_FOLDER}css`))
);

// move static files to the public directory
gulp.task('client-mv-static', ['lint-i18n'], () =>
  gulp.src(paths.client.static)
    .pipe(gulp.dest(CLIENT_FOLDER))
);

// custom task: compare the English and French for missing tokens
gulp.task('lint-i18n', (cb) => {
  const progPath = './utilities/translation/tfcomp.js';
  const enPath = 'client/src/i18n/en/';
  const frPath = 'client/src/i18n/fr/';

  exec(`node ${progPath} ${enPath} ${frPath}`, (err, _, warning) => {
    if (err) { throw err; }
    if (warning) { console.error(warning); }
    cb();
  });
});

//compile i18n files english
gulp.task('client-compile-i18n-en', () =>
gulp.src(paths.client.translate_en)
  .pipe(merge({fileName : 'en.json'}))
  .pipe(gulp.dest(CLIENT_FOLDER + 'i18n/'))
);

//compile i18n files french
gulp.task('client-compile-i18n-fr', () =>
gulp.src(paths.client.translate_fr)
  .pipe(merge({fileName : 'fr.json'}))
  .pipe(gulp.dest(CLIENT_FOLDER + 'i18n/'))
);

// watches for any change and builds the appropriate route
gulp.task('watch-client', () => {
  gulp.watch(paths.client.css, ['client-compile-css']);

  // client-compile-assets calls client-compute-hashes which in turn runs client-compile-js
  gulp.watch(paths.client.javascript, ['client-compile-assets']);
  gulp.watch(paths.client.static, ['client-mv-static']);
  gulp.watch(paths.client.vendor, ['client-mv-vendor-style', 'client-compile-vendor']);
});

// gather a list of files to rewrite revisions for
const toHash = ['**/*.min.js', '**/*.css'].map(file => `${CLIENT_FOLDER}${file}`);

gulp.task('client-compute-hashes', ['client-compile-js', 'client-compile-vendor', 'client-compile-css'], () =>
  gulp.src(toHash)
    .pipe(rev())
    .pipe(gulp.dest(CLIENT_FOLDER))
    .pipe(rev.manifest(MANIFEST_PATH))
    .pipe(gulp.dest(CLIENT_FOLDER))
);

gulp.task('client-compile-assets', ['client-mv-static', 'client-compute-hashes'], () =>
  gulp.src(paths.client.index)
    .pipe(template({ isProduction, isDevelopment }))
    .pipe(revReplace({ manifest: gulp.src(`${CLIENT_FOLDER}${MANIFEST_PATH}`) }))
    .pipe(gulp.dest(CLIENT_FOLDER))
);

// TODO - streamline piping so that all the assets - CSS, javascript
// are built with rev() and then written with rev.manifest({ merge : true });
// Then the last thing will be to rewrite index.html, replacing the values
// with gulp-replace and then replacing the manifest itself.
gulp.task('build-client', () => {
  gulp.start('client-compile-assets', 'client-vendor-build-bootstrap', 'client-mv-vendor-style', 'client-compile-i18n-en', 'client-compile-i18n-fr');
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
 *   - [server-mv-files]   move the server files into the /bin/server folder
 *
 * To run all of the above, run the gulp task `gulp build-server`.
*/

// move the server files into /bin/server
gulp.task('server-mv-files', () =>
  gulp.src(paths.server.files)
    .pipe(gulp.dest(SERVER_FOLDER))
);

// build the server
gulp.task('build-server', () =>
  gulp.start('server-mv-files')
);

/* -------------------------------------------------------------------------- */

/** shared utilities */

gulp.task('clean', (cb) => {
  if (isProduction) { return cb(); }
  return rimraf('./bin/', cb);
});

gulp.task('build', ['clean'], () => {
  gulp.start('build-client', 'build-server');
});

// run the build-client and build-server tasks when no arguments
gulp.task('default', ['clean'], () => {
  gulp.start('build-client', 'build-server');
});
