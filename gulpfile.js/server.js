/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const mkdirp = require('mkdirp');
const {
  src, dest, series,
} = require('gulp');

const del = require('del');

const SERVER_FOLDER = path.join(__dirname, '../bin/server/');
const SERVER_PATHS = ['../server/**/*{.js,.handlebars,.csv}'];

const SERVER_FILES = SERVER_PATHS.map(p => path.join(__dirname, p));

/**
 * @function cleanServer
 * Deletes the previous version of the server files and replaces them
 * with the new version.
 */
const cleanServer = () => del(SERVER_FOLDER);

const cleanEnv = () => del(path.join(__dirname, '../bin/.env'));

/**
 * @function moveServerFiles
 *
 * @description
 * Copies the server files from the server folder into a distribution
 * folder.
 */
function moveServerFiles() {
  return src(SERVER_FILES)
    .pipe(dest(SERVER_FOLDER));
}

/**
 * @function moveEnvFile
 *
 * @description
 * Copies the .env file over to the build dir.
 */
function moveEnvFile(cb) {
  if (process.env.CI) { return cb(); }
  return src(path.join(__dirname, '../.env'))
    .pipe(dest(path.join(__dirname, '../bin/')));
}

/**
 * @function createReportsDirectory
 *
 * @description
 * Creates the server/reports/ directory in the server folder to save reports.
 * NOTE(@jniles) - there is an open issue (#3650) to move this to an environmental
 * variable.
 */
async function createReportsDirectory(cb) {
  try {
    const res = await mkdirp(path.join(SERVER_FOLDER, 'reports/'));
    cb(null, res);
  } catch (e) {
    cb(e);
  }
}

// expose the gulp functions to the outside world
module.exports = series(cleanServer, cleanEnv, createReportsDirectory, moveEnvFile, moveServerFiles);
