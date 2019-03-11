const {
  src, dest, watch, series, parallel,
} = require('gulp');

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
const SERVER_FOLDER = `${__dirname}/bin/server/`;
const CLIENT_FOLDER = `${__dirname}/bin/client`;

const supportedLanguages = {
  en : { key : 'en', path : 'client/src/i18n/en/' },
  fr : { key : 'fr', path : 'client/src/i18n/fr/' },
};

// Cleaner helpers
// These methods clean up folders that are affected by changes in the repository
const cleanJS = () => del(`${CLIENT_FOLDER}/js/bhima`);
const cleanCSS = () => del(`${CLIENT_FOLDER}/css/bhima`);
const cleanI18n = () => del(`${CLIENT_FOLDER}/i18n`);
const cleanServer = () => del(SERVER_FOLDER);


// resource paths
const paths = {
  client : {
    javascript : [
      'client/src/js/define.js',
      'client/src/js/app.js',
      'client/src/**/*.js',
      '!client/src/i18n/**/*.js',
    ],
    css : [
      'client/src/css/*.css',
      'node_modules/ui-select/dist/select.min.css',
      'node_modules/angular-ui-grid/ui-grid.min.css',
      'node_modules/font-awesome/css/font-awesome.min.css',
      'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-csp.css',
    ],
    fonts : [
      'node_modules/typeface-open-sans/files/*',
      'node_modules/bootstrap/fonts/*',
      'node_modules/font-awesome/fonts/*',
    ],
    vendorJs : [
      'node_modules/jquery/dist/jquery.min.js', // jquery
      'node_modules/cropper/dist/cropper.js', // TODO(@jniles) - do we need this?

      // Angular
      'node_modules/angular/angular.min.js',
      'node_modules/angular-messages/angular-messages.min.js',
      'node_modules/angular-sanitize/angular-sanitize.min.js',
      'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
      'node_modules/angular-ui-grid/ui-grid.min.js',

      'node_modules/angular-touch/angular-touch.min.js',
      'node_modules/ui-select/dist/select.min.js',

      'node_modules/angular-growl-notifications/dist/angular-growl-notifications.min.js',
      'node_modules/angular-animate/angular-animate.min.js',

      'node_modules/angular-translate/dist/angular-translate.min.js',
      'node_modules/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js',
      'node_modules/angular-translate-loader-url/angular-translate-loader-url.min.js',
      'node_modules/angular-dynamic-locale/dist/tmhDynamicLocale.js',

      'node_modules/ng-file-upload/dist/ng-file-upload.min.js',

      'node_modules/ngstorage/ngStorage.min.js', // ng-storage
      'node_modules/webcam/dist/webcam.min.js', // webcam directive

      // UI Router
      'node_modules/@bower_components/angular-ui-router/release/angular-ui-router.min.js',
      'node_modules/@bower_components/angular-ui-router/release/stateEvents.min.js', // @TODO(rm this?)

      // MomentJS
      'node_modules/moment/min/moment.min.js',
      'node_modules/moment/locale/fr.js',
      'node_modules/angular-moment/angular-moment.min.js',
    ],

    // these must be globs ("**" syntax) to retain their folder structures
    static : {
      bhima : [
        'client/src/**/*.html',
        'client/src/{assets,i18n,currency}/**/*',
        '!client/src/i18n/{en,fr}/*.json',
      ],
    },
    less : 'client/src/less/bhima-bootstrap.less',
  },
  server : {
    javascript : ['server/*.js', 'server/**/*.js'],
    files      : ['server/*', 'server/**/*', '.env.*'],
  },
};

// TODO(@jniles) - make this cleaner.  We filter on angular because moment has a different
// folder structure for non-minified
if (isDevelopment) {
  paths.client.vendorJs = paths.client.vendorJs.map(file => {
    if (file.includes('angular')) {
      return file.replace('min.js', 'js');
    }

    return file;
  });

  paths.client.css = paths.client.css.map(file => file.replace('.min.css', '.css'));
}

const buildJS = series(cleanJS, compileTypescript);
const buildCSS = series(cleanCSS, compileLess, compileCSS);
const buildI18n = series(parallel(lintI18n, cleanI18n), compileI18n);
const server = series(cleanServer, moveServerFiles);
const client = series(
  parallel(buildJS, buildCSS, buildI18n, buildVendor, buildStatic, fonts, fontsUiGrid),
  collectRevisionsIntoManifest,
  templateHTML
);
const build = parallel(client, server);

function fonts() {
  return src(paths.client.fonts)
    .pipe(dest(`${CLIENT_FOLDER}/fonts/`));
}

function fontsUiGrid() {
  return src('node_modules/angular-ui-grid/fonts/*')
    .pipe(dest(`${CLIENT_FOLDER}/css/fonts/`));
}

// collect all BHIMA application code and return a single versioned JS file
// ensures previous versioned file is removed before running
function compileTypescript() {
  const typescriptConfig = {
    allowJs : true,
    target : 'es5',
    lib : ['es6', 'dom'],
    module : 'none',
    outFile : 'js/bhima/bhima.min.js',
  };

  return src(paths.client.javascript)
    .pipe(concat('bhima.concat.js'))
    .pipe(typescript(typescriptConfig))
    .pipe(gulpif(isProduction, uglify({ mangle : true })))
    .pipe(iife())
    .pipe(rev())
    .pipe(dest(CLIENT_FOLDER)) // write revisioned javascript to build folder
    .pipe(rev.manifest('rev-manifest-js.json'))
    .pipe(dest(CLIENT_FOLDER)); // write manifest to build folder
}

function collectRevisionsIntoManifest() {
  return src(`${CLIENT_FOLDER}/rev-manifest-*.json`)
    .pipe(mergeJson({ fileName : 'rev-manifest.json' }))
    .pipe(dest(CLIENT_FOLDER));
}

// collect all BHIMA application style sheets and return a single versioned CSS file
function compileCSS() {
  return src(paths.client.css)
    .pipe(concat('css/bhima.min.css'))
    .pipe(gulpif(isProduction, cssnano({ zindex : false })))
    .pipe(rev())
    .pipe(dest(CLIENT_FOLDER))
    .pipe(rev.manifest('rev-manifest-css.json'))
    .pipe(dest(CLIENT_FOLDER));
}

// copy custom BHIMA bootstrap files and build build bootsrap LESS, returns
// single CSS file
function compileLess() {
  const lessConfig = { paths : ['./node_modules/bootstrap/less'] };
  return src(paths.client.less)
    .pipe(dest(lessConfig.paths[0])) // move less file into actual bootstrap folder, this feels wrong
    .pipe(less(lessConfig))
    .pipe(gulpif(isProduction, cssnano({ zindex : false })))
    .pipe(dest(`${CLIENT_FOLDER}/css`));
}

function compileI18n() {
  const en = collectTranslationFiles(supportedLanguages.en);
  const fr = collectTranslationFiles(supportedLanguages.fr);
  return merge(en, fr);
}

// collect all external vendor code and returns a single versioned JS file
function buildVendor() {
  return src(paths.client.vendorJs)
    .pipe(concat('js/vendor/vendor.min.js'))
    .pipe(rev())
    .pipe(dest(CLIENT_FOLDER))
    .pipe(rev.manifest('rev-manifest-vendor.json'))
    .pipe(dest(CLIENT_FOLDER));
}

// collects all static files from the client (BHIMA src and vendor files)
// and moves them to the build folder, respecting folder structure
function buildStatic() {
  return src(paths.client.static.bhima)
    .pipe(dest(CLIENT_FOLDER));
}

function watchClient(done) {
  watch(paths.client.javascript, watchJS);
  watch(paths.client.css, watchCSS);
  watch([`${supportedLanguages.en.path}/**/*.json`, `${supportedLanguages.fr.path}/**/*.json`], buildI18n);

  // ensure all static bhima files are copied over to the build given changes
  // this is important to catch changes in component template files etc.
  watch(paths.client.static.bhima, watchStatic);
  done();
}

function watchStatic(done) {
  series(buildStatic, templateHTML);
  done();
}

function watchJS(done) {
  series(buildJS, templateHTML);
  done();
}

function watchCSS(done) {
  series(buildCSS, templateHTML);
  done();
}

// server build - copies all files from server/ to bin/server
/*
function server(done) {
  ();
  done();
}
*/

function moveServerFiles() {
  return src(paths.server.files)
    .pipe(dest(SERVER_FOLDER));
}

// rewrite source HTML files with build versioned files and assets
// usually run as the final step linking the build together
function templateHTML() {
  const manifest = src(`${CLIENT_FOLDER}/rev-manifest.json`);

  return src('client/src/index.html')
    .pipe(template({ isProduction, isDevelopment }))
    .pipe(revRewrite({ manifest }))
    .pipe(dest(CLIENT_FOLDER));
}

function collectTranslationFiles(details) {
  return src(`${details.path}/**/*.json`)
    .pipe(mergeJson({ fileName : `${details.key}.json` }))
    .pipe(dest(`${CLIENT_FOLDER}/i18n/`));
}

// Custom i18n linting task, promise wrapper to work with gulp ecosystem
// TODO(@jniles) - gulp allows you to return exec().  Can we just return
// the raw exec() call without the callback wrapper?
// See: https://gulpjs.com/docs/en/getting-started/async-completion
function lintI18n() {
  return new Promise((resolve, reject) => {
    const compareUtilityPath = './utilities/translation/tfcomp.js';
    const utilityCommand = `node ${compareUtilityPath} ${supportedLanguages.en.path} ${supportedLanguages.fr.path}`;

    exec(utilityCommand, (error, output, warning) => {
      if (error) { reject(error); return; }

      // eslint-disable-next-line
      if (warning) { console.error(warning); }
      resolve(output);
    });
  });
}

exports.default = build;
exports.build = build;
exports.client = client;
exports.watch = watchClient;
exports.cleanServer = cleanServer;
exports.moveServerFiles = moveServerFiles;
exports.server = server;
