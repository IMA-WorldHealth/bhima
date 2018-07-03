const RenderingTests = require('../rendering');

const target = '/reports/finance/cashflow/services';
const params = { cashboxId : 1, dateFrom : new Date('2010-01-01'), dateTo : new Date() };
describe(`(${target}) CashFlow By Service Report`, RenderingTests(target, null, params));
