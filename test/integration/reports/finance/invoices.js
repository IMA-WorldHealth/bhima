const RenderingTests = require('../rendering');
const target = '/reports/finance/invoices';

describe(`(${target}) Invoice Report`, RenderingTests(target));
