const RenderingTests = require('../rendering');

const target = '/reports/finance/creditors/aged';
const options = {
  fiscal_id : 4,
  period_id : 201802,
  currency_id : 2,
  enterprise_id: 1,
};

describe(`(${target}) Aged Creditors`, RenderingTests(target, null, options));
