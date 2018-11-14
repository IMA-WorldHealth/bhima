/**
 * This file contains path to assets location (css, js, etc.)
 * relative to the bin/ folder
 */

module.exports = {
  // an array of style paths to include in html template
  cssPaths : [
    'client/css/bhima-bootstrap.css',
    'client/vendor/components-font-awesome/css/font-awesome.css',
  ],

  // an array of script paths to include in the html template
  jsPaths : [
    'client/vendor/JsBarcode.all.min.js',
    'client/js/plugins/plugins.concat.js',
  ],
};
