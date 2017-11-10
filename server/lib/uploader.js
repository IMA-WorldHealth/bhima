/**
 * @module uploader
 *
 * @description
 * This module is responsible for configuring uploading middleware for the
 * server using multer.  It should be injected as a middleware in routes that
 * require uploads to be handled with a directory name for prefixing the
 * uploads.
 *
 * @example
 * const uploader = require('./lib/uploader');
 * const app = require('express')();
 * const routes = require('./routes');
 *
 * app.post('/some/route', uploader.middleware('directoryName', 'fieldNames'),
 *   routes.controller);
 *
 * @requires path
 * @requires mkdirp
 * @requires multer
 * @requires debug
 * @requires uuid/v4
 *
 * @todo
 *  1) Ensure that a max-size is properly handled with error codes
 *  2) Limit the number of files able to be processed at a single go
 */

const path = require('path');
const mkdirp = require('mkdirp');
const multer = require('multer');
const uuid = require('uuid/v4');
const debug = require('debug')('app:uploader');

// configure the uploads directory based on global process variables
const defaultDir = 'uploads'; // NOTE: this must be a relative path
const dir = process.env.UPLOAD_DIR || defaultDir; // relative path
const fsdir = path.join(process.cwd(), dir); // global path

if (!process.env.UPLOAD_DIR) {
  debug(`the environmental variable UPLOAD_DIR is not defined.  The application will default to using ${fsdir} as the upload directory.`);
}

// attach the upload directory path for outside consumption
exports.directory = dir;

// export the uploader
exports.middleware = Uploader;

/**
 * @constructor
 *
 * @description
 * A middleware wrapper for multer to generate unique filenames and store files
 * in the upload directory.
 *
 * @param {String} prefix - the directory name to prefix paths with (required)
 * @param {String} fields - the name given to the files uploaded (required)
 */
function Uploader(prefix, fields) {
  // format the upload directory.  Add a trailing slash for consistency
  const hasTrailingSlash = (prefix[prefix.length - 1] === '/');
  const directory = path.join(dir, hasTrailingSlash ? prefix : `${prefix}/`);

  // configure the storage space using multer's diskStorage.  This will allow
  const storage = multer.diskStorage({
    destination : (req, file, cb) => {
      // note: need absolute path here for mkdirp
      const folder = path.join(process.cwd(), directory);
      debug(`upload dirctory ${folder} does not exist.`);
      debug(`creating upload directory ${folder}.`);
      mkdirp(folder, err => cb(err, folder));
    },
    filename : (req, file, cb) => {
      const id = uuid();

      // ensure that a link is passed to the req.file object
      file.link = `${directory}${id}`;
      debug(`storing file in ${file.link}.`);
      cb(null, id);
    },
  });

  // set up multer as the middleware
  return multer({ storage }).array(fields);
}
