/* global */
const RenderingTests = require('../rendering');

const target = '/reports/finance/cashflow';
const parameters = { cashboxesIds : [1], dateFrom : new Date('2018-01-01'), dateTo : new Date('2018-12-31') };

const keys = [
  'metadata',
  'incomes',
  'expenses',
  'others',
  'incomeTextKeys',
  'expenseTextKeys',
  'incomeTotalByTextKeys',
  'expenseTotalByTextKeys',
  'otherTotalByTextKeys',
  'incomeTotal',
  'expenseTotal',
  'otherTextKeys',
  'otherTotal',
  'totalPeriodColumn',
];

describe(`(${target}) Cashflow Reports`, RenderingTests(target, keys, parameters));
