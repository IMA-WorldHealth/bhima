const RenderingTests = require('../rendering');

const target = '/reports/finance/debtors/aged';
const options = {
  period_id : 201802,
};

describe(`(${target}) Aged Debtors`, RenderingTests(target, null, options));
