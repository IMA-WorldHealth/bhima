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
const fs = require('fs');
const debug = require('debug')('renderer:pdf');

const html = require('./html');
const resources = require('./resources');

const headers = {
  'Content-Type' : 'application/pdf',
};

// load scripts and styles
const { dbStyles, dbScripts } = environmentStyleAndScripts();

// pptr options
const pptrOptions = {
  headless : true,
  args : [
    '--no-sandbox',
    '--disable-web-security',
    '--disable-gpu',
    '--hide-scrollbars',
    '--disable-setuid-sandbox',
  ],
};
// todo: close the browser correctly
const browserPromise = pptr.launch(pptrOptions);

// provide uniform default configurations for reports
const defaultReportOptions = {
  margin : {
    top : '5mm',
    left : '5mm',
    bottom : '5mm',
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
    bottom : '0mm',
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
    bottom : '5mm',
    right : '5mm',
  },
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
function renderPDF(context, template, opts = {}) {
  const options = handleOption(opts);
  debug('received render request for PDF file. Passing to HTML renderer.');

  return html.render(context, template, options)
    .then((htmlStringResult) => {
      // pick options relevant to rendering PDFs
      const _options = _.pick(options, [
        'path', 'format', 'landscape', 'width', 'height', 'margin',
        'headerTemplate', 'footerTemplate', 'pageRanges',
        'printBackground', 'displayHeaderFooter',
      ]);

      const pdfOptions = Object.assign(defaultReportOptions, _options);
      debug('passing rendered HTML to puppeteer.');

      // pass the compiled html string to puppeteer pdf generator
      return pdfGenerator(htmlStringResult, pdfOptions);
    });
}

async function pdfGenerator(htmlString, options = {}) {
  const browser = await browserPromise;
  const page = await browser.newPage();
  await page.setContent(htmlString);

  // include styles
  for (let i = 0; i < dbStyles.length; i++) {
    const content = dbStyles[i];
    // eslint-disable-next-line no-await-in-loop
    await page.addStyleTag({ content : content.toString() });
  }

  // include scripts
  for (let i = 0; i < dbScripts.length; i++) {
    const content = dbScripts[i];
    // eslint-disable-next-line no-await-in-loop
    await page.addScriptTag({ content : content.toString() });
  }

  const pdf = await page.pdf(options);
  return pdf;
}

function handleOption(options) {
  options.landscape = !!((options.orientation && options.orientation === 'landscape'));
  return options;
}

function environmentStyleAndScripts() {
  const styles = resources.cssPaths.map(cssPath => {
    return fs.readFileSync(cssPath);
  });
  const scripts = resources.jsPaths.map(jsPath => {
    return fs.readFileSync(jsPath);
  });
  return { dbStyles : styles, dbScripts : scripts };
}
