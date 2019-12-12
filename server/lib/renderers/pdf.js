/**
 * @description
 * This service is responsible for producing PDFs on the server, it accepts
 * handlebar templates and uses the html renderer to produce valid HTML - then
 * streaming this through the puppeteer application to produce PDFs.
 *
 * @requires debug
 * @requires lodash
 * @requires puppeteer
 */

const debug = require('debug')('renderer:pdf');
const pptr = require('puppeteer');
const _ = require('lodash');

const pptrOptions = {
  headless : true,
  args : [
    '--bwsi',
    '--disable-default-apps',
    '--disable-dev-shm-usage',
    '--disable-setuid-sandbox',
    '--hide-scrollbars',
    '--disable-web-security',
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
  preferCSSPageSize : true,
  showHeaderFooter : true,
  headerTemplate : '<h1>THIS IS A TEST header</h1>',
  footerTemplate : '<h1>THIS IS A TEST footer</h1>',
};

exports.defaultReportOptions = defaultReportOptions;

// standard specification for point of sale receipts
exports.posReceiptOptions = {
  width : '72mm',
  height : '290mm',
  margin : {
    left : '0mm',
    right : '0mm',
    bottom : '0mm',
    top : '0mm',
  },
  landscape : false,
};

// smaller format for providing identifications/ receipts with reduced information
exports.reducedCardOptions = {
  width : '75mm', // 2.95in
  height : '125mm', // 4.92.in
  margin : {
    left : '5mm', // 0.20in
    right : '5mm', // 0.20in
    top : '5mm', // 0.20in
    bottom : '5mm', // 0.20in
  },
  landscape : true,
};

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

  const inlinedHtml = await html.render(context, template, options);

  // pick options relevant to rendering PDFs
  const pdfOptions = _.pick(options, [
    'path', 'format', 'width', 'height', 'margin',
    'headerTemplate', 'footerTemplate', 'pageRanges', 'printBackground',
    'showHeaderFooter', 'preferCSSPageSize',
  ]);

  debug('passing rendered HTML to chromium for PDF rendering.');
  const browser = await pptr.launch(pptrOptions);

  debug('Chromium launched.  Creating a new page.');
  const page = await browser.newPage();

  debug('Page created.  Rendering HTML content on page.');
  await page.setContent(inlinedHtml.trim());

  debug('Rendering PDF with chromium');
  const pdf = await page.pdf(pdfOptions);

  debug('PDF created with chromium.  Shutting the browser down.');
  await browser.close();

  return pdf;
}
