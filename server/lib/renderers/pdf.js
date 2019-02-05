/**
 * @description
 * This service is responsible for producing PDFs on the server, it accepts
 * handlebar templates and uses the html renderer to produce valid HTML - then
 * streaming this through the puppeteer application to produce PDFs.
 *
 * @requires puppeteer
 * @requires ./resources
 * @requires lodash
 * @requires process
 * @requires debug
 */

const pptr = require('puppeteer');
const _ = require('lodash');
const debug = require('debug')('rendrers:pdf');
const html = require('./html');

const {
  stylesheets,
  javascripts,
  defaultReportOptions,
  posReceiptOptions,
  reducedCardOptions,
} = require('./resources');

const headers = {
  'Content-Type' : 'application/pdf',
};

// pptr options
const pptrOptions = {
  headless : true,
  args : ['--disable-dev-shm-usage'],
};


exports.render = renderPDF;
exports.headers = headers;
exports.extension = '.pdf';

exports.defaultReportOptions = defaultReportOptions;
exports.posReceiptOptions = posReceiptOptions;
exports.reducedCardOptions = reducedCardOptions;

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
async function renderPDF(context, template, opts = {}) {
  const options = handleOption(opts);

  debug('rendering report to HTML string.');
  const htmlStringResult = await html.render(context, template, options);

  // pick options relevant to rendering PDFs
  const _options = _.pick(options, [
    'path', 'format', 'landscape', 'width', 'height', 'margin',
    'headerTemplate', 'footerTemplate', 'pageRanges',
    'printBackground', 'displayHeaderFooter',
  ]);

  const pdfOptions = Object.assign(defaultReportOptions, _options);

  debug('passing HTML string to PDF generator.');
  // pass the compiled html string to puppeteer pdf generator
  return pdfGenerator(htmlStringResult, pdfOptions);
}

async function pdfGenerator(htmlString, options = {}) {
  debug('launching headless chromium to render the pdf');

  const browser = await pptr.launch(pptrOptions);

  debug('Chromium launched.  Creating a new page.');
  const page = await browser.newPage();

  debug('Page created.  Rendering HTML content on page.');
  await page.setContent(htmlString);

  // include styles and javascript
  const styles = stylesheets.map(content => page.addStyleTag({ content }));
  const scripts = javascripts.map(content => page.addScriptTag({ content }));

  debug('HTML rendered in chromium context.  Adding stylesheets and script tags.');
  await Promise.all(styles);
  await Promise.all(scripts);

  debug('Styles and scripts loaded.  Rendering page to PDF.');
  const pdf = await page.pdf(options);

  debug('PDF created with chromium.  Shutting the browser down.');
  await browser.close();

  return pdf;
}

/**
 * @function handleOption
 *
 * @description
 * Figures out what orientation to render the document based on the
 * options sent from the client.
 */
function handleOption(options) {
  options.landscape = !!((options.orientation && options.orientation === 'landscape'));
  return options;
}
