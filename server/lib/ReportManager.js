/**
 * @overview ReportManager
 *
 * @description
 * The report manager is a wrapper for bhima's reporting capabilities, providing
 * easy ways to create JSON/HTML/PDF reports from templates and data.
 *
 * @todo - allow reports to be saved using the report manager.
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

const BadRequest = require('./errors/BadRequest');
const db = require('./db');

const renderers = {
  json : require('./renderers/json'),
  html : require('./renderers/html'),
  pdf  : require('./renderers/pdf')
};

const defaults = {
  pageSize: 'A4',
  orientation: 'portrait',
  lang: 'en',
  renderer: 'pdf'
};


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
      return { headers: renderer.headers, report };
    });
  }

  /**
   * @method save
   *
   * @description
   * This method saves the report in the report directory to be looked up later.
   */
  save(report, fpath, options) {
    const dfd = q.defer();
    const parts = path.parse(fpath);
    const sql = 'INSERT INTO report VALUES ?;';

    mkdirp(parts.dir, (err) => {
      if (err) { return dfd.reject(err); }

      const fname = parts.name + parts.ext;

      fs.writeFile(fname, report, (err) => {
        if (err) { return dfd.reject(err); }

        const data = {
          uuid : parts.name,
          title : options.title,
          type : options.type,
          link : fpath,
          timestamp : new Date(),
          user_id : options.user.id
        };

        db.exec(sql, [data])
          .then(dfd.resolve)
          .catch(dfd.reject);
      });
    });

    return dfd.promise;
  }
}

module.exports = ReportManager;
