const RenderingTests = require('../rendering');
const target = '/reports/finance/creditors/aged';

describe(`(${target}) Aged Creditors`, RenderingTests(target));
