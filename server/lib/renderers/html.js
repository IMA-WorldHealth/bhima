/**
 * @overview lib/renderers/html
 *
 * @description
 * This service is responsible for compiling valid HTML documents given a path
 * to a handlebars template.
 *
 * @requires express-handlebars
 * @requires server/lib/template
 * @requires server/lib/util
 * @requires moment
 * @requires debug
 */
const util = require('../util');
const hbs = require('../template');
const moment = require('moment');
const translateHelperFactory = require('../helpers/translate');
const debug = require('debug')('renderers:html');

const headers = {
  'Content-Type' : 'text/html',
};

exports.render = renderHTML;
exports.extension = '.html';
exports.headers = headers;
/**
 *
 * @param {Object} data     Object of keys and values that will be made available to the template
 * @param {String} template Path to a handlebars template
 * @param {Object} options  The default options, including language setting
 * @returns {Promise}       Promise resolving in a rendered template (HTML)
 */
function renderHTML(data, template, options = {}) {
  debug(`initializing ${options.lang} date locale`);
  // load local language for momentjs if possible
  const languageDependency = `moment/locale/${options.lang}`;
  util.loadModuleIfExists(languageDependency);

  moment.locale(options.lang);

  debug(`initializing ${options.lang} translation locale`);
  // make sure that we have the appropriate language set.  If options.lang is
  // not specified, will default to English.  To change this behavior, see the
  // factory code.
  const translate = translateHelperFactory(options.lang);
  hbs.helpers.translate = translate;

  debug(`rendering HTML file`);
  return hbs.render(template, data);
}
