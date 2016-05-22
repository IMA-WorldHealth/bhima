/**
 * @description
 * This service is responsible for compiling valid HTML documents given a path to a handlebars template
 * 
 * @requires express-handlebars
 * @requires server/lib/template
 */
'use strict';
const exhbs = require('express-handlebars');

const hbs = require('./../template');

exports.render = renderHTML;

/**
 * 
 * @param {Object} data     Object of keys and values that will be made available to the template
 * @param {String} template Path to a handlebars template
 * @returns {Promise}       Promise resolving in a rendered template (HTML)
 */
function renderHTML(data, template) {
  return hbs.render(template, data);
}
