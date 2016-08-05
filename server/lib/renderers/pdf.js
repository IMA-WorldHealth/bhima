/**
 * @description
 * This service is responsible for producing PDFs on the server, it accepts handlebar templates and uses the html
 * renderer to produce valid HTML - then streaming this through the wkhtmltopdf application to produce PDFs.
 *
 * @requires wkhtmltopdf
 * @requires stream-to-promise
 * @requires path
 * @requires q
 * @requires process
 */
'use strict';
const wkhtmltopdf     = require('wkhtmltopdf');
const q               = require('q');
const streamToPromise = require('stream-to-promise');
const process         = require('process');
const path            = require('path');

const html = require('./html');

const headers = {
  'Content-Type' : 'application/pdf'
};

exports.render = renderPDF;
exports.headers = headers;

/**
 *
 * @param {Object} context    Object of keys and values that will be made available to the handlebar template
 * @param {String} template   Path to a handlebars template
 * @returns {Promise}         Promise resolving in compiled PDF
 */
function renderPDF(context, template, options) {
  options = options || {};

  // pdf requires absolute path to be passed to templates to be picked up by wkhtmltopdf on windows
  context.absolutePath = path.join(process.cwd(), 'client');

  return html.render(context, template, options)
    .then(function (htmlStringResult) {

      // only apply specific options for now
      var pageSize = options.pageSize || 'A4';
      var orientation = options.orientation || 'portrait';
      var pdfOptions = { pageSize, orientation };

      // pass the compiled html string to the wkhtmltopdf process, this is just a wrapper for the CLI utility
      let pdfStream = wkhtmltopdf(htmlStringResult, pdfOptions);

      // this promise will only be resolved once the stream 'end' event is fired - with this implementation this will not allow the client to
      // receive chunks of data as they are available
      return streamToPromise(pdfStream);
    });
}
