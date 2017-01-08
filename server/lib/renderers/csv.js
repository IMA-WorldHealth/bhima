'use strict';

/**
 * @overview lib/renderers/csv
 *
 * @description
 * This library is used to render CSV data from UI-Grids.  The user experience
 * will be similar to using the print to pdf renderers, except it will allow
 * downloading as a comma separated file to the client.
 *
 * @requires q
 * @requires lodash
 * @requires json2csv
 */

const q = require('q');
const _ = require('lodash');
const converter = require('json-2-csv');

const headers = {
  'Content-Type' : 'text/csv',
  'Content-Disposition': 'attachment; filename=download.csv'
};

// CSV rendering defaults
const defaults = {
  trimHeaderFields : true
};

// this field will tell the csv renderer what to render
const DEFAULT_DATA_KEY = 'csv';

exports.extension = '.csv';
exports.render = renderCSV;
exports.headers = headers;

/**
 *
 * @param {Object} data     Object of keys/values for the data
 * @param {String} template Path to a handlebars template
 * @param {Object} options  The default options to be extended and passed to renderer
 * @returns {Promise}       Promise resolving in a rendered dataset (CSV)
 */
function renderCSV(data, template, options) {

  // this will be returned to the promise chain with the rendered csv results
  const dfd = q.defer();

  // allow different server routes to pass in csvOptions
  const csvOptions = _.defaults(options.csvOptions, defaults);

  const csvData = data[options.csvKey || DEFAULT_DATA_KEY];

  // render the data array csv as needed
  converter.json2csv(csvData, (error, csv) => {
    if (error) { return dfd.reject(error); }
    dfd.resolve(csv);
  }, csvOptions);

  // return the promise
  return dfd.promise;
}
