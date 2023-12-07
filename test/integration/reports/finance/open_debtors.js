const RenderingTests = require('../rendering');
const target = '/reports/finance/debtors/open';
const options = {
  currencyId : 1,
};

describe(`test/integration  (${target}) Rendering`, RenderingTests(target, null, options));
