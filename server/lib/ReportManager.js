/* eslint global-require:off */
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
 * @requires lodash
 * @requires path
 * @requires fs
 * @requires q
 * @requires uuid/v4
 * @requires lib/helpers/translate
 * @requires lib/errors/BadRequest
 * @requires lib/errors/InternalServerError
 * @requires lib/db
 */

const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const q = require('q');
const uuid = require('uuid/v4');
const translateHelper = require('./helpers/translate');
const util = require('../lib/util');

const BadRequest = require('./errors/BadRequest');
const InternalServerError = require('./errors/InternalServerError');
const db = require('./db');

// renderers
const renderers = {
  json : require('./renderers/json'),
  html : require('./renderers/html'),
  pdf  : require('./renderers/pdf'),
  csv  : require('./renderers/csv'),
  xlsx  : require('./renderers/xlsx'),
  xlsxReceipt : require('./renderers/xlsxReceipt'),
};

// default report configuration
const defaults = {
  pageSize : 'A4',
  orientation : 'portrait',
  lang : 'en',
  renderer : 'pdf',
};

// Constants
const SAVE_DIR = path.resolve(path.join(__dirname, '../reports/'));

const SAVE_SQL = `
  INSERT INTO saved_report SET ?;
`;


// Class Declaration

class ReportManager {
  /**
   * @constructor
   *
   * @description
   * The ReportManager takes in a template path information and rendering
   * options.  It returns an instance of the report manager, ready to be
   * prepared with session data and rendered with data.
   *
   * @param {String} templatePath - the path to the template file
   * @param {Object} metadata - any metadata that needs to appear in the report
   * @param {Object} options - rendering + default options for the report
   */
  constructor(templatePath, metadata, options) {
    this.options = _.clone(options || {});

    // merge options into default options
    _.defaults(this.options, defaults);

    // default to the session user
    if (metadata && metadata.user) {
      this.options.user = metadata.user;
    }

    // normalize the path for different operating systems
    this.template = path.normalize(templatePath);

    // set the renderer based on the provided options
    this.renderer = renderers[this.options.renderer || this.defaults.renderer];

    if (!this.renderer) {
      throw new BadRequest(
        `The application does not support rendering ${options.renderer}.`,
        'ERRORS.INVALID_RENDERER'
      );
    }

    // @TODO user information could be determined by report manager, removing the need for this check
    if (this.options.saveReport && !this.options.user) {
      const invalidSaveDescription = 'Report cannot be saved without providing a `user` entity to ReportManager';
      throw new InternalServerError(invalidSaveDescription);
    }

    // remove render-specific options
    delete options.renderer;
    delete options.csvKey;
    delete options.filename;
    delete options.lang;

    // set the metadata
    this.metadata = metadata;
    delete this.metadata.path;
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
    const { metadata, renderer } = this;

    // set the render timestamp
    metadata.timestamp = new Date();

    // prune extraneous paths
    delete metadata.paths;

    // @TODO fit this better into the code flow
    // sanitise save report option
    this.options.saveReport = Boolean(Number(this.options.saveReport));

    // merge the data object before templating
    _.merge(data, { metadata });

    // some reports(Excel,..) require renaming result's column names
    // so, util.renameKeys can help to solve this problem
    const { displayNames, renameKeys } = this.options;

    const rowsToRename = data.rows || data[this.options.rowsDataKey];

    data.rows = (renameKeys) ? util.renameKeys(rowsToRename, displayNames) : data.rows;
    //
    // render the report using the stored renderer
    const promise = renderer.render(data, this.template, this.options);

    // send back the headers and report
    return promise.then(reportStream => {
      this.stream = reportStream;

      const renderHeaders = renderer.headers;
      const report = reportStream;
      if (this.options.filename) {
        const translate = translateHelper(this.options.lang);
        const translatedName = translate(this.options.filename);
        const fileDate = (new Date()).toLocaleDateString();
        const formattedName = `${translatedName} ${fileDate}`;
        renderHeaders['Content-Disposition'] = `filename=${formattedName}${renderer.extension}`;
        renderHeaders.filename = `${formattedName}${renderer.extension}`;
      }

      // FIXME this branching logic should be promised based
      if (this.options.saveReport) {
        // FIXME This is not correctly deferred
        // FIXME PDF report is sent back to the client even though this is a save operation
        // FIXME Errors are not propagated
        return this.save()
          .then(() => {
            return { headers : renderHeaders, report };
          });
      }
      return { headers : renderHeaders, report };
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
    const reportId = uuid();
    const { options } = this;

    // make the report name using the
    const fname = reportId + this.renderer.extension;
    const link = path.join(SAVE_DIR, fname);

    const data = {
      uuid : db.bid(reportId),
      label : options.label,
      link,
      timestamp : new Date(),
      user_id : options.user.id,
      report_id : options.reportId,
    };

    fs.writeFile(link, this.stream, (err) => {
      if (err) { return dfd.reject(err); }

      return db.exec(SAVE_SQL, data)
        .then(() => dfd.resolve({ uuid : reportId }))
        .catch(dfd.reject)
        .done();
    });

    return dfd.promise;
  }
}

module.exports = ReportManager;
