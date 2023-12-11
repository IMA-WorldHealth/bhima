const RenderingTests = require('../rendering');

const target = '/reports/finance/cashflow/services';
const params = { cashboxId : 1, dateFrom : new Date('2010-01-01'), dateTo : new Date() };
describe(`test/integration${target} Cash Flow Report`, RenderingTests(target, null, params));
