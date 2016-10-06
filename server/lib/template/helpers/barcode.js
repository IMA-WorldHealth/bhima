const Barcode = require('jsbarcode');
const Canvas = require('canvas');

const defaults = {
  displayValue : false,
};

function barcode(text) {
  if (!text) { return ''; }

  let canvas = new Canvas();
  Barcode(canvas, text, defaults);
  return canvas.toDataURL();
}

module.exports = barcode;
