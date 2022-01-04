const RenderingTests = require('../rendering');
const target = '/reports/finance/debtors/open';
const options = {
  currencyId : 1,
};

describe(`(${target}) Open Debtors`, RenderingTests(target, null, options));
