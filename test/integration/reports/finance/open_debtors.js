const RenderingTests = require('../rendering');
const target = '/reports/finance/debtors/open';

describe(`(${target}) Open Debtors`, RenderingTests(target));
