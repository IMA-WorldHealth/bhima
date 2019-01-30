/**
 * This file contains path to assets location (css, js, etc.)
 * relative to the bin/ folder
 */

module.exports = {
  // an array of style paths to include in html template
  cssPaths : [
    'client/vendor/components-font-awesome/css/font-awesome.css',
    'client/css/bhima-bootstrap.css',
    'client/css/bhima-pdf.min.css',
  ],

  // an array of script paths to include in the html template
  jsPaths : [
    'client/vendor/JsBarcode.all.min.js',
    'client/js/plugins/plugins.concat.js',
  ],
};
