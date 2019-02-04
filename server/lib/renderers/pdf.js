/**
 * @description
 * This service is responsible for producing PDFs on the server, it accepts
 * handlebar templates and uses the html renderer to produce valid HTML - then
 * streaming this through the puppeteer application to produce PDFs.
 *
 * @requires puppeteer
 * @requires lodash
 * @requires fs
 * @requires stream-to-promise
 * @requires path
 * @requires q
 * @requires process
 * @requires debug
 */

const pptr = require('puppeteer');
const _ = require('lodash');
const fs = require('mz/fs');
const debug = require('debug')('app');

const html = require('./html');
const resources = require('./resources');

const headers = {
  'Content-Type' : 'application/pdf',
};

// provide uniform default configurations for reports
const defaultReportOptions = {
  margin : {
    top : '5mm',
    left : '5mm',
    bottom : '10mm',
    right : '5mm',
  },
};

// standard specification for point of sale receipts
const posReceiptOptions = {
  width : '72mm',
  height : '290mm',
  margin : {
    top : '0mm',
    left : '0mm',
    bottom : '5mm',
    right : '0mm',
  },
};

// smaller format for providing identifications/ receipts with reduced information
const reducedCardOptions = {
  width : '75mm',
  height : '125mm',
  margin : {
    top : '5mm',
    left : '5mm',
    bottom : '10mm',
    right : '5mm',
  },
};

// load scripts and styles
const environment = environmentStyleAndScripts();
let styles;
let scripts;

// pptr options
let browser;
const pptrOptions = {
  headless : true,
  args : ['--disable-dev-shm-usage'],
};
const browserPromise = pptr.launch(pptrOptions)
  .then(async _browser => {
    // process styles and scripts when the browser is launched
    styles = await Promise.all(environment.styles);
    scripts = await Promise.all(environment.scripts);

    // add listener on browser close
    const brwsr = addListenerOnBrowserClose(_browser);

    // notify about the pdf service
    debug('PDF service is running');
    return brwsr;
  });

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
function renderPDF(context, template, opts = {}) {
  const options = handleOption(opts);

  return html.render(context, template, options)
    .then((htmlStringResult) => {
      // pick options relevant to rendering PDFs
      const _options = _.pick(options, [
        'path', 'format', 'landscape', 'width', 'height', 'margin',
        'headerTemplate', 'footerTemplate', 'pageRanges',
        'printBackground', 'displayHeaderFooter',
      ]);

      const pdfOptions = Object.assign(defaultReportOptions, _options);
      // pass the compiled html string to puppeteer pdf generator
      return pdfGenerator(htmlStringResult, pdfOptions);
    });
}

function addListenerOnBrowserClose(_browser) {
  // check if browser is closed
  _browser._process.once('close', () => {
    _browser.isClose = true;
  });
  return _browser;
}

async function canRelaunchBrowser(_browser) {
  if (_browser.isClose) {
    // eslint-disable-next-line no-param-reassign
    _browser = await pptr.launch(pptrOptions);
    _browser.isClose = false;
  }
  return _browser;
}

async function pdfGenerator(htmlString, options = {}) {
  browser = await browserPromise;
  browser = await canRelaunchBrowser(browser);

  const page = await browser.newPage();
  await page.setContent(htmlString);

  // include styles
  const stylesheets = styles.map(content => {
    return page.addStyleTag({ content });
  });

  await Promise.all(stylesheets);

  // include scripts
  const scriptsheets = scripts.map(content => {
    return page.addScriptTag({ content });
  });

  await Promise.all(scriptsheets);

  const pdf = await page.pdf(options);
  await page.close();
  return pdf;
}

function handleOption(options) {
  options.landscape = !!((options.orientation && options.orientation === 'landscape'));
  return options;
}

function environmentStyleAndScripts() {
  const stylesPromise = resources.cssPaths.map(path => fs.readFile(path, 'utf8'));
  const scriptsPromise = resources.jsPaths.map(path => fs.readFile(path, 'utf8'));
  return { styles : stylesPromise, scripts : scriptsPromise };
}
