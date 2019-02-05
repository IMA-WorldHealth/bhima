/**
 * @overview resources.js
 *
 * @description
 * This file contains resources for the PDF renderer.  Since headless chromium
 * cannot read scripts from hrefs/src attributes, we must inject the full scripts
 * into the browser.
 */

const fs = require('fs');
const debug = require('debug')('renders:resources');

const styles = [
  'client/vendor/components-font-awesome/css/font-awesome.css',
  'client/css/bhima-bootstrap.css',
  'client/css/bhima-pdf.min.css',
];

const scripts = [
  'client/vendor/JsBarcode.all.min.js',
  'client/js/plugins/plugins.concat.js',
];

// TODO(@jniles): this try/catch exists for unit tests.  Should we be passing in an environmental
// switch to avoid this case? (e.g. RENDERS_IGNORE_MISSING_SCRIPTS) or something?  Or should we
// figure out how to minify out how to call this initialisation only when necessary...?
let stylesheets;
let javascripts;

try {
  stylesheets = styles.map(file => fs.readFileSync(file, 'utf8'));
  javascripts = scripts.map(file => fs.readFileSync(file, 'utf8'));
} catch (e) {
  debug('Could not load scripts and stylesheets!');

  stylesheets = [];
  javascripts = [];
}

module.exports = { stylesheets, javascripts };

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

module.exports.defaultReportOptions = defaultReportOptions;
module.exports.posReceiptOptions = posReceiptOptions;
module.exports.reducedCardOptions = reducedCardOptions;
