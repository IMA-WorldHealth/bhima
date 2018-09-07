const gulp = require('gulp');
const gulpif = require('gulp-if');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cssnano = require('gulp-cssnano');
const template = require('gulp-template');
const rev = require('gulp-rev');
const iife = require('gulp-iife');
const less = require('gulp-less');
const mergeJson = require('gulp-merge-json');
const typescript = require('gulp-typescript');
const merge = require('merge-stream');
const revRewrite = require('gulp-rev-rewrite');
const del = require('del');

// child process for custom scripts
const { exec } = require('child_process');

// toggle client javascript minification
const isProduction = (process.env.NODE_ENV === 'production');
const isDevelopment = (process.env.NODE_ENV !== 'production');

// gulp build output directories
const SERVER_FOLDER = './bin/server/';
const CLIENT_FOLDER = './bin/client/';

const supportedLanguages = {
  en : { key : 'en', path : 'client/src/i18n/en/' },
  fr : { key : 'fr', path : 'client/src/i18n/fr/' },
};

// resource paths
const paths = {
  client : {
    javascript : [
      'client/src/js/define.js',
      'client/src/js/app.js',
      'client/src/**/*.js',
      '!client/src/i18n/**/*.js',
    ],
    css : ['client/src/css/*.css'],
    vendorJs : [
      'client/vendor/jquery/dist/jquery.min.js', // jquery
      'client/vendor/cropper/dist/cropper.js',

      // Angular
      'client/vendor/angular/angular.min.js',
      'client/vendor/angular-messages/angular-messages.min.js',
      'client/vendor/angular-sanitize/angular-sanitize.min.js',
      'client/vendor/angular-ui-router/release/angular-ui-router.min.js',
      'client/vendor/angular-ui-router/release/stateEvents.min.js', // @TODO(rm this?)
      'client/vendor/angular-bootstrap/ui-bootstrap-tpls.min.js',
      'client/vendor/angular-ui-grid/ui-grid.min.js',
      'client/vendor/angular-touch/angular-touch.min.js',
      'client/vendor/angular-ui-select/dist/select.min.js',
      'client/vendor/angular-growl-notifications/dist/angular-growl-notifications.min.js',
      'client/vendor/angular-animate/angular-animate.min.js',
      'client/vendor/angular-translate/angular-translate.min.js',
      'client/vendor/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js',
      'client/vendor/angular-translate-loader-url/angular-translate-loader-url.min.js',
      'client/vendor/angular-dynamic-locale/dist/tmhDynamicLocale.js',
      'client/vendor/ng-file-upload/ng-file-upload.min.js',
      'client/vendor/ngstorage/ngStorage.min.js', // ng-storage
      'client/vendor/webcam-directive/dist/webcam.min.js', // webcam directive

      // MomentJS
      'client/vendor/moment/moment.js',
      'client/vendor/angular-moment/angular-moment.min.js',
      'client/vendor/moment/locale/fr.js',
    ],

    // these must be globs ("**" syntax) to retain their folder structures
    static : {
      bhima : [
        'client/src/**/*',
        'client/src/index.html',
        '!client/src/js/**/*.js',
        '!client/src/modules/**/*.js',
        '!client/src/**/*.css',
        '!client/src/i18n/en/*',
        '!client/src/i18n/fr/*',
        '!client/src/i18n/fr/',
        '!client/src/i18n/en/',
      ],
      vendor : [
        'client/vendor/**/*.{css,ttf,woff,woff2,eot,svg}',
        '!client/vendor/**/src{,/**}',
        '!client/vendor/**/js{,/**}',

        // @TODO(sfount) find why these are hacked in here and improve the process
        'client/vendor/moment/moment.js',
        'client/vendor/JsBarcode/dist/JsBarcode.all.min.js',
      ],
    },
    less : 'client/src/less/bhima-bootstrap.less',
    index : 'client/src/index.html',
  },
  server : {
    javascript : ['server/*.js', 'server/**/*.js'],
    files      : ['server/*', 'server/**/*', '.env.*'],
  },
};

// external gulp tasks to build the client, server and watch for client changes
gulp.task('default', ['build']);
gulp.task('build', ['client', 'server']);
gulp.task('client', ['js', 'css', 'less', 'i18n', 'vendor', 'static'], templateHTML);
gulp.task('watch', ['watch-client']);

// collect all BHIMA application code and return a single versioned JS file
// ensures previous versioned file is removed before running
gulp.task('js', ['clean-js'], () => {
  const typescriptConfig = {
    allowJs : true,
    target : 'es5',
    lib : ['es6', 'dom'],
    module : 'none',
    outFile : 'js/bhima/bhima.min.js',
  };

  return gulp.src(paths.client.javascript)
    .pipe(concat('bhima.concat.js'))
    .pipe(typescript(typescriptConfig))
    .pipe(gulpif(isProduction, uglify({ mangle : true })))
    .pipe(iife())
    .pipe(rev())
    .pipe(gulp.dest(`${CLIENT_FOLDER}`)) // write revisioned javascript to build folder
    .pipe(rev.manifest(`${CLIENT_FOLDER}/rev-manifest.json`, { merge : true }))
    .pipe(gulp.dest('')); // write manifest to build folder
});

// collect all BHIMA application style sheets and return a single versioned CSS file
gulp.task('css', ['clean-css'], () => {
  return gulp.src(paths.client.css)
    .pipe(cssnano({ zindex : false }))
    .pipe(concat('css/bhima/bhima.min.css'))
    .pipe(rev())
    .pipe(gulp.dest(CLIENT_FOLDER))
    .pipe(rev.manifest(`${CLIENT_FOLDER}/rev-manifest.json`, { merge : true }))
    .pipe(gulp.dest(''));
});

// copy custom BHIMA bootstrap files and build build bootsrap LESS, returns
// single CSS file
gulp.task('less', () => {
  const lessConfig = { paths : ['./client/vendor/bootstrap/less'] };

  return gulp.src(paths.client.less)
    .pipe(gulp.dest(lessConfig.paths[0])) // move less file into actual bootstrap folder, this feels wrong
    .pipe(less(lessConfig))
    .pipe(gulp.dest(`${CLIENT_FOLDER}/css`));
});

gulp.task('i18n', ['lint-i18n', 'clean-i18n'], () => {
  const en = collectTranslationFiles(supportedLanguages.en);
  const fr = collectTranslationFiles(supportedLanguages.fr);

  return merge(en, fr);
});

// collect all external vendor code and returns a single versioned JS file
gulp.task('vendor', () => {
  return gulp.src(paths.client.vendorJs)
    .pipe(gulpif(isProduction, uglify({ mangle : true })))
    .pipe(concat('js/vendor/vendor.min.js'))
    .pipe(rev())
    .pipe(gulp.dest(CLIENT_FOLDER))
    .pipe(rev.manifest(`${CLIENT_FOLDER}/rev-manifest.json`, { merge : true }))
    .pipe(gulp.dest(''));
});

// collects all static files from the client (BHIMA src and vendor files)
// and moves them to the build folder, respecting folder structure
gulp.task('static', () => {
  const bhima = gulp.src(paths.client.static.bhima)
    .pipe(gulp.dest(CLIENT_FOLDER));
  const vendor = gulp.src(paths.client.static.vendor)
    .pipe(gulp.dest(`${CLIENT_FOLDER}/vendor`));

  return merge(bhima, vendor);
});

gulp.task('watch-client', () => {
  gulp.watch(paths.client.javascript, ['watch-js']);
  gulp.watch(paths.client.css, ['watch-css']);
  gulp.watch([`${supportedLanguages.en.path}/**/*.json`, `${supportedLanguages.fr.path}/**/*.json`], ['i18n']);

  // ensure all static bhima files are copied over to the build given changes
  // this is important to catch changes in component template files etc.
  gulp.watch(paths.client.static.bhima, ['watch-static']);
});

// alias tasks to run client build steps and ensures template is linked following
gulp.task('watch-static', ['static'], templateHTML);
gulp.task('watch-js', ['js'], templateHTML);
gulp.task('watch-css', ['css'], templateHTML);

// server build - copies all files from server/ to bin/server including package.json
gulp.task('server', ['clean-server'], () => {
  return gulp.src(paths.server.files)
    .pipe(gulp.dest(SERVER_FOLDER));
});

// Cleaner helpers
// These methods clean up folders that are affected by changes in the repository
gulp.task('clean-js', () => {
  return del([`${CLIENT_FOLDER}/js/bhima`]);
});

gulp.task('clean-css', () => {
  return del([`${CLIENT_FOLDER}/css/bhima`]);
});

gulp.task('clean-i18n', () => {
  return del([`${CLIENT_FOLDER}/i18n`]);
});

gulp.task('clean-server', () => {
  return del([SERVER_FOLDER]);
});

// rewrite source HTML files with build versioned files and assets
// usually run as the final step linking the build together
function templateHTML() {
  const manifest = gulp.src(`${CLIENT_FOLDER}/rev-manifest.json`);

  return gulp.src('client/src/index.html')
    .pipe(template({ isProduction, isDevelopment }))
    .pipe(revRewrite({ manifest }))
    .pipe(gulp.dest(CLIENT_FOLDER));
}

function collectTranslationFiles(details) {
  return gulp.src(`${details.path}/**/*.json`)
    .pipe(mergeJson({ fileName : `${details.key}.json` }))
    .pipe(gulp.dest(`${CLIENT_FOLDER}/i18n/`));
}

// Custom i18n linting task, promise wrapper to work with gulp ecosystem
gulp.task('lint-i18n', () => {
  return new Promise((resolve, reject) => {
    const compareUtilityPath = './utilities/translation/tfcomp.js';
    const utilityCommand = `node ${compareUtilityPath} ${supportedLanguages.en.path} ${supportedLanguages.fr.path}`;

    exec(utilityCommand, (error, output, warning) => {
      if (error) { reject(error); return; }
      if (warning) { console.error(warning); }
      resolve(output);
    });
  });
});
