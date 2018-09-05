/**
 * @description
 * This library is just a shim to ensure API uniformity with other renderers.
 * it renders an Excel report from html.
 * @module lib/renderers/xls
 * @requires juice
 */
const juice = require('juice');
const html = require('./html');

const headers = {
  'Content-Type' : 'application/vnd.ms-excel;charset=utf-8',
};

exports.render = render;
exports.extension = '.xls';
exports.headers = headers;


async function render(data, template, options) {
  const htmlStream = await html.render(data, template, options);
  const htmlString = juice(htmlStream);
  return Buffer.from(htmlString, 'utf8');
}
