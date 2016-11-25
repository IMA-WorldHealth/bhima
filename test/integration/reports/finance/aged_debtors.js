const RenderingTests = require('../rendering');
const target = '/reports/finance/debtors/aged';

describe(`(${target}) Aged Debtors`, RenderingTests(target));
