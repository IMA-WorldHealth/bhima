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

'use strict';

const path = require('path');
const exphbs = require('express-handlebars');

const math = require('./helpers/math');
const dates = require('./helpers/dates');
const finance = require('./helpers/finance');

const hbs = exphbs.create({
  helpers : {
    date : dates.date,
    timestamp : dates.timestamp,
    age : dates.age,
    mulitply : math.multiply,
    sum : math.sum,
    add : math.add,
    currency : finance.currency,
  },

  // load partials from the partials sub-directory
  partialsDir : path.join(__dirname, 'partials/'),
});

module.exports  = hbs;
