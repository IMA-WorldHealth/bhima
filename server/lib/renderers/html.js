/**
 * @overview lib/renderers/html
 *
 * @description
 * This service is responsible for compiling valid HTML documents given a path
 * to a handlebars template.
 *
 * @requires moment
 * @requires process
 * @requires path
 * @requires inline-source
 * @requires debug
 * @requires server/lib/template
 * @requires server/lib/util
 */
const moment = require('moment');
const process = require('process');
const debug = require('debug')('renderers:html');
const { inlineSource } = require('inline-source');
const path = require('path');
const util = require('../util');
const hbs = require('../template');
const translateHelperFactory = require('../helpers/translate');
const finance = require('../template/helpers/finance');

const headers = {
  'Content-Type' : 'text/html',
};

exports.render = renderHTML;
exports.extension = '.html';
exports.headers = headers;

/**
 * @function getNodeModulesPath
 *
 * @description
 * This function returns the node_modules path, no matter where this file
 * lies by using node's underlying require() algorithm.
 *
 * @return {string} the node_modules path
 */
function getNodeModulesPath() {
  const isWin = process.platform === 'win32';
  const barcodePath = require.resolve('jsbarcode');
  const [nodeModulesDir] = barcodePath.split(isWin ? 'node_modules\\' : 'node_modules/');
  return path.join(nodeModulesDir, 'node_modules');
}

/**
 *
 * @param {Object} data     Object of keys and values that will be made available to the template
 * @param {String} template Path to a handlebars template
 * @param {Object} options  The default options, including language setting
 * @returns {Promise}       Promise resolving in a rendered template (HTML)
 */
async function renderHTML(data, template, options = {}) {
  debug(`initializing ${options.lang} date locale`);
  // load local language for momentjs if possible
  const languageDependency = `moment/locale/${options.lang}`;
  util.loadModuleIfExists(languageDependency);

  moment.locale(options.lang);

  // inlining assets requires absolute path to be passed to templates
  data.absolutePath = path.join(process.cwd(), 'client');
  data.nodeModulesPath = getNodeModulesPath();

  debug(`initializing ${options.lang} translation locale`);
  // make sure that we have the appropriate language set.  If options.lang is
  // not specified, will default to English.  To change this behavior, see the
  // factory code.
  const translate = translateHelperFactory(options.lang);
  hbs.helpers.translate = translate;

  // NOTE(@jniles) - if the file is an XLS file that is being converted to
  // excel, we don't do anything for the currency besides returning it.
  if (options.skipCurrencyRendering) {
    hbs.helpers.currency = finance.currencyWithoutSymbol;
    hbs.helpers.debcred = finance.currencyWithoutSymbol;
  }

  debug(`rendering HTML file`);

  const html = await hbs.render(template, data);
  return inlineSource(html, { attribute : false, rootpath : '/', compress : false });
}
