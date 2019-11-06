/**
 * @description
 * This service is responsible for producing PDFs on the server, it accepts
 * handlebar templates and uses the html renderer to produce valid HTML - then
 * streaming this through the puppeteer application to produce PDFs.
 *
 * @requires puppeteer
 * @requires lodash
 * @requires stream-to-promise
 * @requires path
 * @requires q
 * @requires process
 * @requires debug
 */

const _ = require('lodash');
const path = require('path');
const process = require('process');
const debug = require('debug')('renderer:pdf');
const { inlineSource } = require('inline-source');
const pptr = require('puppeteer');

const pptrOptions = {
  headless : true,
  args : [
    '--bwsi',
    '--disable-default-apps',
    '--disable-dev-shm-usage',
    '--disable-setuid-sandbox',
    '--no-sandbox',
  ],
};

const html = require('./html');

const headers = {
  'Content-Type' : 'application/pdf',
};

exports.render = renderPDF;
exports.headers = headers;
exports.extension = '.pdf';

// provide uniform default configurations for reports
const defaultReportOptions = {
  pageSize : 'A4',
  orientation : 'portrait',
};

exports.defaultReportOptions = defaultReportOptions;

// standard specification for point of sale receipts
exports.posReceiptOptions = {
  pageWidth : '72mm',
  pageHeight : '290mm',
  marginLeft : '0mm',
  marginRight : '0mm',
  marginBottom : '0mm',
  marginTop : '0mm',
  orientation : 'portrait',
};

// smaller format for providing identifications/ receipts with reduced information
exports.reducedCardOptions = {
  pageWidth : '75mm', // 2.95in
  pageHeight : '125mm', // 4.92.in
  marginLeft : '5mm', // 0.20in
  marginRight : '5mm', // 0.20in
  marginTop : '5mm', // 0.20in
  marginBottom : '5mm', // 0.20in
  orientation : 'landscape',
};

/**
 * @function getNodeModulesPath
 *
 * @description
 * This function returns the node_modules path, no matter where this file
 * lies by using node's underlying require() algorithm.
 *
 * @return {string} the node_modules path
 */
function getNodeModulesPath() {
  const isWin = process.platform === 'win32';
  const barcodePath = require.resolve('jsbarcode');
  const [nodeModulesDir] = barcodePath.split(isWin ? 'node_modules\\' : 'node_modules/');
  return path.join(nodeModulesDir, 'node_modules');
}

/**
 * @function renderPDF
 *
 * @description
 * Takes in a context, template, and options before merging them and making an
 * HTML file out of the result.  The HTML file is passed to puppeteer for
 * rendering as a PDF.
 *
 * @param {Object} context    Object of keys and values that will be made available to the handlebar template
 * @param {String} template   Path to a handlebars template
 * @returns {Promise}         Promise resolving in compiled PDF
 */
async function renderPDF(context, template, options = {}) {
  debug('received render request for PDF file. Passing to HTML renderer.');

  _.defaults(options, defaultReportOptions);
  const opts = handleOptions(options);

  // pdf requires absolute path to be passed to templates to be picked up by puppeteer on windows
  context.absolutePath = path.join(process.cwd(), 'client');
  context.nodeModulesPath = getNodeModulesPath();

  const htmlStringResult = await html.render(context, template, opts);
  const inlinedHtml = await inlineSource(htmlStringResult, { attribute : false, rootpath : '/', compress : false });

  // pick options relevant to rendering PDFs
  const pdfOptions = _.pick(opts, [
    'path', 'format', 'landscape', 'width', 'height', 'margin',
    'headerTemplate', 'footerTemplate', 'pageRanges',
    'printBackground', 'displayHeaderFooter',
  ]);

  debug('passing rendered HTML to chromium for PDF rendering.');
  const browser = await pptr.launch(pptrOptions);

  debug('Chromium launched.  Creating a new page.');
  const page = await browser.newPage();

  debug('Page created.  Rendering HTML content on page.');
  await page.setContent(inlinedHtml);

  debug('Rendering PDF with chromium');
  const pdf = await page.pdf(pdfOptions);

  debug('PDF created with chromium.  Shutting the browser down.');
  await browser.close();

  return pdf;
}


/**
 * @function handleOptions
 *
 * @description
 * Figures out what orientation to render the document based on the
 * options sent from the client.
 */
function handleOptions(options) {
  options.landscape = !!((options.orientation && options.orientation === 'landscape'));
  return options;
}
