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
const presentation = require('./helpers/presentation');

const hbs = exphbs.create({
  helpers : {
    date          : dates.date,
    month         : dates.month,
    timestamp     : dates.timestamp,
    age           : dates.age,
    multiply      : math.multiply,
    sum           : math.sum,
    add           : math.add,
    substract     : math.substract,
    currency      : finance.currency,
    numberToText  : finance.numberToText,
    indentAccount : finance.indentAccount,
    percentage    : finance.percentage,

    debcred       : finance.debcred,
    precision     : finance.precision,
    lessZero      : finance.lessZero,
    look          : objects.look,
    equal         : logic.equal,
    gt            : logic.gt,
    lt            : logic.lt,
    between       : logic.between,
    inequal       : logic.inequal,
    fileExist     : logic.fileExist,
    absolute      : math.absolute,
    getIncomeExpenseTitle : presentation.getTitle,
    isIncomeViewable : presentation.isIncomeViewable,
    isExpenseViewable : presentation.isExpenseViewable,
    isResultViewable : presentation.isResultViewable,
    slashed       : presentation.slashed,
    ignoreNan : logic.ignoreNan,
  },

  // load partials from the partials sub-directory
  partialsDir : path.join(__dirname, 'partials/'),
});

module.exports = hbs;
