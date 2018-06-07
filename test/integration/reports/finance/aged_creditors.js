const RenderingTests = require('../rendering');

const target = '/reports/finance/creditors/aged';
const options = {
  period_id : 201802,
};

describe(`(${target}) Aged Creditors`, RenderingTests(target, null, options));
