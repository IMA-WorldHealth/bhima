/**
 * @overview ReportManager
 *
 * @description
 * The report manager is a wrapper for bhima's reporting capabilities, providing
 * easy ways to create JSON/HTML/PDF reports from templates and data.
 *
 * @todo
 *  1. Create a generic Report API for reading reports from the database and
 *    sending them back to the client.
 *  2. Complete the methods for saving reports
 *
 *
 *
 * @requires lodash
 * @requires path
 * @requires fs
 * @requires lib/errors/BadRequest
 */
'use strict';

const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const q = require('q');
const mkdirp = require('mkdirp');
const uuid = require('node-uuid');

const BadRequest = require('./errors/BadRequest');
const db = require('./db');

// renderers
const renderers = {
  json : require('./renderers/json'),
  html : require('./renderers/html'),
  pdf  : require('./renderers/pdf')
};

// default report configuration
const defaults = {
  pageSize: 'A4',
  orientation: 'portrait',
  lang: 'en',
  renderer: 'pdf'
};

// Constants
const SAVE_DIR = path.resolve(path.join(__dirname, 'server/reports/'));
const DETAIL_SQL = `
  SELECT r.uuid, r.label, r.type, r.parameters, r.link, r.timestamp, r.user_id
  FROM report AS r WHERE r.uuid = ?;
`;
const LIST_SQL = `
  SELECT r.uuid, r.label, r.type, r.parameters, r.link, r.timestamp, r.user_id
  FROM report AS r WHERE r.type = ?;
`;
const DELETE_SQL = `
  DELETE FROM report WHERE uuid = ?;
`;
const UPDATE_SQL = `
   UPDATE report SET ? WHERE uuid = ?;
`;
const SAVE_SQL = `
  INSERT INTO report VALUES ?;
`;


// Class Declaration

class ReportManager {

  /**
   * @constructor
   *
   * @description
   * The ReportManager takes in a template path information and rendering
   * options.  It returns an instance of the report manager, ready to be
   * prepared with session data and the rendered with data.
   *
   * @param {String} templatePath - the path to the template file
   * @param {Object} metadata - any metadata that needs to appear in the report
   * @param {Object} options - rendering + default options for the report
   */
  constructor(templatePath, metadata, options) {
    this.options = _.clone(options || {});

    // merge options into default options
    _.defaults(this.options, defaults);

    // normalize the path for different operating systems
    this.template = path.normalize(templatePath);

    // set the renderer based on the provided options
    this.renderer = renderers[this.options.renderer || this.defaults.renderer];

    if (!this.renderer) {
      throw new BadRequest(`The application does not support rendering ${options.renderer}.`, 'ERRORS.INVALID_RENDERER');
    }

    // remove render-specific options
    delete options.renderer;
    delete options.lang;

    // set the metadata
    this.metadata = metadata;
    delete this.metadata.path; // @fixme - remove user paths that are annoying to print out
  }

  /**
   * @method render
   *
   * @description
   * This method renders the final report as needed.
   *
   * @param {Object} data - the report data to be passed to the renderer's
   *    render() function.
   */
  render(data) {
    const metadata = this.metadata;
    const renderer = this.renderer;

    // set the render timestamp
    metadata.timestamp = new Date();

    // merge the data object before templating
    _.merge(data, { metadata });

    // render the report using the stored renderer
    const promise = renderer.render(data, this.template, this.options);

    // send back the headers and report
    return promise.then(report => {
      this.stream = report;
      return { headers: renderer.headers, report };
    });
  }

  /**
   * @method save
   *
   * @description
   * This method saves the report in the report directory to be looked up later.
   */
  save() {
    const dfd = q.defer();

    if (!this.stream) {
      return q.reject(`
        ReportManger.render() must be called and complete before saving the
        report.
      `);
    }

    // generate a unique id for the report name
    const reportId = uuid.v4();
    const options = this.options;

    // make the report name using the
    const fname = reportId + this.renderer.extension;
    const link = path.join(SAVE_DIR, fname);

    const data = {
      uuid : reportId,
      title : options.title,
      type : options.type,
      link : link,
      timestamp : new Date(),
      user_id : options.user.id
    };

    dfd.resolve(reportId);

    /*
    fs.writeFile(fname, report, (err) => {
      if (err) { return dfd.reject(err); }

      db.exec(SAVE_SQL, [data])
        .then(() => dfd.resolve({ uuid: reportId }))
        .catch(dfd.reject);
    });

    */
    return dfd.promise;
  }

  // crud operations on reports
  list(type) {
    return db.exec(LIST_SQL, [type]);
  }

  remove(uuid) {
    return db.exec(DELETE_SQL, [uuid]);
  }

  update(uuid, data) {
    return db.exec(UPDATE_SQL, [data, uuid]);
  }
}

module.exports = ReportManager;
