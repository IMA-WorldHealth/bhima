/**
 * @description
 * This library is just a shim to ensure API uniformity with other renderers.
 * it renders an Excel report from html.
 *
 * @module lib/renderers/xls
 */
const html = require('./html');

const headers = {
  'Content-Type' : 'application/vnd.ms-excel;charset=utf-8',
};

exports.render = render;
exports.extension = '.xls';
exports.headers = headers;

async function render(data, template, options) {
  options.skipCurrencyRendering = true;

  /*
  const htmlString = juice(await html.render(data, template, options));

  // NOTE(@jniles)
  // This code replaces the <head></head> contents to avoid CSS <link> errors when
  // opening in MS Excel.
  const start = htmlString.substring(0, htmlString.search('<head>'));
  const end = htmlString.substring(htmlString.search('</head>') + 7);

  const tmpl = `${start}${end}`;
  */
  const tmpl = await html.render(data, template, options);

  return Buffer.from(tmpl, 'utf-8');
}
