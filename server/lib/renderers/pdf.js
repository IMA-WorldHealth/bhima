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

const pptr = require('puppeteer');
const _ = require('lodash');
const path = require('path');
const process = require('process');
const debug = require('debug')('renderer:pdf');

const html = require('./html');
const resources = require('./resources');

const headers = {
  'Content-Type' : 'application/pdf',
};

exports.render = renderPDF;
exports.headers = headers;
exports.extension = '.pdf';

// provide uniform default configurations for reports
exports.defaultReportOptions = {
  format : 'A4',
  margin : {
    top : '5mm',
    left : '5mm',
    bottom : '5mm',
    right : '5mm',
  },
};

// standard specification for point of sale receipts
exports.posReceiptOptions = {
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
exports.reducedCardOptions = {
  width : '75mm',
  height : '125mm',
  margin : {
    top : '5mm',
    left : '5mm',
    bottom : '5mm',
    right : '5mm',
  },
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
function renderPDF(context, template, opts = {}) {
  // convert option into puppeteer format
  const options = convertOptions(opts);

  debug('received render request for PDF file. Passing to HTML renderer.');

  return html.render(context, template, options)
    .then((htmlStringResult) => {
      // pick options relevant to rendering PDFs
      const _options = _.pick(options, [
        'path', 'format', 'landscape', 'width', 'height', 'margin',
        'headerTemplate', 'footerTemplate', 'pageRanges',
        'printBackground', 'displayHeaderFooter',
      ]);

      const pdfOptions = _.keys(_options).length ? _options : this.defaultReportOptions;

      debug('passing rendered HTML to puppeteer.');

      // pass the compiled html string to puppeteer pdf generator
      return pdfGenerator(htmlStringResult, pdfOptions);
    });
}

function pdfGenerator(htmlString, options = {}) {
  return pptr.launch().then(async browser => {
    const page = await browser.newPage();
    await page.setContent(htmlString);

    // include styles
    const cssPromiseDb = resources.cssPaths.map(async cssPath => {
      return page.addStyleTag({ path : path.join(process.cwd(), cssPath) });
    });
    await Promise.all(cssPromiseDb);

    // include scripts
    const jsPromiseDb = resources.jsPaths.map(async jsPath => {
      return page.addScriptTag({ path : path.join(process.cwd(), jsPath) });
    });
    await Promise.all(jsPromiseDb);

    const pdf = await page.pdf(options);
    await browser.close();
    return pdf;
  });
}

function convertOptions(options) {
  replaceOption(options, 'pageSize', 'format');
  replaceOption(options, 'pageWidth', 'width');
  replaceOption(options, 'pageHeight', 'height');

  if (options.orientation) {
    options.landscape = (options.orientation === 'landscape');
    delete options.orientation;
  }
  return options;
}

function replaceOption(options, currentOption, finalOption) {
  if (options[currentOption]) {
    options[finalOption] = options[currentOption];
    delete options[currentOption];
  }
}
