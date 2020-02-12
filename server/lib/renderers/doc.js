/**
 * @description
 * This library is just a shim to ensure API uniformity with other renderers.
 * it renders an Word report from html.
 * @module lib/renderers/xls
 * @requires juice
 */

const html = require('./html');

const headers = {
  'Content-Type' : 'application/vnd.ms-word;charset=utf-8',
};

exports.render = render;
exports.extension = '.doc';
exports.headers = headers;

async function render(data, template, options) {
  const htmlString = await html.render(data, template, options);
  return Buffer.from(htmlString, 'utf8');
}
