/**
 * @overview template
 *
 * @description
 * This service is a wrapper for the express handlebars library. It sets the
 * required configuration options and imports helpers from subdirectories for
 * use in the templates.
 *
 * @requires path
 * @requires express-handlebars
 *
 * @returns {Function} handlebars render method, accepting a template and a
 *   context.
 */


const path = require('path');
const exphbs = require('express-handlebars');

const math = require('./helpers/math');
const dates = require('./helpers/dates');
const finance = require('./helpers/finance');
const objects = require('./helpers/objects');
const logic = require('./helpers/logic');

const hbs = exphbs.create({
  helpers : {
    date          : dates.date,
    timestamp     : dates.timestamp,
    age           : dates.age,
    multiply      : math.multiply,
    sum           : math.sum,
    add           : math.add,
    substract     : math.substract,
    currency      : finance.currency,
    numberToText  : finance.numberToText,
    indentAccount : finance.indentAccount,
    look          : objects.look,
    equal         : logic.equal,
    gt            : logic.gt,
    lt            : logic.lt,
  },

  // load partials from the partials sub-directory
  partialsDir : path.join(__dirname, 'partials/'),
});

module.exports = hbs;
