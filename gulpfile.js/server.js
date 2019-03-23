/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const {
  src, dest, series,
} = require('gulp');

const del = require('del');

const {
  isProduction,
} = require('./util');

// static variables
const SERVER_FOLDER = path.join(__dirname, '../bin/server/');

const ENV = `../.env.${isProduction ? 'production' : 'development'}`;
const SERVER_FILES = ['../server/**/*{.js,.handlebars,.csv}', ENV]
  .map(p => path.join(__dirname, p));

/**
 * @function cleanServer
 * Deletes the previous version of the server files and replaces them
 * with the new version.
 */
const cleanServer = () => del(SERVER_FOLDER);

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

// expose the gulp functions to the outside world
module.exports = series(cleanServer, moveServerFiles);
